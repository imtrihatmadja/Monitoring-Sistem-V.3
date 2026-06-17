import React, { useState, useEffect } from 'react';
import { Project, Activity, Indicator, Outcome, Beneficiary, Issue, Staff, SubActivity, ProjectReflection, ActivityFile, ProjectDocument } from './types';
import {
  INITIAL_PROJECTS,
  INITIAL_INDICATORS,
  INITIAL_OUTCOMES,
  INITIAL_ACTIVITIES,
  INITIAL_BENEFICIARIES,
  INITIAL_ISSUES,
  INITIAL_STAFF,
  INITIAL_REFLECTIONS,
  INITIAL_DOCUMENTS,
} from './data';

// Import Tab Components
import { DashboardTab } from './components/DashboardTab';
import { ProjectsTab } from './components/ProjectsTab';
import { IssuesTab } from './components/IssuesTab';
import { BeneficiaryTab } from './components/BeneficiaryTab';
import { StaffTab } from './components/StaffTab';
import { ProjectForm } from './components/ProjectForm';
import { ProjectDetailTab } from './components/ProjectDetailTab';
import { DocumentsTab } from './components/DocumentsTab';

// Import Modals Component
import {
  ActivityModal,
  PrintModal,
  ImportModal,
  BeneficiaryModal,
  BenDetailModal,
  StaffTasksModal,
  SubActivitiesModal,
} from './components/Modals';

