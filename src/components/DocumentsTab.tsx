import React, { useState, useEffect } from 'react';
import { ProjectDocument, Project } from '../types';
import {
  Search,
  RotateCcw,
  CloudUpload,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  Plus,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FileMinus,
  X,
  Info,
  Calendar,
  Layers,
  HardDrive
} from 'lucide-react';
import { initAuth, googleSignIn, logout } from '../lib/googleAuth';
import { uploadFileToGoogleDrive } from '../lib/googleDriveService';

export const DOC_CATEGORIES = [
  { code: 'TOR', label: 'TOR / Proposal', icon: '📋' },
  { code: 'LAPORAN_BULANAN', label: 'Laporan Bulanan', icon: '📅' },
  { code: 'FOTO_KEGIATAN', label: 'Foto Kegiatan', icon: '📸' },
  { code: 'DATA_SURVEI', label: 'Data & Survei', icon: '📊' },
  { code: 'BUKTI_CAPAIAN', label: 'Bukti Capaian', icon: '✅' },
  { code: 'MOU', label: 'MOU / Perjanjian', icon: '🤝' },
  { code: 'PUBLIKASI', label: 'Publikasi', icon: '📢' },
  { code: 'LAINNYA', label: 'Lainnya', icon: '🗂️' },
];

interface DocumentsTabProps {
  documents: ProjectDocument[];
  projects: Project[];
  onUpdateDocuments: (newDocs: ProjectDocument[]) => void;
  onRefresh: () => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documents,
  projects,
  onUpdateDocuments,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);

  // Google Drive Connection State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessTokenState(token);
      },
      () => {
        setCurrentUser(null);
        setAccessTokenState(null);
      }
    );
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleConnectDrive = async () => {
    setIsDriveConnecting(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessTokenState(result.accessToken);
      }
    } catch (err: any) {
      alert('Gagal menghubungkan Google Drive: ' + err.message);
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = async () => {
    if (window.confirm('Apakah Anda yakin ingin memutuskan hubungan dengan Google Drive?')) {
      try {
        await logout();
        setCurrentUser(null);
        setAccessTokenState(null);
      } catch (err: any) {
        alert('Gagal memutuskan Google Drive: ' + err.message);
      }
    }
  };

  // Upload Form Fields
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [uploadProject, setUploadProject] = useState('');
  const [uploadCategory, setUploadCategory] = useState('TOR');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Form Fields
  const [editFileName, setEditFileName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Helper file icons
  const getFileIcon = (mimeType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
    if (mimeType.startsWith('video/')) return <ImageIcon className="w-8 h-8 text-amber-500" />;
    if (mimeType === 'application/pdf' || ext === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (ext && ['doc', 'docx'].includes(ext)) return <FileText className="w-8 h-8 text-blue-500" />;
    if (ext && ['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    if (ext && ['ppt', 'pptx'].includes(ext)) return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
    if (ext && ['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="w-8 h-8 text-slate-500" />;
    return <FileText className="w-8 h-8 text-slate-400" />;
  };

  const getFileColor = (mimeType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (mimeType.startsWith('image/')) return 'border-l-purple-500';
    if (mimeType === 'application/pdf' || ext === 'pdf') return 'border-l-red-500';
    if (ext && ['doc', 'docx'].includes(ext)) return 'border-l-blue-500';
    if (ext && ['xls', 'xlsx', 'csv'].includes(ext)) return 'border-l-emerald-500';
    return 'border-l-slate-400';
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Stats calculation
  const totalFilesCount = documents.length;
  const totalBytesValue = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  const totalMbText = (totalBytesValue / 1048576).toFixed(1);

  // Group by category counts
  const categoryCounts: Record<string, number> = {};
  documents.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catCode, count]) => {
      const cat = DOC_CATEGORIES.find((c) => c.code === catCode);
      return {
        label: cat ? `${cat.icon} ${cat.label}` : catCode,
        count,
      };
    });

  // Filter List
  const filteredDocs = documents.filter((doc) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      doc.fileName.toLowerCase().includes(s) ||
      (doc.projectName && doc.projectName.toLowerCase().includes(s)) ||
      (doc.description && doc.description.toLowerCase().includes(s));

    const matchesCategory = categoryFilter ? doc.category === categoryFilter : true;
    const matchesProject = projectFilter ? doc.projectName === projectFilter : true;

    return matchesSearch && matchesCategory && matchesProject;
  });

  // Handle drag and drop selection
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const dropFiles = Array.from(e.dataTransfer.files);
      setStagedFiles((prev) => [...prev, ...dropFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selFiles = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...selFiles]);
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Perform real Google Drive multi-file upload
  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) {
      alert('Pilih berkas file terlebih dahulu.');
      return;
    }
    if (!uploadProject) {
      alert('Pilih asosiasi proyek terlebih dahulu.');
      return;
    }
    if (!accessToken) {
      alert('Hubungkan akun Google Drive Anda terlebih dahulu sebelum mengunggah berkas.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const newDocuments: ProjectDocument[] = [];
      const totalFiles = stagedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = stagedFiles[i];
        
        // Progress update based on files
        setUploadProgress(Math.round(10 + (i / totalFiles) * 80));

        // Upload the actual file to Google Drive
        const uploadResult = await uploadFileToGoogleDrive(file, accessToken);
        
        const docItem: ProjectDocument = {
          id: `doc-${Date.now()}-${i}`,
          projectName: uploadProject,
          category: uploadCategory,
          fileName: file.name,
          mimeType: uploadResult.mimeType || file.type || 'application/octet-stream',
          fileSize: file.size,
          driveFileId: uploadResult.id,
          driveFolderId: 'gdrive-user-file-root',
          webViewLink: uploadResult.webViewLink,
          description: uploadDesc.trim() || undefined,
          createdAt: new Date().toISOString().split('T')[0],
        };

        newDocuments.push(docItem);
      }

      setUploadProgress(100);
      
      // Update the documents state, which will write the records to Supabase
      onUpdateDocuments([...documents, ...newDocuments]);
      
      setIsUploading(false);
      setIsUploadOpen(false);
      setStagedFiles([]);
      setUploadDesc('');
    } catch (err: any) {
      console.error('File Upload to Google Drive Failed:', err);
      const errMsg = err.message || String(err);
      setUploadError(errMsg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Edit Metadata modal
  const openEditModal = (doc: ProjectDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDoc(doc);
    setEditFileName(doc.fileName);
    setEditCategory(doc.category);
    setEditProject(doc.projectName);
    setEditDesc(doc.description || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!editFileName.trim()) {
      alert('Nama file tidak boleh kosong.');
      return;
    }

    const updated = documents.map((doc) => {
      if (doc.id === selectedDoc.id) {
        return {
          ...doc,
          fileName: editFileName.trim(),
          category: editCategory,
          projectName: editProject,
          description: editDesc.trim() || undefined,
        };
      }
      return doc;
    });

    onUpdateDocuments(updated);
    setIsEditOpen(false);
    setSelectedDoc(null);
  };

  // Open preview modal
  const openPreview = (doc: ProjectDocument) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  // Delete handler
  const handleDeleteDoc = (docId: string, docName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${docName}" dari sistem secara permanen?`)) {
      const filtered = documents.filter((doc) => doc.id !== docId);
      onUpdateDocuments(filtered);
    }
  };

  return (
    <div className="space-y-6" id="documents-tab-section">
      {/* Top Banner Navigation area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            📂 Manajemen Berkas &amp; Dokumen
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 py-0.5 px-2 rounded-full">
              Sinkronisasi Google Drive
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Unggah berkas, laporan bulanan, foto lapangan, dan kelola arsip digital untuk seluruh portofolio proyek DFW
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer h-9"
          >
            <RotateCcw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => {
              setStagedFiles([]);
              setUploadProject(projects[0]?.name || '');
              setUploadCategory('TOR');
              setUploadDesc('');
              setUploadError(null);
              setIsUploadOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer h-9"
          >
            <CloudUpload className="w-4 h-4" /> Unggah Dokumen
          </button>
        </div>
      </div>

      {/* Google Drive Status Alert/Banner */}
      {!accessToken ? (
        <div className="space-y-3" id="gdrive-not-connected-banner">
          <div className="bg-amber-50/75 border border-amber-200/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100/80 text-amber-800 rounded-lg shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Google Drive Belum Terhubung</h4>
                <p className="text-[11px] text-slate-600 max-w-xl leading-relaxed">
                  Hubungkan dengan Google Drive Anda untuk mulai mengunggah file laporan, TOR, dan foto kegiatan secara otomatis langsung ke penyimpanan awan Google Drive Anda.
                </p>
              </div>
            </div>
            <button
              onClick={handleConnectDrive}
              disabled={isDriveConnecting}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-extrabold text-xs py-2 px-4 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto h-9"
            >
              <CloudUpload className="w-4 h-4" /> {isDriveConnecting ? 'Menghubungkan...' : 'Hubungkan Google Drive'}
            </button>
          </div>

          {/* Guide card to fix auth/unauthorized-domain */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 font-black text-slate-800">
              <span className="text-amber-500 text-sm">💡</span>
              <span>CARA MENGATASI ERROR "Firebase: Error (auth/unauthorized-domain)"</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Setiap domain tempat aplikasi dijalankan (termasuk pratinjau AI Studio maupun GitHub Pages) harus didaftarkan di menu <strong>Authorized domains</strong> pada Firebase Console proyek Anda agar login Google berhasil:
            </p>
            <ol className="list-decimal list-inside text-[11px] space-y-1.5 pl-1 text-slate-600 font-medium">
              <li>Buka <strong>Firebase Console</strong> proyek Anda.</li>
              <li>Masuk ke menu <strong>Authentication</strong> di sisi kiri &gt; pilih tab <strong>Settings</strong>.</li>
              <li>Pilih menu <strong>Authorized domains</strong>, klik tombol <strong>Add domain</strong> (Tambah domain).</li>
              <li>Masukkan domain-domain berikut ini satu-per-satu (<strong>PENTING: Jangan sertakan https:// atau tanda garis miring /</strong>):</li>
            </ol>
            <div className="bg-slate-800 p-3 rounded-xl font-mono text-[10px] text-zinc-300 select-all space-y-2 border border-slate-700/50 shadow-inner">
              <div className="flex items-center justify-between pb-1 border-b border-slate-700 text-zinc-400 text-[9px] font-sans">
                <span>Domain yang harus dimasukkan (Salin satu per satu):</span>
                <span className="text-[8px] bg-zinc-700 text-zinc-300 py-0.5 px-1.5 rounded-sm uppercase tracking-wider font-semibold">Salin</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-sans">1. Untuk GitHub Pages Anda (Hanya domain bersih):</span>
                <span className="font-semibold text-emerald-400">imtrihatmadja.github.io</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-sans">2. Domain Ruang Kerja Development ini:</span>
                <span className="font-semibold text-amber-400">ais-dev-shvwan7awjn5ikoq23hszt-950445958778.asia-southeast1.run.app</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-sans">3. Domain Pratinjau Shared ini:</span>
                <span className="font-semibold text-amber-400">ais-pre-shvwan7awjn5ikoq23hszt-950445958778.asia-southeast1.run.app</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold italic">
              *Catatan: Pastikan menuliskan persis tanpa "https://" dan tanpa subfolder di belakangnya. Setelah domain-domain tersebut disimpan di Firebase Console, harap muat ulang (refresh) halaman ini dan coba hubungkan kembali!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/65 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs" id="gdrive-connected-banner">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100/70 text-emerald-800 rounded-lg shrink-0">
              <HardDrive className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Google Drive Aktif &amp; Terhubung</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Terhubung sebagai <span className="font-semibold text-emerald-800">{currentUser?.email || 'Akun Google'}</span>. File yang diunggah akan langsung disimpan di Google Drive Anda.
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnectDrive}
            className="text-red-600 hover:text-red-700 font-bold text-xs py-2 px-3.5 rounded-lg hover:bg-red-50 transition-all border border-red-200/50 cursor-pointer h-9 shrink-0"
          >
            Putus Hubungan
          </button>
        </div>
      )}

      {/* Numerical and Visual Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="documents-stats-cards">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total File Tersimpan</p>
            <p className="text-2xl font-black text-slate-800 leading-none mt-1">{totalFilesCount}</p>
            <span className="text-[9px] text-slate-400 block mt-1">berkas digital resmi DFW</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-blue-50/5 flex items-center gap-4 hover:border-blue-200 transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Kapasitas Penyimpanan</p>
            <p className="text-2xl font-black text-blue-700 leading-none mt-1">{totalMbText} MB</p>
            <span className="text-[9px] text-blue-500 font-medium block mt-1">kuota aman tersinkronisasi G-Drive</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/5 flex items-center gap-4 hover:border-emerald-200 transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Kategori Dominan</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {topCategories.length === 0 ? (
                <span className="text-xs text-slate-400">Belum ada kategori file</span>
              ) : (
                topCategories.map((c, i) => (
                  <span key={i} className="text-[9px] bg-slate-100 text-slate-600 py-0.5 px-2 rounded-md font-semibold border border-slate-200/50">
                    {c.label} ({c.count})
                  </span>
                ))
              )}
            </div>
            <span className="text-[9px] text-emerald-600 font-bold block mt-1">klasifikasi arsip utama</span>
          </div>
        </div>
      </div>

      {/* Filtering Options Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs" id="documents-filter-ribbon">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            placeholder="Cari nama dokumen, deskripsi, atau proyek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {DOC_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          <select
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Semua Proyek</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="documents-grid">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
            <FileMinus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold">Tidak ada folder berkas/dokumen yang ditemukan.</p>
            <p className="text-[10px] text-slate-400 mt-1">Ubah kata kunci filter atau tambahkan berkas dokumen baru.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const cat = DOC_CATEGORIES.find((c) => c.code === doc.category) || { icon: '🗂️', label: doc.category };
            const classColor = getFileColor(doc.mimeType, doc.fileName);

            return (
              <div
                key={doc.id}
                onClick={() => openPreview(doc)}
                className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${classColor} hover:border-slate-250 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group`}
              >
                {/* Thumb Header */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-slate-50 rounded-xl shrink-0">
                      {getFileIcon(doc.mimeType, doc.fileName)}
                    </div>
                    {/* Size & Action tag */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={(e) => openEditModal(doc, e)}
                        className="p-1 px-2 hover:bg-amber-50 text-slate-400 hover:text-amber-700 border border-transparent hover:border-amber-200 rounded-lg transition-all"
                        title="Edit detail berkas"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDoc(doc.id, doc.fileName, e)}
                        className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-rose-750 border border-transparent hover:border-rose-200 rounded-lg transition-all"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-xs leading-normal group-hover:text-blue-600 transition-colors line-clamp-2" title={doc.fileName}>
                      {doc.fileName}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.projectName}</p>
                  </div>

                  {doc.description && (
                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 bg-slate-50 rounded-lg p-2 font-medium">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Footer and classifications */}
                <div className="bg-slate-50/50 p-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-extrabold text-slate-600 bg-white py-0.5 px-2 rounded border border-slate-100">
                    {cat.icon} {cat.label}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{doc.createdAt || '—'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================
          MODAL: UPLOAD FILE DOKUMEN TO DRIVE
         ========================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-150 max-w-lg w-full shadow-2xl overflow-hidden font-medium text-slate-700 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <CloudUpload className="w-4 h-4 text-blue-600" /> Unggah Dokumen Lapangan
              </span>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 hover:bg-slate-100 border border-slate-150 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStartUpload} className="p-5 space-y-4">
              {/* Display upload errors beautifully */}
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl space-y-2 text-[11px] shadow-sm">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                    <span>⚠️ Gagal Mengunggah Berkas</span>
                  </div>
                  
                  {(() => {
                    const apiLinkMatch = uploadError.match(/https:\/\/console\.developers\.google\.com\/apis\/api\/drive\.googleapis\.com\/overview[^\s"'`]+/);
                    const apiLink = apiLinkMatch ? apiLinkMatch[0] : null;

                    if (uploadError.includes("Google Drive API has not been used") || apiLink) {
                      return (
                        <div className="space-y-2 mt-1">
                          <p className="leading-relaxed text-rose-750">
                            <strong>Penyebab:</strong> Layanan <strong>Google Drive API</strong> belum diaktifkan di konsol Google Cloud (GCP) Anda.
                          </p>
                          <div className="bg-white/80 border border-rose-100 p-2.5 rounded-lg space-y-1">
                            <span className="font-bold block text-[10px] text-slate-705">CARA MENGAKTIFKAN:</span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600">
                              <li>Klik link di bawah ini untuk menuju halaman aktivasi:</li>
                              <div className="my-1.5 font-mono text-[9px] bg-slate-900 p-2.5 rounded-md truncate relative flex items-center justify-between">
                                <a 
                                  href={apiLink || "https://console.cloud.google.com/apis/library/drive.googleapis.com"} 
                                  target="_blank" 
                                  referrerPolicy="no-referrer"
                                  className="text-amber-400 font-bold hover:underline truncate mr-2"
                                  title="Buka halaman aktivasi Google Drive API"
                                >
                                  {apiLink || "Buka Halaman Google Drive API"} ↗
                                </a>
                              </div>
                              <li>Di halaman konsol tersebut, klik tombol <strong>"Enable" (Aktifkan)</strong>.</li>
                              <li>Tunggu sekitar 1-2 menit, lalu silakan dicoba klik tombol <strong>"Unggah Sekarang"</strong> kembali!</li>
                            </ol>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p className="font-mono bg-white/65 p-2 rounded border border-rose-100/50 break-all select-all">
                        {uploadError}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Drag and Drop Zone Area */}
              <div
                className="border-2 border-dashed border-slate-205 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/5 transition-all relative cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="picker-input"
                />
                <CloudUpload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Tarik &amp; Letakkan Berkas Di Sini</p>
                <p className="text-[10px] text-slate-400 mt-0.5">atau Klik untuk Menjelajahi Berkas Komputer</p>
                <p className="text-[9px] text-slate-400 mt-2 font-semibold">PDF, Word, Excel, Gambar, Presentasi (Maks 50MB)</p>
              </div>

              {/* List of staged files waiting */}
              {stagedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berkas Staged ({stagedFiles.length})</span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {stagedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-semibold bg-white p-1.5 rounded border border-slate-100">
                        <span className="truncate flex-1 pr-2 text-slate-750">{file.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[10px] text-slate-400">{formatSize(file.size)}</span>
                          <button
                            type="button"
                            onClick={() => removeStagedFile(i)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Associations */}
              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Pilih Proyek Asosiasi *</label>
                <select
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white font-bold"
                  value={uploadProject}
                  onChange={(e) => setUploadProject(e.target.value)}
                >
                  <option value="">-- Pilih Proyek Terdaftar --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Kategori Berkas *</label>
                  <select
                    required
                    className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white font-semibold"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    {DOC_CATEGORIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-550 font-bold block">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Misal: Versi Final, Laporan Mei"
                    className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Progress emulation indicator */}
              {isUploading && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-600">
                    <span>Mengunggah berkas ke Google Drive...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Footer commands */}
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || stagedFiles.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-2 px-5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CloudUpload className="w-4 h-4" /> Unggah Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: EDIT FILE METADATA
         ========================================= */}
      {isEditOpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-150 max-w-md w-full shadow-2xl overflow-hidden font-medium text-slate-700 text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                ✏️ Edit Atribut Berkas Dokumen
              </span>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 hover:bg-slate-100 border border-slate-150 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Nama Berkat Dokumen *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama file dokumen"
                  className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white font-bold"
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Proyek Diasosiasikan *</label>
                <select
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white font-bold"
                  value={editProject}
                  onChange={(e) => setEditProject(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Kategori Klasifikasi *</label>
                <select
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white font-semibold"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-550 font-bold block">Deskripsi Berkas</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-50/50 border border-slate-200 py-2 px-3 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-white text-xs font-semibold"
                  placeholder="Keterangan singkat tentang isi dokumen..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 border border-slate-800 hover:bg-black text-white font-extrabold py-2 px-5 rounded-xl transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: VIEW DRIVE EMBEDDED PREVIEW
         ========================================= */}
      {isPreviewOpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden font-medium text-slate-700 text-xs">
            {/* Header toolbar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block">Google Drive Cloud Preview</span>
                <h3 className="font-extrabold text-slate-800 text-xs truncate leading-snug mt-0.5">{selectedDoc.fileName}</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer ml-4"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Embedded simulation stage */}
            <div className="flex-1 bg-slate-100 relative">
              {/* Emulate Drive iframe safely with visual container */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-905 w-full h-full">
                <div className="p-5 bg-white rounded-2xl border border-slate-200/55 max-w-sm w-full space-y-4 shadow-sm">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                    {getFileIcon(selectedDoc.mimeType, selectedDoc.fileName)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs leading-snug">{selectedDoc.fileName}</h5>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jenis: {selectedDoc.mimeType}</p>
                    <p className="text-[10px] text-slate-500 font-bold font-mono mt-1 mt-0.5">Ukuran: {formatSize(selectedDoc.fileSize)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-left text-[11px] text-slate-600 leading-normal border border-slate-200/50">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Deskrpsi Berkas:</span>
                    <p>{selectedDoc.description || 'Tidak ada deskripsi detail berkas.'}</p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={selectedDoc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer text-center w-full justify-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka di Google Drive Baru ↗️
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer information */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-semibold text-slate-500">Program: {selectedDoc.projectName}</span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 py-1.5 px-3.5 rounded-lg text-slate-700 font-bold cursor-pointer"
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
