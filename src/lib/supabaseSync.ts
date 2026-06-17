import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../supabaseClient';
import { Project, Indicator, Outcome, Activity, SubActivity, Beneficiary, Issue, Staff, ProjectReflection, ProjectDocument } from '../types';

// Global caches for schema discovery with comprehensive static fallback definitions
const fallbackSchemaColumns: Record<string, string[]> = {
  projects: [
    'id', 'name', 'location', 'owner', 'donor', 'status', 'start_date', 'deadline', 
    'progress', 'budget_approved', 'budget_actual', 'desc', 'note', 'goal', 
    'is_archived', 'archored_by', 'archived_at'
  ],
  project_indicators: [
    'id', 'project_id', 'title', 'target', 'current', 'unit', 'last_updated', 'last_value'
  ],
  project_outcomes: [
    'id', 'project_id', 'title'
  ],
  project_activities: [
    'id', 'project_id', 'title', 'desc', 'pic', 'status', 'start_date', 'due_date', 'progress', 'notes', 'files'
  ],
  beneficiaries: [
    'id', 'name', 'phone', 'gender', 'birth_year', 'location', 'occupation', 'email', 'note', 'registrations'
  ],
  issues: [
    'id', 'title', 'description', 'category', 'project_id', 'activity_id', 'severity', 'status', 
    'date_occurred', 'source_type', 'source_link', 'tags', 'updates'
  ],
  staff: [
    'id', 'name', 'role' // Note: 'status' is excluded by default to prevent PostgREST errors in DBs without status column!
  ],
  project_reflections: [
    'id', 'project_id', 'title', 'type', 'date', 'what_happened', 'what_worked', 'what_didnt', 'lesson', 'next_steps', 'contributor'
  ],
  project_documents: [
    'id', 'project_name', 'category', 'file_name', 'mime_type', 'file_size', 
    'drive_file_id', 'drive_folder_id', 'web_view_link', 'description', 'created_at'
  ],
  project_sub_activities: [
    'id', 'parent_activity_id', 'title', 'desc', 'pic', 'status', 'priority', 'due'
  ]
};

const fallbackSchemaUuidColumns: Record<string, string[]> = {
  projects: ['id'],
  project_indicators: ['id', 'project_id'],
  project_outcomes: ['id', 'project_id'],
  project_activities: ['id', 'project_id'],
  beneficiaries: ['id'],
  issues: ['id', 'project_id', 'activity_id'],
  staff: ['id'],
  project_reflections: ['id', 'project_id'],
  project_sub_activities: ['id', 'parent_activity_id'],
  project_documents: ['id']
};

let schemaColumns: Record<string, string[]> = { ...fallbackSchemaColumns };
let schemaUuidColumns: Record<string, Set<string>> = {};
let isSchemaFetched = false;

// Initialize schemaUuidColumns with fallback lists
for (const [table, cols] of Object.entries(fallbackSchemaUuidColumns)) {
  schemaUuidColumns[table] = new Set(cols);
}

// Deterministic string-to-UUID converter to satisfy strict PostgreSQL uuid data types
function textToUuid(str: string): string {
  if (!str) return str;
  
  // Replace non-hex characters in an existing UUID-like structure so that older cached invalid keys heal automatically
  let sanitized = str.trim().toLowerCase();
  
  // Standard UUID format check (8-4-4-4-12)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(sanitized)) {
    return sanitized;
  }

  // Handle UUIDs containing non-hex characters (e.g. from historical caching containing 'w')
  // By swapping any non-hex character (outside 0-9, a-f) with '0'
  if (sanitized.length === 36 && (sanitized.match(/-/g) || []).length === 4) {
    let clean = '';
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if (char === '-') {
        clean += '-';
      } else if (/[0-9a-f]/i.test(char)) {
        clean += char;
      } else {
        clean += '0'; // heal with '0'
      }
    }
    // Verify it is now matching UUID regex perfectly
    if (uuidRegex.test(clean)) {
      return clean;
    }
  }

  // Simple, fast deterministic hash code generators
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  let hash2 = 17;
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str.charCodeAt(i);
    hash2 = ((hash2 << 5) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const absHash2 = Math.abs(hash2).toString(16).padStart(8, '0');

  // Format as standard xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx UUID v4 compliant string
  const part1 = absHash;
  const part2 = '2026'; // Fixed segment representing system year
  const part3 = '4df0'; // Custom identifier segment representing DFW Indonesia (using '0' instead of 'w' for valid Hexadecimal syntax)
  const part4 = '8' + absHash2.substring(0, 3); // Starts with 8-11 pattern (uuid-conformant variant)
  const part5 = absHash2.substring(3).padEnd(12, 'f');

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.substring(0, 36);
}