// Import Icons
import {
  Folder,
  LayoutDashboard,
  Users,
  AlertTriangle,
  ClipboardList,
  FolderMinus,
  Settings,
  PlusCircle,
  Database,
  Printer,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function App() {
  // --- STATE STORES (PERSISTED IN LOCALSTORAGE) ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [reflections, setReflections] = useState<ProjectReflection[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'projects' | 'beneficiary' | 'issues' | 'staff' | 'add_project' | 'edit_project' | 'project_detail' | 'archive' | 'documents'
  >('dashboard');
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);

  const [isSubActivitiesModalOpen, setIsSubActivitiesModalOpen] = useState(false);
  const [activeParentActivityId, setActiveParentActivityId] = useState<string>('');

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isBenModalOpen, setIsBenModalOpen] = useState(false);
  const [selectedBen, setSelectedBen] = useState<Beneficiary | undefined>(undefined);

  const [isBenDetailModalOpen, setIsBenDetailModalOpen] = useState(false);
  const [selectedDetailBen, setSelectedDetailBen] = useState<Beneficiary | undefined>(undefined);

  const [isStaffTasksModalOpen, setIsStaffTasksModalOpen] = useState(false);
  const [selectedStaffTasksName, setSelectedStaffTasksName] = useState<string>('');

  // Sync validation status toast
  const [syncToast, setSyncToast] = useState<'success' | 'info' | ''>('');

  // Initialize data stores
  useEffect(() => {
    // Read local storages or load initial structures
    const storedProjects = localStorage.getItem('dfw_projects');
    const storedIndicators = localStorage.getItem('dfw_indicators');
    const storedOutcomes = localStorage.getItem('dfw_outcomes');
    const storedActivities = localStorage.getItem('dfw_activities');
    const storedBeneficiaries = localStorage.getItem('dfw_beneficiaries');
    const storedIssues = localStorage.getItem('dfw_issues');
    const storedStaff = localStorage.getItem('dfw_staff');
    const storedSubActivities = localStorage.getItem('dfw_sub_activities');
    const storedReflections = localStorage.getItem('dfw_reflections');

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('dfw_projects', JSON.stringify(INITIAL_PROJECTS));
    }

    if (storedIndicators) setIndicators(JSON.parse(storedIndicators));
    else {
      setIndicators(INITIAL_INDICATORS);
      localStorage.setItem('dfw_indicators', JSON.stringify(INITIAL_INDICATORS));
    }

    if (storedOutcomes) setOutcomes(JSON.parse(storedOutcomes));
    else {
      setOutcomes(INITIAL_OUTCOMES);
      localStorage.setItem('dfw_outcomes', JSON.stringify(INITIAL_OUTCOMES));
    }

    if (storedActivities) setActivities(JSON.parse(storedActivities));
    else {
      setActivities(INITIAL_ACTIVITIES);
      localStorage.setItem('dfw_activities', JSON.stringify(INITIAL_ACTIVITIES));
    }

    if (storedBeneficiaries) setBeneficiaries(JSON.parse(storedBeneficiaries));
    else {
      setBeneficiaries(INITIAL_BENEFICIARIES);
      localStorage.setItem('dfw_beneficiaries', JSON.stringify(INITIAL_BENEFICIARIES));
    }

    if (storedIssues) setIssues(JSON.parse(storedIssues));
    else {
      setIssues(INITIAL_ISSUES);
      localStorage.setItem('dfw_issues', JSON.stringify(INITIAL_ISSUES));
    }

    if (storedStaff) setStaff(JSON.parse(storedStaff));
    else {
      setStaff(INITIAL_STAFF);
      localStorage.setItem('dfw_staff', JSON.stringify(INITIAL_STAFF));
    }

    if (storedSubActivities) setSubActivities(JSON.parse(storedSubActivities));
    else {
      const defaultSubs: SubActivity[] = [
        { id: 'sub-01', parentActivityId: 'act-02', title: 'Pembelian lisensi logbook seluler', pic: 'Fadli S.', priority: 'High', status: 'Selesai' },
        { id: 'sub-02', parentActivityId: 'act-02', title: 'Penyusunan pamflet modul e-logbook', pic: 'Budi Hartono', priority: 'Normal', status: 'Sedang Dikerjakan' }
      ];
      setSubActivities(defaultSubs);
      localStorage.setItem('dfw_sub_activities', JSON.stringify(defaultSubs));
    }

    if (storedReflections) setReflections(JSON.parse(storedReflections));
    else {
      setReflections(INITIAL_REFLECTIONS);
      localStorage.setItem('dfw_reflections', JSON.stringify(INITIAL_REFLECTIONS));
    }

    const storedDocuments = localStorage.getItem('dfw_documents');
    if (storedDocuments) setDocuments(JSON.parse(storedDocuments));
    else {
      setDocuments(INITIAL_DOCUMENTS);
      localStorage.setItem('dfw_documents', JSON.stringify(INITIAL_DOCUMENTS));
    }
  }, []);

  // Save states helper
  const updateDocumentsInStorage = (newList: ProjectDocument[]) => {
    setDocuments(newList);
    localStorage.setItem('dfw_documents', JSON.stringify(newList));
  };

  const updateProjectsInStorage = (newList: Project[]) => {
    setProjects(newList);
    localStorage.setItem('dfw_projects', JSON.stringify(newList));
  };

  const updateIndicatorsInStorage = (newList: Indicator[]) => {
    setIndicators(newList);
    localStorage.setItem('dfw_indicators', JSON.stringify(newList));
  };

  const updateOutcomesInStorage = (newList: Outcome[]) => {
    setOutcomes(newList);
    localStorage.setItem('dfw_outcomes', JSON.stringify(newList));
  };

  const updateActivitiesInStorage = (newList: Activity[]) => {
    setActivities(newList);
    localStorage.setItem('dfw_activities', JSON.stringify(newList));
  };

  const updateBeneficiariesInStorage = (newList: Beneficiary[]) => {
    setBeneficiaries(newList);
    localStorage.setItem('dfw_beneficiaries', JSON.stringify(newList));
  };

  const updateIssuesInStorage = (newList: Issue[]) => {
    setIssues(newList);
    localStorage.setItem('dfw_issues', JSON.stringify(newList));
  };

  const updateSubActivitiesInStorage = (newList: SubActivity[]) => {
    setSubActivities(newList);
    localStorage.setItem('dfw_sub_activities', JSON.stringify(newList));
  };

  const updateReflectionsInStorage = (newList: ProjectReflection[]) => {
    setReflections(newList);
    localStorage.setItem('dfw_reflections', JSON.stringify(newList));
  };

  // Recalculates project overall progress dynamically based on activity progress averages
  const recalculateProgressAndSave = (projId: string, customActivities?: Activity[]) => {
    const list = customActivities || activities;
    const projectActs = list.filter((act) => act.projectId === projId);
    
    let newProgress = 0;
    if (projectActs.length > 0) {
      newProgress = Math.round(projectActs.reduce((sum, act) => sum + act.progress, 0) / projectActs.length);
    }

    const updated = projects.map((p) => {
      if (p.id === projId) {
        return { ...p, progress: newProgress };
      }
      return p;
    });

    updateProjectsInStorage(updated);
  };

  // --- RECT REVENUE CALLBACK WORKFLOW ---
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveTab('project_detail');
  };

  const handleEditProjectClick = (id: string) => {
    setSelectedProjectId(id);
    setActiveTab('edit_project');
  };

  const handleArchiveProject = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin mengarsipkan proyek ini?')) {
      const updated = projects.map((p) => (p.id === id ? { ...p, isArchived: true, archoredBy: 'Imam Trihatmadja', archivedAt: new Date().toISOString().split('T')[0] } : p));
      updateProjectsInStorage(updated);
      setSyncToast('info');
      setTimeout(() => setSyncToast(''), 3000);
    }
  };

  const handleRestoreProject = (id: string) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, isArchived: false, archoredBy: undefined, archivedAt: undefined } : p));
    updateProjectsInStorage(updated);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  // --- SAVE OR CREATE WIZARD FOR PROJECTS ---
  const handleSaveProjectWizard = (
    projectData: Partial<Project>,
    indicatorsData: Partial<Indicator>[],
    outcomesData: Partial<Outcome>[]
  ) => {
    if (selectedProjectId && activeTab === 'edit_project') {
      // Editing
      const updatedProjects = projects.map((p) =>
        p.id === selectedProjectId ? { ...p, ...projectData } : p
      );
      updateProjectsInStorage(updatedProjects);

      // Save outcomes
      const filteredOutcomes = outcomes.filter((o) => o.projectId !== selectedProjectId);
      const newOutcomes = outcomesData.map((o) => ({
        id: o.id || `out-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        projectId: selectedProjectId,
        title: o.title || '',
      }));
      updateOutcomesInStorage([...filteredOutcomes, ...newOutcomes]);

      // Save indicators
      const filteredIndicators = indicators.filter((i) => i.projectId !== selectedProjectId);
      const newIndicators = indicatorsData.map((ind) => ({
        id: ind.id || `ind-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        projectId: selectedProjectId,
        title: ind.title || '',
        target: ind.target || 0,
        current: ind.current || 0,
        unit: ind.unit || 'Orang',
      }));
      updateIndicatorsInStorage([...filteredIndicators, ...newIndicators]);

      recalculateProgressAndSave(selectedProjectId);
      setActiveTab('project_detail');
    } else {
      // Creation
      const newId = `p-${Date.now()}`;
      const newProj: Project = {
        id: newId,
        name: projectData.name || '',
        location: projectData.location || '',
        owner: projectData.owner || '',
        donor: projectData.donor,
        status: projectData.status || 'Aktif',
        startDate: projectData.startDate,
        deadline: projectData.deadline,
        progress: 0,
        budgetApproved: projectData.budgetApproved || 0,
        budgetActual: projectData.budgetActual || 0,
        desc: projectData.desc,
        note: projectData.note,
        goal: projectData.goal,
        isArchived: false,
      };

      updateProjectsInStorage([...projects, newProj]);

      const newOutcomes = outcomesData.map((o) => ({
        id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        projectId: newId,
        title: o.title || '',
      }));
      updateOutcomesInStorage([...outcomes, ...newOutcomes]);

      const newIndicators = indicatorsData.map((ind) => ({
        id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        projectId: newId,
        title: ind.title || '',
        target: ind.target || 0,
        current: ind.current || 0,
        unit: ind.unit || 'Orang',
      }));
      updateIndicatorsInStorage([...indicators, ...newIndicators]);

      setSyncToast('success');
      setTimeout(() => setSyncToast(''), 3000);
      setActiveTab('dashboard');
    }
  };

  // --- SAVE CHOSEN ACTIVITY (EDIT / CREATE) ---
  const handleSaveActivityModal = (activityData: Partial<Activity>, rawFiles?: File[]) => {
    // Generate file mock paths from raw uploads
    const mockFiles: ActivityFile[] = [];
    if (rawFiles && rawFiles.length > 0) {
      rawFiles.forEach((f) => {
        mockFiles.push({
          id: `f-staged-${Date.now()}-${Math.random()}`,
          name: f.name,
          size: f.size,
          type: f.type,
        });
      });
    }

    const currentFiles = [...(activityData.files || []), ...mockFiles];

    if (selectedActivity) {
      // Editing Mode
      const updatedActs = activities.map((a) =>
        a.id === selectedActivity.id ? { ...a, ...activityData, files: currentFiles } : a
      );
      updateActivitiesInStorage(updatedActs);
      recalculateProgressAndSave(selectedProjectId, updatedActs);
    } else {
      // Creation Mode
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        projectId: selectedProjectId,
        title: activityData.title || '',
        desc: activityData.desc,
        pic: activityData.pic,
        status: activityData.status || 'Belum Mulai',
        startDate: activityData.startDate,
        dueDate: activityData.dueDate,
        progress: activityData.progress || 0,
        notes: activityData.notes || [],
        files: currentFiles,
      };

      const newList = [...activities, newAct];
      updateActivitiesInStorage(newList);
      recalculateProgressAndSave(selectedProjectId, newList);
    }

    setIsActivityModalOpen(false);
    setSelectedActivity(undefined);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  // --- SAVE OUTLINE SUB EXECUTIVES ---
  const handleSaveSubActivity = (subActData: Partial<SubActivity>) => {
    const newItem: SubActivity = {
      id: subActData.id || `sub-${Date.now()}`,
      parentActivityId: activeParentActivityId,
      title: subActData.title || '',
      desc: subActData.desc,
      pic: subActData.pic,
      status: subActData.status || 'Belum Mulai',
      priority: subActData.priority || 'Normal',
      due: subActData.due,
    };

    const isExisting = subActivities.some((item) => item.id === newItem.id);
    let updated: SubActivity[] = [];
    if (isExisting) {
      updated = subActivities.map((item) => (item.id === newItem.id ? newItem : item));
    } else {
      updated = [...subActivities, newItem];
    }

    updateSubActivitiesInStorage(updated);
  };

  const handleDeleteSubActivity = (subId: string) => {
    const updated = subActivities.filter((item) => item.id !== subId);
    updateSubActivitiesInStorage(updated);
  };

  // --- QUICK UPDATE PERFORMANCE INDICATORS CURRENT ON PANEL ---
  const handleSaveIndicatorValueInline = (indicatorId: string, newValue: number) => {
    const updated = indicators.map((ind) => {
      if (ind.id === indicatorId) {
        return {
          ...ind,
          current: newValue,
          lastValue: ind.current,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return ind;
    });

    updateIndicatorsInStorage(updated);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  // --- SAVE REFLECTION/LESSONS LEARNED ---
  const handleAddReflectionInline = (refData: Partial<ProjectReflection>) => {
    const newRef: ProjectReflection = {
      id: `ref-${Date.now()}`,
      projectId: refData.projectId || '',
      title: refData.title,
      type: refData.type || 'lesson',
      date: refData.date || new Date().toISOString().split('T')[0],
      whatHappened: refData.whatHappened,
      whatWorked: refData.whatWorked,
      whatDidnt: refData.whatDidnt,
      lesson: refData.lesson || '',
      nextSteps: refData.nextSteps,
      contributor: refData.contributor,
    };

    updateReflectionsInStorage([...reflections, newRef]);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleDeleteReflectionInline = (refId: string) => {
    updateReflectionsInStorage(reflections.filter((r) => r.id !== refId));
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  // --- POPULATE OTHER CORE INTEGRATION TAB FUNCTIONS ---
  const handleExportExcelBeneficiary = (subList: Beneficiary[]) => {
    alert(`Mengekspor ${subList.length} data Penerima Manfaat ke file spreadsheet excel.xls`);
  };

  const handleDownloadTemplateExcel = () => {
    alert('Mempersiapkan dokumen template spreadsheet laporan DFW...');
  };

  const handleSaveBeneficiaryForm = (benData: Partial<Beneficiary>) => {
    if (selectedBen) {
      // Editing
      const updated = beneficiaries.map((b) => (b.id === selectedBen.id ? { ...b, ...benData } : b));
      updateBeneficiariesInStorage(updated);
    } else {
      // Creation
      const newBen: Beneficiary = {
        id: `ben-${Date.now()}`,
        name: benData.name || '',
        phone: benData.phone,
        gender: benData.gender || 'Laki-laki',
        birthyear: benData.birthyear,
        location: benData.location,
        occupation: benData.occupation,
        email: benData.email,
        note: benData.note,
        registrations: benData.registrations || [],
      };
      updateBeneficiariesInStorage([...beneficiaries, newBen]);
    }

    setIsBenModalOpen(false);
    setSelectedBen(undefined);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleImportSuccessCallback = (importedProjects: Project[], importedIndicators: Indicator[]) => {
    updateProjectsInStorage([...projects, ...importedProjects]);
    updateIndicatorsInStorage([...indicators, ...importedIndicators]);
    setSyncToast('success');
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleGeneratePrintOutput = (lang: 'id' | 'en', from: string, to: string) => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) {
      alert(lang === 'id' ? 'Proyek tidak ditemukan.' : 'Project not found.');
      return;
    }

    const isID = lang === 'id';
    
    // Date Range calculation
    const fromDateObj = from ? new Date(from + 'T00:00:00') : null;
    const toDateObj = to ? new Date(to + 'T23:59:59') : null;

    const fromMs = fromDateObj?.getTime() || null;
    const toMs = toDateObj?.getTime() || null;

    const fromStr = fromDateObj ? fromDateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const toStr = toDateObj ? toDateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

    const fromStrEN = fromDateObj ? fromDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const toStrEN = toDateObj ? toDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

    const periodLabel = fromDateObj && toDateObj
      ? (isID ? `Periode: ${fromStr} – ${toStr}` : `Period: ${fromStrEN} – ${toStrEN}`)
      : (isID ? 'Semua Data' : 'All Data');

    // 1. Filter Indicators
    const projectIndicators = indicators.filter((i) => i.projectId === proj.id);

    // 2. Filter Activities
    const projectActivities = activities.filter((a) => a.projectId === proj.id);
    
    // Filtered by range: we consider it in range if start date <= to and due date >= from
    const rangedActivities = projectActivities.filter((act) => {
      if (!fromMs || !toMs) return true;
      const sd = act.startDate ? new Date(act.startDate + 'T00:00:00').getTime() : null;
      const dd = act.dueDate ? new Date(act.dueDate + 'T23:59:59').getTime() : null;
      const inRange = !sd || (sd <= toMs && (!dd || dd >= fromMs));
      return inRange;
    });

    // Outcomes
    const projectOutcomes = outcomes.filter((o) => o.projectId === proj.id);

    // Reflections (Lesson Learned)
    const projectReflections = reflections.filter((r) => r.projectId === proj.id);

    // Dynamic stats
    // Indicator progress average
    let avgInd = null;
    if (projectIndicators.length) {
      avgInd = Math.round(
        projectIndicators.reduce((sum, ind) => {
          const t = ind.target || 0;
          const a = ind.current || 0;
          return sum + (t > 0 ? Math.min(Math.round((a / t) * 100), 100) : 0);
        }, 0) / projectIndicators.length
      );
    }

    // Activity progress average
    let avgAct = null;
    if (rangedActivities.length) {
      avgAct = Math.round(
        rangedActivities.reduce((sum, act) => sum + (act.progress || 0), 0) / rangedActivities.length
      );
    }

    // Overall progress
    let overall = 0;
    if (avgInd !== null && avgAct !== null) {
      overall = Math.round((avgInd + avgAct) / 2);
    } else if (avgInd !== null) {
      overall = avgInd;
    } else if (avgAct !== null) {
      overall = avgAct;
    }

    const doneInd = projectIndicators.filter((i) => {
      const a = i.current || 0;
      const t = i.target || 0;
      return t > 0 && a >= t;
    }).length;

    const doneAct = rangedActivities.filter((a) => a.status === 'Selesai').length;

    const budAppr = proj.budgetApproved || 0;
    const budActFinal = proj.budgetActual || 0;
    const budLeft = budAppr - budActFinal;
    const budPct = budAppr > 0 ? Math.min(Math.round((budActFinal / budAppr) * 100), 100) : 0;

    // Aggregate impact chips
    const impG: { [key: string]: { unit: string; total: number } } = {};
    projectIndicators.forEach((ind) => {
      const ru = (ind.unit || '').trim();
      if (!ru) return;
      const k = ru.toLowerCase();
      const av = ind.current || 0;
      if (!impG[k]) impG[k] = { unit: ru, total: 0 };
      impG[k].total += av;
    });
    const impEntries = Object.entries(impG).sort((a, b) => b[1].total - a[1].total);

    // Labels translation dictionary
    const L = isID ? {
      org: 'DFW Indonesia — Program Monitoring & Evaluation',
      reportType: 'LAPORAN KEMAJUAN PROYEK',
      printedOn: 'Dicetak pada',
      sec_info: 'INFORMASI PROYEK',
      sec_summary: 'RINGKASAN KEMAJUAN',
      sec_goal: 'GOAL & OUTCOMES PROGRAM',
      sec_ind: 'CAPAIAN INDIKATOR KINERJA',
      sec_act: 'AKTIVITAS PELAKSANAAN',
      sec_hambatan: 'HAMBATAN & TANTANGAN PELAKSANAAN',
      sec_rtl: 'LESSON LEARNED & REFLEKSI',
      sec_budget: 'REALISASI ANGGARAN',
      sec_impact: 'DAMPAK PROGRAM',
      overallProg: 'Progress Keseluruhan',
      avgInd: 'Rata-rata Indikator',
      avgAct: 'Rata-rata Aktivitas',
      budAbsorption: 'Penyerapan Anggaran',
      indDone: 'Indikator Tercapai',
      actDone: 'Aktivitas Selesai',
      status: 'Status', location: 'Lokasi', owner: 'Penanggung Jawab',
      donor: 'Donor/Mitra', start: 'Tanggal Mulai', deadline: 'Deadline',
      desc: 'Deskripsi', goal: 'Goal', outcomes: 'Outcomes',
      indName: 'Nama Indikator', type: 'Tipe', target: 'Target',
      actual: 'Realisasi', pct: 'Capaian', lastNote: 'Catatan Terakhir',
      actTitle: 'Judul Aktivitas', pic: 'PIC', startAct: 'Mulai', dueAct: 'Deadline',
      actStatus: 'Status', actProg: 'Progress', actNotes: 'Hambatan/Tantangan',
      budAppr: 'Anggaran Disetujui', budAct: 'Realisasi', budLeft: 'Sisa',
      date: 'Tanggal', updBy: 'Diperbarui Oleh', amount: 'Jumlah', note: 'Keterangan',
      noHambatan: 'Tidak ada hambatan/tantangan yang dicatat untuk aktivitas ini.',
      noRTL: 'Tidak ada catatan refleksi atau pelajaran relevan yang dihimpun dalam range tanggal ini.',
      noActData: 'Belum ada aktivitas.',
      noIndData: 'Belum ada indikator.',
      footerNote: 'Laporan ini digenerate otomatis oleh sistem PMIS DFW Indonesia',
      pageOf: 'Halaman',
      hambatanDesc: 'Dihimpun dari catatan tantangan & hambatan yang dicatat pada setiap aktivitas pelaksanaan.',
      rtlDesc: 'Rangkuman pembelajaran (lesson learned), success story, hambatan utama, dan rekomendasi tindak lanjut.',
      rtlIndProg: 'Capaian saat ini',
    } : {
      org: 'DFW Indonesia — Program Monitoring & Evaluation',
      reportType: 'PROJECT PROGRESS REPORT',
      printedOn: 'Printed on',
      sec_info: 'PROJECT INFORMATION',
      sec_summary: 'PROGRESS SUMMARY',
      sec_goal: 'PROGRAM GOAL & OUTCOMES',
      sec_ind: 'KEY PERFORMANCE INDICATORS',
      sec_act: 'IMPLEMENTATION ACTIVITIES',
      sec_hambatan: 'CHALLENGES & OBSTACLES',
      sec_rtl: 'LESSON LEARNED & REFLECTION',
      sec_budget: 'BUDGET REALIZATION',
      sec_impact: 'PROGRAM IMPACT',
      overallProg: 'Overall Progress',
      avgInd: 'Avg. Indicators',
      avgAct: 'Avg. Activities',
      budAbsorption: 'Budget Absorption',
      indDone: 'Indicators Achieved',
      actDone: 'Activities Completed',
      status: 'Status', location: 'Location', owner: 'Person in Charge',
      donor: 'Donor/Partner', start: 'Start Date', deadline: 'Deadline',
      desc: 'Description', goal: 'Goal', outcomes: 'Outcomes',
      indName: 'Indicator Name', type: 'Type', target: 'Target',
      actual: 'Actual', pct: 'Achievement', lastNote: 'Last Note',
      actTitle: 'Activity Title', pic: 'PIC', startAct: 'Start', dueAct: 'Deadline',
      actStatus: 'Status', actProg: 'Progress', actNotes: 'Challenges/Obstacles',
      budAppr: 'Approved Budget', budAct: 'Realization', budLeft: 'Remaining',
      date: 'Date', updBy: 'Updated By', amount: 'Amount', note: 'Note',
      noHambatan: 'No challenges or obstacles have been recorded for this activity.',
      noRTL: 'No reflections or lessons learned have been recorded in this range.',
      noActData: 'No activities yet.',
      noIndData: 'No indicators yet.',
      footerNote: 'This report is auto-generated by the PMIS DFW Indonesia system',
      pageOf: 'Page',
      hambatanDesc: 'Compiled from challenges & obstacles notes recorded on each implementation activity.',
      rtlDesc: 'Summary of lessons learned, success stories, key challenges, and recommendation next steps.',
      rtlIndProg: 'Current achievement',
    };

    // Styling generator functions
    const _statusColor = (s: string) => {
      const map: { [key: string]: string } = {
        'Selesai': '#16a34a',
        'Sedang Berjalan': '#2563eb',
        'Sedang Dikerjakan': '#2563eb',
        'On Track': '#2563eb',
        'Aktif': '#16a34a',
        'Terlambat': '#dc2626',
        'Tertunda': '#d97706',
        'Belum Mulai': '#94a3b8',
        'Ditangguhkan': '#94a3b8',
      };
      return map[s] || '#64748b';
    };

    const _pctColor = (p: number) => {
      if (p >= 85) return '#16a34a';
      if (p >= 60) return '#2563eb';
      if (p >= 35) return '#d97706';
      return '#dc2626';
    };

    const _pctLabel = (p: number) => {
      if (p >= 85) return isID ? 'Sangat Baik' : 'Excellent';
      if (p >= 60) return isID ? 'Baik' : 'Good';
      if (p >= 35) return isID ? 'Sedang' : 'Fair';
      return isID ? 'Perlu Perhatian' : 'Needs Action';
    };

    const _impactIcon = (u: string) => {
      u = u.toLowerCase();
      if (['orang', 'jiwa', 'nelayan', 'peserta', 'perempuan', 'laki-laki', 'anak', 'pekerja', 'buruh', 'anggota', 'komunitas', 'keluarga', 'people', 'beneficiar', 'fisher', 'member'].some(k => u.includes(k))) return '👥';
      if (['dokumen', 'laporan', 'modul', 'publikasi', 'panduan', 'kebijakan', 'regulasi', 'document', 'report', 'module', 'policy'].some(k => u.includes(k))) return '📄';
      if (['kapal', 'perahu', 'alat', 'unit', 'ship', 'boat', 'vessel'].some(k => u.includes(k))) return '🚢';
      if (['hektar', 'ha', 'km', 'wilayah', 'desa', 'kawasan', 'area', 'village', 'hectare'].some(k => u.includes(k))) return '🗺️';
      if (['kegiatan', 'event', 'pelatihan', 'workshop', 'pertemuan', 'sosialisasi', 'activity', 'training'].some(k => u.includes(k))) return '📅';
      if (['kg', 'ton', 'gram', 'kwintal', 'weight'].some(k => u.includes(k))) return '⚖️';
      if (['mou', 'perjanjian', 'kontrak', 'kesepakatan', 'agreement', 'contract'].some(k => u.includes(k))) return '🤝';
      return '🎯';
    };

    const _rptDate = (d: string | undefined) => {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString(isID ? 'id-ID' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const _toRupiah = (val: number) => {
      return 'Rp ' + val.toLocaleString('id-ID');
    };

    const pbarHtml = (pct: number, color?: string) => {
      const c = color || _pctColor(pct);
      const w = Math.min(pct, 100);
      return `
        <span class="pbar">
          <span class="pbar-track"><span class="pbar-fill" style="width: ${w}%; background: ${c}"></span></span>
          <span class="pbar-pct" style="color: ${c}">${pct}%</span>
        </span>
      `;
    };

    const overallC = _pctColor(overall);

    // Style elements CSS
    const cssStyle = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; font-size: 10pt; color: #1e293b; background: #f8fafc; line-height: 1.5; }
      @page { size: A4 portrait; margin: 15mm 14mm 18mm 14mm; }
      @media print {
        body { background: #fff !important; font-size: 9.5pt; }
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        .section-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        .cover-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
      }

      /* Float action bar */
      .print-bar { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; gap: 10px; filter: drop-shadow(0 4px 16px rgba(0,0,0,.18)); }
      .btn-print { background: linear-gradient(135deg,#2563eb,#1d4ed8); color: #fff; border: none; padding: 12px 26px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: .3px; transition: transform .15s; }
      .btn-print:hover { transform: translateY(-2px); }
      .btn-close { background: #fff; color: #64748b; border: 1.5px solid #e2e8f0; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
      .btn-close:hover { background: #f1f5f9; }

      /* Page container */
      .page { max-width: 820px; margin: 0 auto; padding: 24px 20px 60px; }

      /* Cover Header Banner */
      .cover-header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%); border-radius: 16px; padding: 32px 36px 28px; color: #fff; margin-bottom: 24px; position: relative; overflow: hidden; }
      .cover-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; background: rgba(255,255,255,.06); border-radius: 50%; }
      .cover-org-badge { display: inline-block; background: rgba(255,255,255,.18); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 4px 14px; font-size: 9.5pt; font-weight: 600; letter-spacing: .5px; margin-bottom: 16px; }
      .cover-type { font-size: 9.5pt; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: .8; margin-bottom: 6px; }
      .cover-title { font-size: 19pt; font-weight: 800; line-height: 1.25; margin-bottom: 16px; position: relative; z-index: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
      .cover-period-badge { display: inline-block; background: rgba(255,255,255,.12); color: #fff; font-size: 9pt; font-weight: 700; letter-spacing: .4px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,.2); }
      .cover-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 24px; background: rgba(255,255,255,.08); border-radius: 10px; padding: 12px 16px; backdrop-filter: blur(6px); position: relative; z-index: 1; border: 1px solid rgba(255,255,255,0.06); }
      .cover-meta-item { display: flex; flex-direction: column; gap: 1px; }
      .cover-meta-label { font-size: 8pt; opacity: .7; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; }
      .cover-meta-value { font-size: 9.5pt; font-weight: 600; }
      .cover-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.15); font-size: 8.5pt; opacity: .8; position: relative; z-index: 1; }

      /* Summary stats */
      .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
      .stat-card { background: #fff; border-radius: 14px; padding: 16px 14px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.05); border: 1px solid #f1f5f9; }
      .stat-val { font-size: 20pt; font-weight: 800; line-height: 1.1; }
      .stat-bar { height: 5px; border-radius: 4px; background: #e2e8f0; margin: 8px 6px 0; overflow: hidden; }
      .stat-bar-fill { height: 5px; border-radius: 4px; }
      .stat-label { font-size: 8.5pt; color: #64748b; margin-top: 5px; font-weight: 600; }

      /* Section card */
      .section-card { background: #fff; border-radius: 14px; padding: 20px 22px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.04); border: 1px solid #f1f5f9; }
      .sec-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; }
      .sec-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14pt; flex-shrink: 0; }
      .sec-title-text { font-size: 11pt; font-weight: 800; color: #0f172a; letter-spacing: .1px; text-transform: uppercase; }
      .sec-badge { margin-left: auto; font-size: 8.5pt; font-weight: 700; color: #475569; background: #f1f5f9; border-radius: 20px; padding: 2px 10px; }

      /* Goal/outcome box */
      .goal-box { border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; border: 1px solid; }
      .goal-label { font-size: 8.5pt; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 6px; }
      .outcome-ol { padding-left: 18px; margin: 0; }
      .outcome-ol li { font-size: 9.5pt; margin-bottom: 4px; line-height: 1.5; color: #334155; }

      /* Data table */
      .tbl { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 6px; }
      .tbl th { background: #1e293b; color: #fff; padding: 8px 10px; font-weight: 600; font-size: 8.5pt; text-align: left; }
      .tbl th:first-child { border-radius: 6px 0 0 0; }
      .tbl th:last-child { border-radius: 0 6px 0 0; }
      .tbl td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; color: #334155; }
      .tbl tr:nth-child(even) td { background: #f8fafc; }
      .tbl tfoot td { background: #f1f5f9 !important; font-weight: 700; border-top: 2px solid #cbd5e1; }
      .tbl .num { text-align: right; }
      .tbl .ctr { text-align: center; }

      /* Progress bar */
      .pbar { display: inline-flex; align-items: center; gap: 6px; min-width: 100px; }
      .pbar-track { width: 60px; height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden; flex-shrink: 0; }
      .pbar-fill { height: 7px; border-radius: 4px; }
      .pbar-pct { font-size: 8.5pt; font-weight: 700; min-width: 30px; }

      /* Status Badge */
      .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 8pt; font-weight: 700; white-space: nowrap; }

      /* Hambatan cards */
      .hambatan-list { display: flex; flex-direction: column; gap: 10px; }
      .hambatan-card { border-radius: 10px; padding: 12px 16px; border-left: 4px solid #f59e0b; background: #fffbeb; border-top: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7; border-right: 1px solid #fef3c7; }
      .hambatan-act-title { font-size: 9.5pt; font-weight: 800; color: #92400e; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
      .hambatan-notes { display: flex; flex-direction: column; gap: 5px; }
      .hambatan-note-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 6px; }
      .hambatan-note-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; margin-top: 5px; }
      .hambatan-note-text { font-size: 9.5pt; color: #1e293b; line-height: 1.4; flex: 1; }
      .hambatan-note-meta { font-size: 8pt; color: #94a3b8; margin-top: 1px; font-weight: 600; }
      .hambatan-empty { font-size: 9.5pt; color: #94a3b8; font-style: italic; padding: 10px 0; }

      /* RTL cards / Reflections */
      .rtl-list { display: flex; flex-direction: column; gap: 10px; }
      .rtl-card { border-radius: 10px; padding: 12px 16px; border-left: 4px solid #3b82f6; background: #f0f7ff; border-top: 1px solid #dbeafe; border-bottom: 1px solid #dbeafe; border-right: 1px solid #dbeafe; }
      .rtl-ind-title { font-size: 9.5pt; font-weight: 800; color: #1e40af; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
      .rtl-type-badge { font-size: 8pt; background: #dbeafe; color: #1d4ed8; border-radius: 20px; padding: 1px 8px; font-weight: 700; text-transform: uppercase; }
      .rtl-notes { display: flex; flex-direction: column; gap: 5px; }
      .rtl-note-item { display: flex; gap: 8px; align-items: flex-start; }
      .rtl-note-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 5px; }
      .rtl-note-text { font-size: 9.5pt; color: #1e293b; line-height: 1.4; flex: 1; }
      .rtl-note-meta { font-size: 8pt; color: #94a3b8; margin-top: 1px; font-weight: 600; }

      /* Budget details */
      .budget-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
      .bud-card { border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; background: #f8fafc; }
      .bud-card-label { font-size: 8.5pt; color: #64748b; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
      .bud-card-val { font-size: 13pt; font-weight: 800; color: #0f172a; line-height: 1.1; }
      .bud-card-sub { font-size: 8.5pt; color: #f59e0b; margin-top: 4px; font-weight: 700; }

      /* Impact chips */
      .impact-chips { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 4px; }
      .imp-chip { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 10px 16px; text-align: center; min-width: 105px; flex: 1; }
      .imp-icon { font-size: 18pt; line-height: 1; margin-bottom: 2px; }
      .imp-val { font-size: 13pt; font-weight: 800; color: #15803d; margin: 2px 0; }
      .imp-unit { font-size: 8.5pt; color: #166534; font-weight: 700; text-transform: uppercase; }

      .rpt-footer { margin-top: 28px; padding-top: 14px; border-top: 1.5px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 8.5pt; color: #94a3b8; }
      .rpt-footer-brand { font-weight: 700; color: #1d4ed8; font-size: 9pt; }
    `;

    // Cover Page Block HTML
    const coverPageHtml = `
      <div class="cover-header avoid-break">
        <div class="cover-org-badge">🏢 ${L.org}</div>
        <div class="cover-type">${L.reportType}</div>
        <div class="cover-period-badge">📅 ${periodLabel}</div>
        <div class="cover-title">${proj.name}</div>
        <div class="cover-meta-grid">
          ${proj.location ? `<div class="cover-meta-item"><span class="cover-meta-label">${L.location}</span><span class="cover-meta-value">${proj.location}</span></div>` : ''}
          ${proj.owner ? `<div class="cover-meta-item"><span class="cover-meta-label">${L.owner}</span><span class="cover-meta-value">${proj.owner}</span></div>` : ''}
          ${proj.donor ? `<div class="cover-meta-item"><span class="cover-meta-label">${L.donor}</span><span class="cover-meta-value">${proj.donor}</span></div>` : ''}
          ${proj.startDate ? `<div class="cover-meta-item"><span class="cover-meta-label">${L.start}</span><span class="cover-meta-value">${_rptDate(proj.startDate)}</span></div>` : ''}
          ${proj.deadline ? `<div class="cover-meta-item"><span class="cover-meta-label">${L.deadline}</span><span class="cover-meta-value">${_rptDate(proj.deadline)}</span></div>` : ''}
          <div class="cover-meta-item"><span class="cover-meta-label">${L.status}</span><span class="cover-meta-value">${proj.status || '—'}</span></div>
        </div>
        <div class="cover-footer">
          <span>${L.printedOn}: ${new Date().toLocaleString(isID ? 'id-ID' : 'en-GB')}</span>
          <span style="font-size: 15pt; font-weight: 950; opacity: .95">${overall}% <span style="font-size: 9pt; opacity: .8; font-weight: 600">${_pctLabel(overall)}</span></span>
        </div>
      </div>
    `;

    // Stats Section Block HTML
    const statsSectionHtml = `
      <div class="stats-row avoid-break">
        <div class="stat-card">
          <div class="stat-val" style="color: ${overallC}">${overall}%</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(overall, 100)}%; background: ${overallC}"></div></div>
          <div class="stat-label">${L.overallProg}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: ${_pctColor(avgInd ?? 0)}">${avgInd !== null ? avgInd + '%' : '—'}</div>
          ${avgInd !== null ? `<div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(avgInd, 100)}%; background: ${_pctColor(avgInd)}"></div></div>` : '<div style="height:5px;margin:8px 6px 0"></div>'}
          <div class="stat-label">${L.avgInd}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: ${_pctColor(avgAct ?? 0)}">${avgAct !== null ? avgAct + '%' : '—'}</div>
          ${avgAct !== null ? `<div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(avgAct, 100)}%; background: ${_pctColor(avgAct)}"></div></div>` : '<div style="height:5px;margin:8px 6px 0"></div>'}
          <div class="stat-label">${L.avgAct}</div>
        </div>
        <div class="stat-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; padding: 10px;">
          <div style="font-weight: 800; font-size: 11px; color: #475569;">${L.indDone}</div>
          <div style="font-size: 13pt; font-weight: 950; color: #1d4ed8;">${doneInd} / ${projectIndicators.length}</div>
          <div style="font-weight: 800; font-size: 11px; color: #475569; border-top: 1px solid #f1f5f9; width: 100%; padding-top: 3px; margin-top: 2px;">${L.actDone}</div>
          <div style="font-size: 13pt; font-weight: 950; color: #16a34a;">${doneAct} / ${rangedActivities.length}</div>
        </div>
      </div>
    `;

    // Goals and outcomes Box Block HTML
    const hasGoal = !!proj.goal;
    const hasOut = projectOutcomes.length > 0;
    const hasDesc = !!proj.desc;
    const goalsSectionHtml = (hasGoal || hasOut || hasDesc) ? `
      <div class="section-card avoid-break">
        ${secHead('🎯', L.sec_goal, '#7c3aed')}
        ${hasDesc ? `<p style="font-size: 9.5pt; color: #475569; margin-bottom: 12px; line-height: 1.6; font-style: italic;">${proj.desc}</p>` : ''}
        ${hasGoal ? `
          <div class="goal-box" style="background: #f0f7ff; border-color: #bfdbfe; border-radius: 10px;">
            <div class="goal-label" style="color: #1e40af;">${L.goal}</div>
            <p style="font-size: 9.5pt; color: #1e3a8a; line-height: 1.5; font-weight: 500;">${proj.goal}</p>
          </div>
        ` : ''}
        ${hasOut ? `
          <div class="goal-box" style="background: #f5f3ff; border-color: #ddd6fe; margin-bottom: 0; border-radius: 10px;">
            <div class="goal-label" style="color: #6d28d9;">${L.outcomes}</div>
            <ol class="outcome-ol">${projectOutcomes.map(o => `<li>${o.title}</li>`).join('')}</ol>
          </div>
        ` : ''}
      </div>
    ` : '';

    // Indicators Table Block HTML
    const indRowsHtml = projectIndicators.map((ind, i) => {
      const a = ind.current || 0;
      const tg = ind.target || 0;
      const pct = tg > 0 ? Math.min(Math.round((a / tg) * 100), 999) : 0;
      const c = _pctColor(pct);
      return `
        <tr>
          <td class="ctr" style="font-weight: 700; color: #64748b;">${i + 1}</td>
          <td><strong style="color: #0f172a;">${ind.title}</strong></td>
          <td class="ctr"><span style="font-size: 8pt; background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; border-radius: 20px; padding: 2px 8px; font-weight: 700; text-transform: uppercase;">Output</span></td>
          <td class="num font-bold" style="font-weight: 700;">${tg.toLocaleString('id-ID')} <span style="color:#94a3b8; font-size: 8pt; font-weight: 500;">${ind.unit || ''}</span></td>
          <td class="num" style="font-weight: 750;"><strong style="color: ${c}">${a.toLocaleString('id-ID')}</strong> <span style="color:#94a3b8; font-size: 8pt; font-weight: 500;">${ind.unit || ''}</span></td>
          <td>${pbarHtml(pct, c)}</td>
          <td style="font-size: 8.5pt; color: #64748b;">${ind.lastUpdated ? _rptDate(ind.lastUpdated) : '—'}</td>
        </tr>
      `;
    }).join('');

    const indicatorsSectionHtml = projectIndicators.length ? `
      <div class="section-card page-break">
        ${secHead('📊', L.sec_ind, '#2563eb', projectIndicators.length + ' Indikator')}
        <table class="tbl">
          <thead>
            <tr>
              <th class="ctr" style="width: 28px">#</th>
              <th>${L.indName}</th>
              <th class="ctr" style="width: 75px">${L.type}</th>
              <th class="num" style="width: 105px">${L.target}</th>
              <th class="num" style="width: 110px">${L.actual}</th>
              <th style="width: 115px">${L.pct}</th>
              <th style="width: 90px">${L.lastNote}</th>
            </tr>
          </thead>
          <tbody>${indRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align: right; color: #1e459c; font-weight: 800;">${L.avgInd}:</td>
              <td colspan="2">${pbarHtml(avgInd ?? 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '';

    // Activities Table Block HTML
    const actRowsHtml = rangedActivities.map((act, i) => {
      const c = _statusColor(act.status);
      const prog = act.progress || 0;
      const notesHtml = act.notes && act.notes.length > 0
        ? act.notes.slice(-2).map(n => `
            <div style="display: flex; gap: 4px; align-items: flex-start; margin-bottom: 3px;">
              <span style="color: #f59e0b; flex-shrink: 0; font-size: 8.5pt;">⚠️</span>
              <span style="font-size: 8.5pt; color: #92400e; line-height: 1.3;">${n.text} <em style="color:#94a3b8; font-size: 7.5pt;">(${n.author})</em></span>
            </div>
          `).join('')
        : `<span style="color: #94a3b8; font-size: 8.5pt; font-style: italic;">—</span>`;

      return `
        <tr>
          <td class="ctr" style="font-weight: 700; color: #64748b;">${i + 1}</td>
          <td>
            <strong style="color: #0f172a;">${act.title}</strong>
            ${act.desc ? `<div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">${act.desc}</div>` : ''}
          </td>
          <td style="font-size: 8.5pt; font-weight: 600; color: #475569;">${act.pic || '—'}</td>
          <td class="ctr">${badge(act.status, c)}</td>
          <td class="ctr"><strong style="font-size: 10.5pt; color: ${c}; font-weight: 800;">${prog}%</strong></td>
          <td>${notesHtml}</td>
        </tr>
      `;
    }).join('');

    const activitiesSectionHtml = projectActivities.length ? `
      <div class="section-card page-break">
        ${secHead('📋', L.sec_act, '#0891b2', rangedActivities.length + ' Aktivitas')}
        <table class="tbl">
          <thead>
            <tr>
              <th class="ctr" style="width: 28px">#</th>
              <th>${L.actTitle}</th>
              <th style="width: 100px">${L.pic}</th>
              <th class="ctr" style="width: 85px">${L.actStatus}</th>
              <th class="ctr" style="width: 60px">${L.actProg}</th>
              <th style="min-width: 170px;">${L.actNotes}</th>
            </tr>
          </thead>
          <tbody>${actRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; color: #1e459c; font-weight: 800;">${L.avgAct}:</td>
              <td class="ctr"><strong style="font-size: 11pt; color: ${_pctColor(avgAct ?? 0)}; font-weight: 800;">${avgAct ?? 0}%</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '';

    // Challenges & Obstacles Section (hambatan-card) Block HTML
    const actsWithNotes = rangedActivities.filter((a) => a.notes && a.notes.length > 0);
    const hambatanCardsHtml = actsWithNotes.length
      ? actsWithNotes.map((act) => {
          const notesItems = act.notes.map((n) => `
            <div class="hambatan-note-item">
              <div class="hambatan-note-dot"></div>
              <div>
                <div class="hambatan-note-text" style="font-weight: 500;">${n.text}</div>
                <div class="hambatan-note-meta">${_rptDate(n.date)} · ${n.author}</div>
              </div>
            </div>
          `).join('');
          return `
            <div class="hambatan-card">
              <div class="hambatan-act-title">
                <span style="background: #fef3c7; color: #92400e; border-radius: 6px; padding: 2px 7px; font-size: 8pt; font-weight: 700;">Aktivitas</span>
                ${act.title}
              </div>
              <div class="hambatan-notes">${notesItems}</div>
            </div>
          `;
        }).join('')
      : `<div class="hambatan-empty">${L.noHambatan}</div>`;

    const challengesSectionHtml = `
      <div class="section-card page-break avoid-break">
        ${secHead('⚠️', L.sec_hambatan, '#f59e0b', actsWithNotes.length + ' Aktivitas')}
        <p style="font-size: 9pt; color: #64748b; margin-bottom: 14px; font-style: italic; font-weight: 500;">${L.hambatanDesc}</p>
        <div class="hambatan-list">${hambatanCardsHtml}</div>
      </div>
    `;

    // Lesson learned & Reflection Section (ProjectReflections / project-reflections) Block HTML
    const projectReflectionsInRange = projectReflections.filter((r) => {
      if (!fromMs || !toMs) return true;
      const t = new Date(r.date + 'T00:00:00').getTime();
      return t >= fromMs && t <= toMs;
    });

    const reflectionCardsHtml = projectReflectionsInRange.length > 0
      ? projectReflectionsInRange.map((ref) => {
          let typeColor = '#3b82f6';
          let typeLabel = 'Lesson Learned';
          if (ref.type === 'success') {
            typeColor = '#16a34a';
            typeLabel = isID ? 'Keberhasilan' : 'Success Story';
          } else if (ref.type === 'challenge') {
            typeColor = '#f59e0b';
            typeLabel = isID ? 'Tantangan' : 'Challenge';
          } else if (ref.type === 'recommendation') {
            typeColor = '#7c3aed';
            typeLabel = isID ? 'Rekomendasi' : 'Recommendation';
          }

          let innerContent = `
            <div style="font-size: 9.5pt; color: #1e293b; margin-bottom: 6px; line-height: 1.4; font-weight: 600;">
              ${ref.lesson}
            </div>
          `;
          if (ref.whatHappened) {
            innerContent += `<div style="font-size: 8.5pt; color: #475569; margin-bottom: 4px;"><strong>${isID ? 'Apa yang Terjadi' : 'What Happened'}:</strong> ${ref.whatHappened}</div>`;
          }
          if (ref.nextSteps) {
            innerContent += `<div style="font-size: 8.5pt; color: #1e40af; margin-top: 4px; background: #e0f2fe; padding: 4px 8px; border-radius: 6px;"><strong>📌 ${isID ? 'Tindak Lanjut' : 'Next Steps'}:</strong> ${ref.nextSteps}</div>`;
          }

          return `
            <div class="rtl-card" style="border-left-color: ${typeColor}; background: ${typeColor}08; border-color: ${typeColor}15; border-radius: 10px;">
              <div class="rtl-ind-title" style="color: ${typeColor};">
                <span class="rtl-type-badge" style="background: ${typeColor}15; color: ${typeColor};">${typeLabel}</span>
                ${ref.title || (isID ? 'Refleksi Pelaksanaan' : 'Reflection Entry')}
              </div>
              <div class="rtl-notes">
                <div class="rtl-note-item">
                  <div class="rtl-note-dot" style="background: ${typeColor};"></div>
                  <div style="width: 100%;">
                    ${innerContent}
                    <div class="rtl-note-meta">${_rptDate(ref.date)}${ref.contributor ? ' · ' + ref.contributor : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')
      : `<div class="hambatan-empty">${L.noRTL}</div>`;

    const reflectionsSectionHtml = `
      <div class="section-card avoid-break">
        ${secHead('🗂️', L.sec_rtl, '#1d4ed8', projectReflectionsInRange.length + ' Refleksi')}
        <p style="font-size: 9pt; color: #64748b; margin-bottom: 14px; font-style: italic; font-weight: 500;">${L.rtlDesc}</p>
        <div class="rtl-list">${reflectionCardsHtml}</div>
      </div>
    `;

    // Budget Realization Block HTML
    const budgetSectionHtml = budAppr > 0 ? `
      <div class="section-card avoid-break page-break">
        ${secHead('💰', L.sec_budget, '#f59e0b')}
        <div class="budget-cards">
          <div class="bud-card">
            <div class="bud-card-label">${L.budAppr}</div>
            <div class="bud-card-val">${_toRupiah(budAppr)}</div>
          </div>
          <div class="bud-card" style="background: #fffbeb; border-color: #fde68a;">
            <div class="bud-card-label">${L.budAct}</div>
            <div class="bud-card-val" style="color: #d97706">${_toRupiah(budActFinal)}</div>
            <div class="bud-card-sub">${pbarHtml(budPct, '#f59e0b')}</div>
          </div>
          <div class="bud-card" style="background: ${budLeft >= 0 ? '#f0fdf4' : '#fef2f2'}; border-color: ${budLeft >= 0 ? '#bbf7d0' : '#fca5a5'};">
            <div class="bud-card-label">${L.budLeft}</div>
            <div class="bud-card-val" style="color: ${budLeft >= 0 ? '#16a34a' : '#dc2626'}">${_toRupiah(budLeft)}</div>
          </div>
        </div>
      </div>
    ` : '';

    // Impact Grouping Chips Block HTML
    const impByUnitHtml = impEntries.map(([k, d]) => `
      <div class="imp-chip">
        <div class="imp-icon">${_impactIcon(k)}</div>
        <div class="imp-val">${d.total.toLocaleString('id-ID')}</div>
        <div class="imp-unit">${d.unit}</div>
      </div>
    `).join('');

    const impactSectionHtml = impEntries.length ? `
      <div class="section-card avoid-break">
        ${secHead('🌟', L.sec_impact, '#16a34a')}
        <div class="impact-chips">${impByUnitHtml}</div>
      </div>
    ` : '';

    // Footer Block HTML
    const footerHtml = `
      <div class="rpt-footer">
        <span class="rpt-footer-brand">PMIS M&E Tools</span>
        <span>${L.footerNote} · ${new Date().toLocaleString(isID ? 'id-ID' : 'en-GB')}</span>
      </div>
    `;

    // Supporting generic components helper
    function badge(text: string, color: string) {
      return `
        <span class="badge" style="background: ${color}12; color: ${color}; border: 1.5px solid ${color}30;">
          ${text || '—'}
        </span>
      `;
    }

    function secHead(icon: string, title: string, iconBg: string, count?: string) {
      return `
        <div class="sec-head">
          <div class="sec-icon" style="background: ${iconBg}15; color: ${iconBg};">${icon}</div>
          <div class="sec-title-text">${title}</div>
          ${count !== undefined ? `<div class="sec-badge">${count}</div>` : ''}
        </div>
      `;
    }

    const htmlOutput = `
      <!DOCTYPE html>
      <html lang="${isID ? 'id' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isID ? 'Laporan Monev' : 'M&E Report'}: ${proj.name}</title>
        <style>${cssStyle}</style>
      </head>
      <body>
        <div class="no-print print-bar">
          <button class="btn-print" onclick="window.print()">🖨️ ${isID ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</button>
          <button class="btn-close" onclick="window.close()">✕ ${isID ? 'Tutup' : 'Close'}</button>
        </div>
        <div class="page">
          ${coverPageHtml}
          ${statsSectionHtml}
          ${goalsSectionHtml}
          ${indicatorsSectionHtml}
          ${activitiesSectionHtml}
          ${challengesSectionHtml}
          ${reflectionsSectionHtml}
          ${budgetSectionHtml}
          ${impactSectionHtml}
          ${footerHtml}
        </div>
      </body>
      </html>
    `;

    // Open target print view tab/window
    const printWindow = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      alert(
        isID
          ? 'Pop-up telah diblokir oleh browser Anda. Sila izinkan membuka pop-up agar laporan dapat ditampilkan.'
          : 'Pop-up window was blocked by your browser. Please configure permissions to allow pop-ups for this site.'
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(htmlOutput);
    printWindow.document.close();

    setIsPrintModalOpen(false);
  };

  // Filter reflections related to currently viewed detail project
  const currentProjectReflections = reflections.filter((r) => r.projectId === selectedProjectId);

  // Extract staff names
  const staffNamesList = staff.map((s) => s.name);

  // Filter archived projects
  const archivedProjects = projects.filter((p) => p.isArchived);

  return (
    <div id="dfw-layout-root" className="min-h-screen bg-slate-50/50 flex">
      {/* SIDEBAR NAVIGATION Panel */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-850 select-none hidden md:flex font-medium text-xs leading-none">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-base">
            DFW
          </div>
          <div>
            <span className="font-extrabold text-white text-sm block">Monev Tools</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block">DFW Indonesia</span>
          </div>
        </div>

        {/* Sidebar Tabs Links */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard Monev</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'projects' || activeTab === 'project_detail'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <Folder className="w-4 h-4 shrink-0" />
            <span>Daftar Proyek Utama</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('beneficiary');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'beneficiary'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Penerima Manfaat</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('issues');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'issues'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Isu &amp; Temuan Hukum</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('staff');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Staff &amp; Beban Kerja</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Manajemen Dokumen</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('archive');
              setSelectedProjectId('');
            }}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center gap-3 cursor-pointer text-left transition-all ${
              activeTab === 'archive'
                ? 'bg-blue-600 text-white font-bold'
                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
            }`}
          >
            <FolderMinus className="w-4 h-4 shrink-0" />
            <span>Arsip Proyek Selesai</span>
          </button>
        </nav>

        {/* User identification footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
              DFW
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-200 block truncate">DFW Indonesia</span>
              <span className="text-[10px] text-slate-500 block">Program Coordinator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CORE DISPLAY STAGE */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Coordinator Banner */}
        <div className="bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold block md:hidden text-lg">☰</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>DFW Monitoring Tools</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700">{activeTab.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-full border border-emerald-100 inline-flex items-center gap-1">
              <span>🟢</span> Realtime Database ON
            </span>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="p-1 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer h-8"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        {/* Main Work Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* Quick sync feedback toast indicator */}
          {syncToast && (
            <div className="bg-emerald-500 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs animate-slide-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {syncToast === 'success' ? 'Data berhasil disinkronisasi dengan Supabase Cloud!' : 'Aksi proyek berhasil diproses.'}
              </span>
            </div>
          )}

          {/* TAB ROUTING COMPONENT SWITCH */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              projects={projects}
              activities={activities}
              issues={issues}
              indicators={indicators}
              onSelectProject={handleSelectProject}
              onAddProjectClick={() => setActiveTab('add_project')}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              projects={projects}
              activities={activities}
              indicators={indicators}
              onSelectProject={handleSelectProject}
              onEditProject={handleEditProjectClick}
              onArchiveProject={handleArchiveProject}
              onAddProjectClick={() => setActiveTab('add_project')}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {activeTab === 'project_detail' && selectedProjectId && (
            (() => {
              const proj = projects.find((p) => p.id === selectedProjectId);
              if (!proj) return <p className="text-xs">Proyek tidak ditemukan.</p>;
              
              const projectOutcomes = outcomes.filter((o) => o.projectId === selectedProjectId);
              const projectIndicators = indicators.filter((i) => i.projectId === selectedProjectId);
              const projectActs = activities.filter((a) => a.projectId === selectedProjectId);

              return (
                <ProjectDetailTab
                  project={proj}
                  activities={projectActs}
                  indicators={projectIndicators}
                  outcomes={projectOutcomes}
                  reflections={currentProjectReflections}
                  staffList={staffNamesList}
                  documents={documents}
                  onUpdateDocuments={updateDocumentsInStorage}
                  onBackToDashboard={() => setActiveTab('dashboard')}
                  onEditProjectClick={handleEditProjectClick}
                  onAddActivityClick={() => {
                    setSelectedActivity(undefined);
                    setIsActivityModalOpen(true);
                  }}
                  onEditActivityClick={(act) => {
                    setSelectedActivity(act);
                    setIsActivityModalOpen(true);
                  }}
                  onSaveIndicatorValue={handleSaveIndicatorValueInline}
                  onAddReflection={handleAddReflectionInline}
                  onDeleteReflection={handleDeleteReflectionInline}
                />
              );
            })()
          )}

          {(activeTab === 'add_project' || activeTab === 'edit_project') && (
            <ProjectForm
              initialProject={activeTab === 'edit_project' ? projects.find((p) => p.id === selectedProjectId) : undefined}
              initialIndicators={activeTab === 'edit_project' ? indicators.filter((i) => i.projectId === selectedProjectId) : undefined}
              initialOutcomes={activeTab === 'edit_project' ? outcomes.filter((o) => o.projectId === selectedProjectId) : undefined}
              staffList={staffNamesList}
              onSubmit={handleSaveProjectWizard}
              onCancel={() => {
                if (activeTab === 'edit_project') setActiveTab('project_detail');
                else setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'beneficiary' && (
            <BeneficiaryTab
              beneficiaries={beneficiaries}
              projects={projects}
              activities={activities}
              onUpdateBeneficiaries={updateBeneficiariesInStorage}
              onOpenAddModal={() => {
                setSelectedBen(undefined);
                setIsBenModalOpen(true);
              }}
              onOpenEditModal={(ben) => {
                setSelectedBen(ben);
                setIsBenModalOpen(true);
              }}
              onOpenDetailModal={(ben) => {
                setSelectedDetailBen(ben);
                setIsBenDetailModalOpen(true);
              }}
            />
          )}

          {activeTab === 'issues' && (
            <IssuesTab
              issues={issues}
              projects={projects}
              activities={activities}
              onUpdateIssues={updateIssuesInStorage}
              onRefresh={() => {
                setSyncToast('success');
                setTimeout(() => setSyncToast(''), 1500);
              }}
              allCategories={['IUU Fishing', 'HAM / Ketenagakerjaan', 'Konservasi Mangrove', 'Umum']}
            />
          )}

          {activeTab === 'staff' && (
            <StaffTab
              staffList={staff}
              activities={activities}
              projects={projects}
              onOpenTasksModal={(staffName) => {
                setSelectedStaffTasksName(staffName);
                setIsStaffTasksModalOpen(true);
              }}
            />
          )}

          {activeTab === 'archive' && (
            <div className="space-y-4">
              <div className="border-b border-slate-150 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">🗄️ Arsip Proyek yang Telah Selesai / Ditutup</h3>
                <p className="text-xs text-slate-400">Proyek-proyek yang telah dituntaskan penugasannya oleh kepala program DFW</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Proyek Selesai</th>
                      <th className="py-3 px-4">Lokasi</th>
                      <th className="py-3 px-4">PIC Lapangan</th>
                      <th className="py-3 px-4">Diarsipkan Tanggal</th>
                      <th className="py-3 px-4">Oleh Koordinator</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {archivedProjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                          Belum ada arsip proyek tersimpan.
                        </td>
                      </tr>
                    ) : (
                      archivedProjects.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                          <td className="py-3 px-4">{p.location}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{p.owner}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{p.archivedAt || '—'}</td>
                          <td className="py-3 px-4 text-slate-400">{p.archoredBy || 'Imam T.'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRestoreProject(p.id)}
                              className="text-xs bg-slate-100 hover:bg-slate-200 py-1 px-2.5 rounded-md border text-slate-600 cursor-pointer"
                            >
                              Pulihkan Proyek
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents}
              projects={projects}
              onUpdateDocuments={updateDocumentsInStorage}
              onRefresh={() => {
                setSyncToast('success');
                setTimeout(() => setSyncToast(''), 1500);
              }}
            />
          )}
        </div>
      </main>

      {/* --- INTEGRATED MODALS ROUTING AND POPUPS --- */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        activity={selectedActivity}
        projectId={selectedProjectId}
        staffList={staffNamesList}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(undefined);
        }}
        onSave={handleSaveActivityModal}
        onOpenSubActivities={(activityId) => {
          setActiveParentActivityId(activityId);
          setIsSubActivitiesModalOpen(true);
        }}
      />

      <SubActivitiesModal
        isOpen={isSubActivitiesModalOpen}
        parentActivityId={activeParentActivityId}
        subActivities={subActivities}
        staffList={staffNamesList}
        onClose={() => {
          setIsSubActivitiesModalOpen(false);
          setActiveParentActivityId('');
        }}
        onSaveSubActivity={handleSaveSubActivity}
        onDeleteSubActivity={handleDeleteSubActivity}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onGeneratePrint={handleGeneratePrintOutput}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportDone={handleImportSuccessCallback}
      />

      <BeneficiaryModal
        isOpen={isBenModalOpen}
        beneficiary={selectedBen}
        projectsList={projects.map((p) => ({ id: p.id, name: p.name }))}
        onClose={() => {
          setIsBenModalOpen(false);
          setSelectedBen(undefined);
        }}
        onSave={handleSaveBeneficiaryForm}
      />

      <BenDetailModal
        isOpen={isBenDetailModalOpen}
        beneficiary={selectedDetailBen}
        projects={projects}
        activities={activities}
        onClose={() => {
          setIsBenDetailModalOpen(false);
          setSelectedDetailBen(undefined);
        }}
      />

      <StaffTasksModal
        isOpen={isStaffTasksModalOpen}
        staffName={selectedStaffTasksName}
        activities={activities}
        projects={projects}
        onClose={() => {
          setIsStaffTasksModalOpen(false);
          setSelectedStaffTasksName('');
        }}
      />
    </div>
  );
}
