import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Project, Indicator, Outcome, Activity, SubActivity, Beneficiary, Issue, Staff, ProjectReflection, ProjectDocument } from '../types';

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

// Map specific custom edge-cases to be 100% compliant with PostgreSQL columns
function mapProjectToDb(proj: Project) {
  const row = toDbRow(proj);
  // Manual corrections if required
  row.is_archived = !!proj.isArchived;
  row.budget_approved = Number(proj.budgetApproved || 0);
  row.budget_actual = Number(proj.budgetActual || 0);
  row.archored_by = proj.archoredBy || null; // Respect types typo "archoredBy"
  return row;
}

function mapIndicatorToDb(ind: Indicator) {
  const row = toDbRow(ind);
  row.project_id = ind.projectId;
  row.target = Number(ind.target || 0);
  row.current = Number(ind.current || 0);
  row.last_value = Number(ind.lastValue || 0);
  return row;
}

function mapActivityToDb(act: Activity) {
  const row = toDbRow(act);
  row.project_id = act.projectId;
  row.progress = Number(act.progress || 0);
  // Ensure notes/files are safely stored as JSON
  row.notes = act.notes || [];
  row.files = act.files || [];
  return row;
}

function mapBeneficiaryToDb(ben: Beneficiary) {
  const row = toDbRow(ben);
  row.birth_year = ben.birthyear ? Number(ben.birthyear) : null;
  row.registrations = ben.registrations || [];
  return row;
}

function mapIssueToDb(issue: Issue) {
  const row = toDbRow(issue);
  row.project_id = issue.projectId || null;
  row.activity_id = issue.activityId || null;
  row.updates = issue.updates || [];
  return row;
}

function mapReflectionToDb(ref: ProjectReflection) {
  const row = toDbRow(ref);
  row.project_id = ref.projectId;
  return row;
}

// Exportable Sync APIs
export const SupabaseSync = {
  async fetchAllData() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
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

      return {
        projects: (resProjects.data || []).map(row => fromDbRow<Project>(row)),
        indicators: (resIndicators.data || []).map(row => fromDbRow<Indicator>(row)),
        outcomes: (resOutcomes.data || []).map(row => fromDbRow<Outcome>(row)),
        activities: (resActivities.data || []).map(row => {
          const act = fromDbRow<Activity>(row);
          // Parse JSON if returned as string
          if (typeof act.notes === 'string') act.notes = JSON.parse(act.notes);
          if (typeof act.files === 'string') act.files = JSON.parse(act.files);
          return act;
        }),
        beneficiaries: (resBeneficiaries.data || []).map(row => {
          const ben = fromDbRow<Beneficiary>(row);
          if (typeof ben.registrations === 'string') ben.registrations = JSON.parse(ben.registrations);
          return ben;
        }),
        issues: (resIssues.data || []).map(row => {
          const issue = fromDbRow<Issue>(row);
          if (typeof issue.updates === 'string') issue.updates = JSON.parse(issue.updates);
          return issue;
        }),
        staff: (resStaff.data || []).map(row => fromDbRow<Staff>(row)),
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
    const { error } = await supabase.from('projects').upsert(mapProjectToDb(proj));
    if (error) {
      console.error('Error saving project to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteProject(projId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('projects').delete().eq('id', projId);
    if (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveIndicator(ind: Indicator): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_indicators').upsert(mapIndicatorToDb(ind));
    if (error) {
      console.error('Error saving indicator to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteIndicator(indId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_indicators').delete().eq('id', indId);
    if (error) {
      console.error('Error deleting indicator from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveOutcome(out: Outcome): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_outcomes').upsert(toDbRow(out));
    if (error) {
      console.error('Error saving outcome to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteOutcome(outId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_outcomes').delete().eq('id', outId);
    if (error) {
      console.error('Error deleting outcome from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveActivity(act: Activity): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_activities').upsert(mapActivityToDb(act));
    if (error) {
      console.error('Error saving activity to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteActivity(actId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_activities').delete().eq('id', actId);
    if (error) {
      console.error('Error deleting activity from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveSubActivity(subAct: SubActivity): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('project_sub_activities').upsert(toDbRow(subAct));
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Could not save sub-activity to project_sub_activities (table might be missing):', e);
      return false;
    }
  },

  async deleteSubActivity(subActId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('project_sub_activities').delete().eq('id', subActId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Could not delete sub-activity (table might be missing):', e);
      return false;
    }
  },

  async saveBeneficiary(ben: Beneficiary): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('beneficiaries').upsert(mapBeneficiaryToDb(ben));
    if (error) {
      console.error('Error saving beneficiary to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteBeneficiary(benId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('beneficiaries').delete().eq('id', benId);
    if (error) {
      console.error('Error deleting beneficiary from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveIssue(issue: Issue): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('issues').upsert(mapIssueToDb(issue));
    if (error) {
      console.error('Error saving issue to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteIssue(issueId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('issues').delete().eq('id', issueId);
    if (error) {
      console.error('Error deleting issue from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveStaff(staffMember: Staff): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('staff').upsert(toDbRow(staffMember));
    if (error) {
      console.error('Error saving staff to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteStaff(staffId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('staff').delete().eq('id', staffId);
    if (error) {
      console.error('Error deleting staff from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveReflection(ref: ProjectReflection): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_reflections').upsert(mapReflectionToDb(ref));
    if (error) {
      console.error('Error saving reflection to Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteReflection(refId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('project_reflections').delete().eq('id', refId);
    if (error) {
      console.error('Error deleting reflection from Supabase:', error);
      return false;
    }
    return true;
  },

  async saveDocument(doc: ProjectDocument): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('project_documents').upsert(toDbRow(doc));
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Could not save document to project_documents (table might be missing):', e);
      return false;
    }
  },

  async deleteDocument(docId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('project_documents').delete().eq('id', docId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Could not delete document (table might be missing):', e);
      return false;
    }
  }
};
