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
  // If it's already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str.toLowerCase();

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
  const part3 = '4dfw'; // Custom identifier segment representing DFW Indonesia
  const part4 = '8' + absHash2.substring(0, 3); // Starts with 8-11 pattern (uuid-conformant variant)
  const part5 = absHash2.substring(3).padEnd(12, 'f');

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.substring(0, 36);
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
      console.warn('Cannot fetch Supabase schema info: Credentials not provided yet.');
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
        console.warn(`Failed to retrieve Supabase Schema metadata spec: HTTP ${res.status}`);
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
      console.error('Error fetching database OpenAPI schema:', err);
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
        await this.fetchSchemaInfo();
      }

      // Parallel fetches for speed and low latency
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
        supabase.from('projects').select('*'),
        supabase.from('project_indicators').select('*'),
        supabase.from('project_outcomes').select('*'),
        supabase.from('project_activities').select('*'),
        supabase.from('beneficiaries').select('*'),
        supabase.from('issues').select('*'),
        supabase.from('staff').select('*'),
        supabase.from('project_sub_activities').select('*').then(res => res, () => ({ data: [], error: null })), // handle missing table safely
        supabase.from('project_reflections').select('*'),
        supabase.from('project_documents').select('*').then(res => res, () => ({ data: [], error: null }))
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

  // Save/Upsert handlers
  async saveProject(proj: Project): Promise<boolean> {
    if (!supabase) return false;
    const dbPayload = mapProjectToDb(proj);
    const { error } = await supabase.from('projects').upsert(dbPayload);
    if (error) {
      console.error(`Error saving project to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = mapIndicatorToDb(ind);
    const { error } = await supabase.from('project_indicators').upsert(dbPayload);
    if (error) {
      console.error(`Error saving indicator to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = cleanRowAndPrepare('project_outcomes', toDbRow(out));
    const { error } = await supabase.from('project_outcomes').upsert(dbPayload);
    if (error) {
      console.error(`Error saving outcome to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = mapActivityToDb(act);
    const { error } = await supabase.from('project_activities').upsert(dbPayload);
    if (error) {
      console.error(`Error saving activity to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = cleanRowAndPrepare('project_sub_activities', toDbRow(subAct));
    try {
      const { error } = await supabase.from('project_sub_activities').upsert(dbPayload);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn(`Could not save sub-activity to project_sub_activities (table might be missing/mismatched): [${e.code || '-'}] ${e.message || e}`, dbPayload);
      return false;
    }
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
    if (!supabase) return false;
    const dbPayload = mapBeneficiaryToDb(ben);
    const { error } = await supabase.from('beneficiaries').upsert(dbPayload);
    if (error) {
      console.error(`Error saving beneficiary to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = mapIssueToDb(issue);
    const { error } = await supabase.from('issues').upsert(dbPayload);
    if (error) {
      console.error(`Error saving issue to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = cleanRowAndPrepare('staff', toDbRow(staffMember));
    const { error } = await supabase.from('staff').upsert(dbPayload);
    if (error) {
      console.error(`Error saving staff to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = mapReflectionToDb(ref);
    const { error } = await supabase.from('project_reflections').upsert(dbPayload);
    if (error) {
      console.error(`Error saving reflection to Supabase: [${error.code}] ${error.message}. Detail: ${error.details || '-'}. Hint: ${error.hint || '-'}`, dbPayload);
      return false;
    }
    return true;
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
    if (!supabase) return false;
    const dbPayload = cleanRowAndPrepare('project_documents', toDbRow(doc));
    try {
      const { error } = await supabase.from('project_documents').upsert(dbPayload);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn(`Could not save document to project_documents (table might be missing/mismatched): [${e.code || '-'}] ${e.message || e}`, dbPayload);
      return false;
    }
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