// Recursive self-healing wrapper to rescue operations failing on schema discrepancies (e.g. missing columns)
async function safeUpsert(
  tableName: string, 
  item: any, 
  mappingFn: (v: any) => any, 
  retryCount = 0
): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false };
  if (retryCount > 10) {
    console.error(`Exceeded maximum retry count of 10 for table ${tableName}`);
    return { success: false, error: new Error('Max retry limit exceeded') };
  }

  // Generate payload using the corresponding map function
  const dbPayload = mappingFn(item);
  const { error } = await supabase.from(tableName).upsert(dbPayload);

  if (error) {
    const isPgrst204 = error.code === 'PGRST204';
    const isColumnMissing = error.message && (
      error.message.includes("Could not find the '") || 
      (error.message.includes("column") && error.message.includes("does not exist"))
    );

    if (isPgrst204 || isColumnMissing) {
      let missingCol: string | null = null;
      
      const match1 = error.message ? error.message.match(/Could not find the '([^']+)' column/) : null;
      const match2 = error.message ? error.message.match(/column "([^"]+)" of relation/) : null;
      const match3 = error.message ? error.message.match(/column "([^"]+)" does not exist/) : null;
      
      if (match1) missingCol = match1[1];
      else if (match2) missingCol = match2[1];
      else if (match3) missingCol = match3[1];

      if (missingCol) {
        console.warn(`[Self-Healing] Removing column "${missingCol}" from payload/schema cache for table "${tableName}" because it doesn't exist in DB.`);
        
        // Remove missing column from schemaColumns
        const currentCols = schemaColumns[tableName] || fallbackSchemaColumns[tableName] || Object.keys(dbPayload);
        schemaColumns[tableName] = currentCols.filter(c => c !== missingCol);
        
        // Recursively retry upsert with updated schema definitions
        return safeUpsert(tableName, item, mappingFn, retryCount + 1);
      }
    }

    console.error(`Error saving ${tableName} to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
    return { success: false, error };
  }

  return { success: true };
}

// Generic Mapper to handle both snake_case in Supabase and camelCase in React
function toDbRow(data: any): any {
  if (!data) return data;
  const row: any = {};
  for (const key of Object.keys(data)) {
    // Map camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    row[snakeKey] = data[key];
  }
  return row;
}

function fromDbRow<T>(row: any): T {
  if (!row) return row;
  const result: any = {};
  for (const key of Object.keys(row)) {
    // Map snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = row[key];
  }
  return result as T;
}

// Interceptor to filter out non-existent columns and dynamically convert text keys to UUID if required by DB schema
function cleanRowAndPrepare(tableName: string, row: any): any {
  if (!row) return row;
  
  // 1. Filter keys based on schema columns
  let finalRow = { ...row };
  const columns = schemaColumns[tableName];
  if (columns && columns.length > 0) {
    finalRow = {};
    for (const col of columns) {
      if (row[col] !== undefined) {
        finalRow[col] = row[col];
      }
    }
  }
  
  // 2. Perform dynamic UUID formatting for columns that expect UUID in Supabase
  const uuids = schemaUuidColumns[tableName];
  if (uuids && uuids.size > 0) {
    for (const col of Object.keys(finalRow)) {
      if (uuids.has(col)) {
        const val = finalRow[col];
        if (typeof val === 'string' && val.trim() !== '') {
          finalRow[col] = textToUuid(val);
        }
      }
    }
  } else {
    // Fallback: Default common keys that are usually primary/foreign keys typed as UUID
    const commonUuidFields = ['id', 'project_id', 'activity_id', 'parent_activity_id'];
    for (const field of commonUuidFields) {
      if (finalRow[field] !== undefined && typeof finalRow[field] === 'string' && finalRow[field].trim() !== '') {
        const val = finalRow[field];
        const isStandardTextId = /^(p-|ind-|out-|act-|sub-|ref-|ben-|st-)/i.test(val);
        if (isStandardTextId) {
          finalRow[field] = textToUuid(val);
        }
      }
    }
  }
  
  return finalRow;
}

// Convert UUIDs in row back to the original client format if they were saved as UUIDs?
// Since hash is one-way, we cannot mathematically reverse. But since our UUIDs are consistent,
// they fit perfectly, and the React app is completely fine using UUIDs for internal IDs and lookups.

// Map specific custom edge-cases to be 100% compliant with PostgreSQL columns
function mapProjectToDb(proj: Project) {
  const row = toDbRow(proj);
  row.is_archived = !!proj.isArchived;
  row.budget_approved = Number(proj.budgetApproved || 0);
  row.budget_actual = Number(proj.budgetActual || 0);
  row.archored_by = proj.archoredBy || null; // Respect types typo "archoredBy"
  return cleanRowAndPrepare('projects', row);
}

function mapIndicatorToDb(ind: Indicator) {
  const row = toDbRow(ind);
  row.project_id = ind.projectId;
  row.target = Number(ind.target || 0);
  row.current = Number(ind.current || 0);
  row.last_value = Number(ind.lastValue || 0);
  return cleanRowAndPrepare('project_indicators', row);
}

function mapActivityToDb(act: Activity) {
  const row = toDbRow(act);
  row.project_id = act.projectId;
  row.progress = Number(act.progress || 0);
  // Ensure notes/files are safely stored as JSON
  row.notes = act.notes || [];
  row.files = act.files || [];
  return cleanRowAndPrepare('project_activities', row);
}

function mapBeneficiaryToDb(ben: Beneficiary) {
  const row = toDbRow(ben);
  row.birth_year = ben.birthyear ? Number(ben.birthyear) : null;
  row.registrations = ben.registrations || [];
  return cleanRowAndPrepare('beneficiaries', row);
}

function mapIssueToDb(issue: Issue) {
  const row = toDbRow(issue);
  row.project_id = issue.projectId || null;
  row.activity_id = issue.activityId || null;
  row.updates = issue.updates || [];
  return cleanRowAndPrepare('issues', row);
}

function mapReflectionToDb(ref: ProjectReflection) {
  const row = toDbRow(ref);
  row.project_id = ref.projectId;
  return cleanRowAndPrepare('project_reflections', row);
}

// Exportable Sync APIs
export const SupabaseSync = {
  // Discover columns and data types in Supabase using the PostgREST OpenAPI spec endpoint
  async fetchSchemaInfo(customUrl?: string, customKey?: string): Promise<boolean> {
    const targetUrl = customUrl || supabaseUrl;
    const targetKey = customKey || supabaseAnonKey;
    
    if (!targetUrl || !targetKey) {
      return false;
    }
    
    try {
      // Build clean base REST URL endpoint
      const cleanBase = targetUrl.endsWith('/') ? targetUrl : `${targetUrl}/`;
      const restUrl = `${cleanBase}rest/v1/`;
      
      const res = await fetch(restUrl, {
        headers: {
          'apikey': targetKey,
          'Authorization': `Bearer ${targetKey}`
        }
      });
      
      if (!res.ok) {
        // Quietly fail schema spec exploration (OpenAPI schemas are often restricted by security policies)
        return false;
      }
      
      const spec = await res.json();
      const colMap: Record<string, string[]> = {};
      const uuidMap: Record<string, Set<string>> = {};
      
      if (spec && spec.definitions) {
        for (const tableName of Object.keys(spec.definitions)) {
          const tableDef = spec.definitions[tableName];
          if (tableDef && tableDef.properties) {
            colMap[tableName] = Object.keys(tableDef.properties);
            
            const uuids = new Set<string>();
            for (const propName of Object.keys(tableDef.properties)) {
              const prop = tableDef.properties[propName];
              if (prop && (
                prop.format === 'uuid' || 
                prop.type === 'uuid' || 
                (prop.description && prop.description.toLowerCase().includes('uuid'))
              )) {
                uuids.add(propName);
              }
            }
            uuidMap[tableName] = uuids;
          }
        }
        
        schemaColumns = colMap;
        schemaUuidColumns = uuidMap;
        isSchemaFetched = true;
        console.log('Successfully fetched and cached Supabase DB definitions:', colMap);
        console.log('Found UUID-typed columns in Supabase:', uuidMap);
        return true;
      }
      return false;
    } catch (err) {
      // Quietly fall back to static structures without console error pollution
      return false;
    }
  },

  async fetchAllData() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      // Ensure we fetch schema beforehand to align parsing
      if (!isSchemaFetched) {
        await this.fetchSchemaInfo().catch(() => {});
      }

      // Helper to dynamically harvest existing columns from fetched data
      const harvestColumns = (table: string, data: any[]) => {
        if (data && data.length > 0) {
          // Track and cache actual column names present inside rows returned from DB
          schemaColumns[table] = Object.keys(data[0]);
        }
      };

      const fetchGuarded = async (table: string) => {
        try {
          const res = await supabase!.from(table).select('*');
          if (res.error) {
            // Demote table errors (like missing 404 target tables) to quiet status handlers
            return { data: [], error: res.error };
          }
          harvestColumns(table, res.data || []);
          return res;
        } catch (err: any) {
          return { data: [], error: err };
        }
      };

      // Parallel fetches with guarded readers to insulate app against missing/invalid tables
      const [
        resProjects,
        resIndicators,
        resOutcomes,
        resActivities,
        resBeneficiaries,
        resIssues,
        resStaff,
        resSubActs,
        resReflections,
        resDocs
      ] = await Promise.all([
        fetchGuarded('projects'),
        fetchGuarded('project_indicators'),
        fetchGuarded('project_outcomes'),
        fetchGuarded('project_activities'),
        fetchGuarded('beneficiaries'),
        fetchGuarded('issues'),
        fetchGuarded('staff'),
        fetchGuarded('project_sub_activities'),
        fetchGuarded('project_reflections'),
        fetchGuarded('project_documents')
      ]);

      // Helper to process IDs consistently
      const convertIdIfSchemaDictates = (table: string, id: string): string => {
        if (isSchemaFetched && schemaUuidColumns[table]?.has('id') && id) {
          return textToUuid(id);
        }
        return id;
      };

      return {
        projects: (resProjects.data || []).map(row => {
          const item = fromDbRow<Project>(row);
          return item;
        }),
        indicators: (resIndicators.data || []).map(row => {
          const item = fromDbRow<Indicator>(row);
          return item;
        }),
        outcomes: (resOutcomes.data || []).map(row => {
          const item = fromDbRow<Outcome>(row);
          return item;
        }),
        activities: (resActivities.data || []).map(row => {
          const act = fromDbRow<Activity>(row);
          // Parse JSON if returned as string
          if (typeof act.notes === 'string') {
            try { act.notes = JSON.parse(act.notes); } catch { act.notes = []; }
          }
          if (typeof act.files === 'string') {
            try { act.files = JSON.parse(act.files); } catch { act.files = []; }
          }
          return act;
        }),
        beneficiaries: (resBeneficiaries.data || []).map(row => {
          const ben = fromDbRow<Beneficiary>(row);
          if (typeof ben.registrations === 'string') {
            try { ben.registrations = JSON.parse(ben.registrations); } catch { ben.registrations = []; }
          }
          return ben;
        }),
        issues: (resIssues.data || []).map(row => {
          const issue = fromDbRow<Issue>(row);
          if (typeof issue.updates === 'string') {
            try { issue.updates = JSON.parse(issue.updates); } catch { issue.updates = []; }
          }
          return issue;
        }),
        staff: (resStaff.data || []).map(row => {
          const s = fromDbRow<Staff>(row);
          if (!s.status) s.status = 'active';
          return s;
        }),
        subActivities: (resSubActs?.data || []).map((row: any) => fromDbRow<SubActivity>(row)),
        reflections: (resReflections.data || []).map(row => fromDbRow<ProjectReflection>(row)),
        documents: (resDocs?.data || []).map((row: any) => fromDbRow<ProjectDocument>(row))
      };
    } catch (error) {
      console.error('Failed to load initial data from Supabase:', error);
      return null;
    }
  },

  // Save/Upsert handlers using self-healing safeUpsert to protect against schema discrepancies
  async saveProject(proj: Project): Promise<boolean> {
    const res = await safeUpsert('projects', proj, mapProjectToDb);
    return res.success;
  },

  async deleteProject(projId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['projects']?.has('id') ? textToUuid(projId) : projId;
    const { error } = await supabase.from('projects').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting project from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveIndicator(ind: Indicator): Promise<boolean> {
    const res = await safeUpsert('project_indicators', ind, mapIndicatorToDb);
    return res.success;
  },

  async deleteIndicator(indId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_indicators']?.has('id') ? textToUuid(indId) : indId;
    const { error } = await supabase.from('project_indicators').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting indicator from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveOutcome(out: Outcome): Promise<boolean> {
    const res = await safeUpsert('project_outcomes', out, (item) => cleanRowAndPrepare('project_outcomes', toDbRow(item)));
    return res.success;
  },

  async deleteOutcome(outId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_outcomes']?.has('id') ? textToUuid(outId) : outId;
    const { error } = await supabase.from('project_outcomes').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting outcome from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveActivity(act: Activity): Promise<boolean> {
    const res = await safeUpsert('project_activities', act, mapActivityToDb);
    return res.success;
  },

  async deleteActivity(actId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_activities']?.has('id') ? textToUuid(actId) : actId;
    const { error } = await supabase.from('project_activities').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting activity from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveSubActivity(subAct: SubActivity): Promise<boolean> {
    const res = await safeUpsert('project_sub_activities', subAct, (item) => cleanRowAndPrepare('project_sub_activities', toDbRow(item)));
    return res.success;
  },

  async deleteSubActivity(subActId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_sub_activities']?.has('id') ? textToUuid(subActId) : subActId;
    try {
      const { error } = await supabase.from('project_sub_activities').delete().eq('id', targetId);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn(`Could not delete sub-activity: [${e.code || '-'}] ${e.message || e}`);
      return false;
    }
  },

  async saveBeneficiary(ben: Beneficiary): Promise<boolean> {
    const res = await safeUpsert('beneficiaries', ben, mapBeneficiaryToDb);
    return res.success;
  },

  async deleteBeneficiary(benId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['beneficiaries']?.has('id') ? textToUuid(benId) : benId;
    const { error } = await supabase.from('beneficiaries').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting beneficiary from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveIssue(issue: Issue): Promise<boolean> {
    const res = await safeUpsert('issues', issue, mapIssueToDb);
    return res.success;
  },

  async deleteIssue(issueId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['issues']?.has('id') ? textToUuid(issueId) : issueId;
    const { error } = await supabase.from('issues').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting issue from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveStaff(staffMember: Staff): Promise<boolean> {
    const res = await safeUpsert('staff', staffMember, (item) => cleanRowAndPrepare('staff', toDbRow(item)));
    return res.success;
  },

  async deleteStaff(staffId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['staff']?.has('id') ? textToUuid(staffId) : staffId;
    const { error } = await supabase.from('staff').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting staff from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveReflection(ref: ProjectReflection): Promise<boolean> {
    const res = await safeUpsert('project_reflections', ref, mapReflectionToDb);
    return res.success;
  },

  async deleteReflection(refId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_reflections']?.has('id') ? textToUuid(refId) : refId;
    const { error } = await supabase.from('project_reflections').delete().eq('id', targetId);
    if (error) {
      console.error(`Error deleting reflection from Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`);
      return false;
    }
    return true;
  },

  async saveDocument(doc: ProjectDocument): Promise<boolean> {
    const res = await safeUpsert('project_documents', doc, (item) => cleanRowAndPrepare('project_documents', toDbRow(item)));
    return res.success;
  },

  async deleteDocument(docId: string): Promise<boolean> {
    if (!supabase) return false;
    const targetId = isSchemaFetched && schemaUuidColumns['project_documents']?.has('id') ? textToUuid(docId) : docId;
    try {
      const { error } = await supabase.from('project_documents').delete().eq('id', targetId);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn(`Could not delete document: [${e.code || '-'}] ${e.message || e}`);
      return false;
    }
  }
};
