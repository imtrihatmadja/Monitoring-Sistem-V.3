import React, { useState } from 'react';
import { Project, Activity, Indicator, Outcome, ProjectReflection, ProjectDocument } from '../types';
import {
  Play,
  Calendar,
  MapPin,
  User,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  AlertOctagon,
  Edit,
  Check,
  HelpCircle,
  Save,
  CloudUpload,
  Eye,
  Trash2,
  ExternalLink,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FolderOpen
} from 'lucide-react';
import { DOC_CATEGORIES } from './DocumentsTab';
import { ProjectLearningSection } from './ProjectLearningSection';

interface ProjectDetailTabProps {
  project: Project;
  activities: Activity[];
  indicators: Indicator[];
  outcomes: Outcome[];
  reflections: ProjectReflection[];
  staffList: string[];
  documents: ProjectDocument[];
  onUpdateDocuments: (newDocs: ProjectDocument[]) => void;
  onBackToDashboard: () => void;
  onEditProjectClick: (projectId: string) => void;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  onSaveIndicatorValue: (indicatorId: string, newValue: number) => void;
  onAddReflection: (reflection: Partial<ProjectReflection>) => void;
  onDeleteReflection: (refId: string) => void;
}

export const ProjectDetailTab: React.FC<ProjectDetailTabProps> = ({
  project,
  activities,
  indicators,
  outcomes,
  reflections,
  staffList,
  documents,
  onUpdateDocuments,
  onBackToDashboard,
  onEditProjectClick,
  onAddActivityClick,
  onEditActivityClick,
  onSaveIndicatorValue,
  onAddReflection,
  onDeleteReflection,
}) => {
  // Inline indicator states for quick value edits
  const [indValues, setIndValues] = useState<Record<string, number>>({});

  // Inline Project Documents States
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [inlineDocFile, setInlineDocFile] = useState<File | null>(null);
  const [inlineDocCategory, setInlineDocCategory] = useState('TOR');
  const [inlineDocDesc, setInlineDocDesc] = useState('');
  const [inlineDocProgress, setInlineDocProgress] = useState(0);
  const [inlineIsUploading, setInlineIsUploading] = useState(false);
  const [inlinePreviewDoc, setInlinePreviewDoc] = useState<ProjectDocument | null>(null);

  const initIndValue = (id: string, current: number) => {
    if (indValues[id] === undefined) {
      setIndValues((prev) => ({ ...prev, [id]: current }));
    }
  };

  const handleIndValueChange = (id: string, val: number) => {
    setIndValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveInd = (id: string) => {
    const val = indValues[id];
    if (val !== undefined) {
      onSaveIndicatorValue(id, val);
      // Give visual cues or simple alerts
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id="project-detail-layout" className="space-y-6">
      {/* Header Panel */}
      <div id="detail-header-panel" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onBackToDashboard}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Kembali ke List
              </button>
              <span className="text-[10px] text-slate-300 font-bold">|</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 py-0.5 px-2 rounded-md uppercase tracking-wider">
                {project.donor || 'Mandiri'}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-tight tracking-tight">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-semibold pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>PIC: <strong className="text-slate-700">{project.owner}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 font-mono" />
                <span>Deadline: <strong className="text-slate-700">{project.deadline || '—'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onEditProjectClick(project.id)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-2 px-3.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Proyek
            </button>
          </div>
        </div>

        {/* Goal highlight */}
        {project.goal && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/40 text-xs text-blue-900 leading-relaxed space-y-1">
            <span className="font-extrabold text-[10px] text-blue-600 uppercase tracking-widest block">Goal Proyek</span>
            <p className="font-semibold italic">"{project.goal}"</p>
          </div>
        )}

        {/* Budget overview panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Anggaran Total Disetujui</span>
            <p className="text-sm font-bold text-slate-700 mt-1">{formatRupiah(project.budgetApproved)}</p>
          </div>
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Realisasi Pengeluaran</span>
            <p className="text-sm font-bold text-slate-700 mt-1">{formatRupiah(project.budgetActual)}</p>
          </div>
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Penyerapan</span>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {project.budgetApproved > 0 ? Math.round((project.budgetActual / project.budgetApproved) * 100) : 0}% absorb
            </p>
          </div>
        </div>
      </div>

      {/* Outcomes & Expected results */}
      {outcomes.length > 0 && (
        <div id="project-outcomes" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Hasil yang Diharapkan (Project Outcomes)
          </h3>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            {outcomes.map((o, idx) => (
              <li key={o.id} className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{o.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Split Panel: Left Activities, Right Indicators */}
      <div id="detail-split-panel" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PANEL KIRI: LIST AKTIVITAS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                📋 Rencana &amp; Progress Aktivitas
              </h3>
              <span className="text-[10px] text-slate-400">{activities.length} Kegiatan Ditugaskan</span>
            </div>
            <button
              onClick={onAddActivityClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-1 px-3 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              ＋ Tambah
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[480px] p-0.5">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Belum ada rencana kegiatan untuk proyek ini. Klik tombol Tambah untuk membuat penugasan pertama.
              </div>
            ) : (
              activities.map((act) => {
                let statusColor = 'bg-slate-50 border-slate-200 text-slate-500';
                if (act.status === 'Selesai') {
                  statusColor = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                } else if (act.status === 'Sedang Berjalan') {
                  statusColor = 'bg-sky-50 border-sky-100 text-sky-700';
                } else if (act.status === 'Tertunda') {
                  statusColor = 'bg-rose-50 border-rose-100 text-rose-700';
                }

                return (
                  <div
                    key={act.id}
                    onClick={() => onEditActivityClick(act)}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 hover:border-slate-200 cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`inline-block py-0.5 px-2 rounded border text-[9px] font-bold ${statusColor}`}>
                          {act.status}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs group-hover:text-blue-600 transition-colors leading-relaxed">
                          {act.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold font-mono py-0.5 px-2 bg-white rounded-md border border-slate-100 shrink-0">
                        {act.pic || 'PIC Belum Diputuskan'}
                      </span>
                    </div>

                    {act.desc && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {act.desc}
                      </p>
                    )}

                    {/* Progress slider inside card footer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                        <span>Penyelesaian</span>
                        <span>{act.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${act.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Jatuh Tempo: <strong className="text-slate-500">{act.dueDate || '—'}</strong></span>
                      {act.notes.length > 0 && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold text-[9px]">
                          💬 {act.notes.length} Catatan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL KANAN: UPDATE INDIKATOR */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col min-h-[400px]">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
              📊 Realtime Update Capaian Indikator
            </h3>
            <span className="text-[10px] text-slate-400">Silakan ubah capaian dan simpan secara terpisah</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[480px]">
            {indicators.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada indikator kinerja terdaftar untuk proyek ini.
              </div>
            ) : (
              indicators.map((ind) => {
                initIndValue(ind.id, ind.current);
                const currentVal = indValues[ind.id] !== undefined ? indValues[ind.id] : ind.current;
                const progressPercent = ind.target > 0 ? Math.round((currentVal / ind.target) * 100) : 0;

                return (
                  <div
                    key={ind.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 leading-snug">
                        {ind.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        <span>Target: {ind.target} {ind.unit}</span>
                        <span>•</span>
                        <span className="text-emerald-600">Terbaca: {ind.current} {ind.unit}</span>
                      </div>
                    </div>

                    {/* Progress indicators wrapper */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>Pencapaian Target</span>
                        <span className="text-slate-600">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Inline updating inputs */}
                    <div className="flex items-center gap-2 pt-1 font-semibold text-slate-700">
                      <div className="flex-1 space-y-1 text-slate-400 text-[10px]">
                        <span>Edit Angka Capaian</span>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 py-1 px-2.5 rounded focus:outline-none focus:border-blue-400 text-xs font-bold text-slate-800"
                          value={currentVal}
                          onChange={(e) => handleIndValueChange(ind.id, Number(e.target.value))}
                        />
                      </div>
                      <button
                        onClick={() => handleSaveInd(ind.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-2 px-3 rounded shadow-xs cursor-pointer self-end inline-flex items-center gap-1 transition-all h-[32px] mt-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Simpan
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* BERKAS & DOKUMEN PROYEK (Sinkronisasi GDrive) */}
      <div id="project-documents-panel" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-blue-500" /> Berkas &amp; Dokumen Proyek
            </h3>
            <span className="text-[10px] text-slate-400">Total {documents.filter(d => d.projectName === project.name).length} dokumen tersimpan di Google Drive</span>
          </div>
          <button
            onClick={() => {
              setInlineDocFile(null);
              setInlineDocCategory('TOR');
              setInlineDocDesc('');
              setShowDocUpload(!showDocUpload);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-1.5 px-3 rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
          >
            {showDocUpload ? '✕ Tutup' : '☁️ Unggah'}
          </button>
        </div>

        {/* Inline uploading block */}
        {showDocUpload && (
          <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-200/60 space-y-3 text-xs">
            <span className="text-[10px] font-extrabold text-slate-705 uppercase tracking-widest block">☁️ Upload Berkas untuk Proyek ini</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Pilih Berkas *</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setInlineDocFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-white border border-slate-205 rounded-lg py-1 px-2 text-xs cursor-pointer font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Kategori Berkas *</label>
                <select
                  required
                  className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-blue-400 text-xs font-semibold text-slate-750"
                  value={inlineDocCategory}
                  onChange={(e) => setInlineDocCategory(e.target.value)}
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-full space-y-1">
                <label className="text-slate-500 font-bold block">Deskripsi / Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat tentang isi berkas..."
                  className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold"
                  value={inlineDocDesc}
                  onChange={(e) => setInlineDocDesc(e.target.value)}
                />
              </div>
            </div>

            {inlineIsUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-600">
                  <span>Mengunggah berkas ke Google Drive...</span>
                  <span>{inlineDocProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full transition-all duration-300" style={{ width: `${inlineDocProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setShowDocUpload(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-1 px-3 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!inlineDocFile || inlineIsUploading}
                onClick={() => {
                  if (!inlineDocFile) return;
                  setInlineIsUploading(true);
                  setInlineDocProgress(20);
                  setTimeout(() => {
                    setInlineDocProgress(70);
                    setTimeout(() => {
                      setInlineDocProgress(100);
                      const genId = `drive-inline-${Date.now()}`;
                      const inlineNewDoc: ProjectDocument = {
                        id: `doc-${Date.now()}`,
                        projectName: project.name,
                        category: inlineDocCategory,
                        fileName: inlineDocFile.name,
                        mimeType: inlineDocFile.type || 'application/octet-stream',
                        fileSize: inlineDocFile.size,
                        driveFileId: genId,
                        driveFolderId: 'folder-gdrive-dfw-prod',
                        webViewLink: `https://drive.google.com/file/d/${genId}/view`,
                        description: inlineDocDesc.trim() || undefined,
                        createdAt: new Date().toISOString().split('T')[0],
                      };
                      onUpdateDocuments([...documents, inlineNewDoc]);
                      setInlineIsUploading(false);
                      setShowDocUpload(false);
                      setInlineDocFile(null);
                      setInlineDocDesc('');
                    }, 500);
                  }, 450);
                }}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-1 px-4 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
              >
                <CloudUpload className="w-3.5 h-3.5" /> Unggah Sekarang
              </button>
            </div>
          </div>
        )}

        {/* List of project documents */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {documents.filter(d => d.projectName === project.name).length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada dokumen yang terdaftar untuk proyek ini. Klik tombol Unggah untuk menambahkan berkas pendukung.
            </div>
          ) : (
            documents
              .filter(d => d.projectName === project.name)
              .map((doc) => {
                const cat = DOC_CATEGORIES.find(c => c.code === doc.category) || { icon: '🗂️', label: doc.category };
                const ext = doc.fileName.split('.').pop()?.toLowerCase();
                let fileColor = 'text-slate-400';
                if (doc.mimeType.startsWith('image/')) fileColor = 'text-purple-500';
                if (doc.mimeType === 'application/pdf' || ext === 'pdf') fileColor = 'text-red-500';
                if (ext && ['doc', 'docx'].includes(ext)) fileColor = 'text-blue-500';
                if (ext && ['xls', 'xlsx', 'csv'].includes(ext)) fileColor = 'text-emerald-500';

                return (
                  <div
                    key={doc.id}
                    onClick={() => setInlinePreviewDoc(doc)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 hover:border-slate-200 cursor-pointer transition-all gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <FileText className={`w-4 h-4 ${fileColor}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-[11px] truncate group-hover:text-blue-600 transition-colors" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5 mt-0.5">
                          <span className="font-bold text-slate-500">{cat.icon} {cat.label}</span>
                          <span>•</span>
                          <span>{doc.createdAt || '—'}</span>
                          <span>•</span>
                          <span className="font-mono">{doc.fileSize ? (doc.fileSize / 1024).toFixed(0) + ' KB' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInlinePreviewDoc(doc);
                        }}
                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-250 rounded-lg transition-all"
                        title="Pratinjau"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={doc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-250 rounded-lg transition-all inline-flex"
                        title="Buka Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Hapus dokumen "${doc.fileName}" dari proyek ini?`)) {
                            onUpdateDocuments(documents.filter(d => d.id !== doc.id));
                          }
                        }}
                        className="p-1 px-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-750 border border-transparent hover:border-rose-250 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* PANEL REFLEKSI & PEMBELAJARAN PROYEK */}
      <ProjectLearningSection
        projectId={project.id}
        reflections={reflections}
        staffList={staffList}
        onAddReflection={onAddReflection}
        onDeleteReflection={onDeleteReflection}
      />

      {/* INLINE DRIVE PREVIEW MODAL */}
      {inlinePreviewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col justify-between overflow-hidden text-slate-705">
            {/* Header toolbar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block">Google Drive Cloud Preview</span>
                <h3 className="font-extrabold text-slate-800 text-xs truncate leading-snug mt-0.5">{inlinePreviewDoc.fileName}</h3>
              </div>
              <button
                onClick={() => setInlinePreviewDoc(null)}
                className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer ml-4"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Simulated iframe preview */}
            <div className="flex-1 bg-slate-100 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-905 w-full h-full">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 max-w-sm w-full space-y-4 shadow-sm">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs leading-snug">{inlinePreviewDoc.fileName}</h5>
                    <p className="text-[10px] text-slate-550 font-bold font-mono mt-1 mb-0.5">Ukuran: {inlinePreviewDoc.fileSize ? (inlinePreviewDoc.fileSize / 1024).toFixed(0) + ' KB' : ''}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jenis: {inlinePreviewDoc.mimeType}</p>
                  </div>
                  {inlinePreviewDoc.description && (
                    <div className="bg-slate-50 p-2.5 rounded-lg text-left text-[11px] text-slate-600 leading-normal border border-slate-200/50">
                      <p>{inlinePreviewDoc.description}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <a
                      href={inlinePreviewDoc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer text-center w-full justify-center"
                    >
                      Buka di Google Drive Baru ↗️
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInlinePreviewDoc(null)}
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 py-1.5 px-4 rounded-lg text-slate-750 font-bold cursor-pointer font-sans"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
