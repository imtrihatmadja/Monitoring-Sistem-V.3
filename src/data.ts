import { Project, Indicator, Outcome, Activity, Beneficiary, Issue, Staff, ProjectReflection, ProjectDocument } from './types';

export const INITIAL_STAFF: Staff[] = [
  { id: 'st-01', name: 'Imam Trihatmadja', role: 'Program Director', status: 'active' },
  { id: 'st-02', name: 'Fadli S.', role: 'Field Officer - WPP 718', status: 'active' },
  { id: 'st-03', name: 'Siti Nurul', role: 'Social Safeguard Expert', status: 'active' },
  { id: 'st-04', name: 'Andi Wijaya', role: 'Fisheries Supervisor', status: 'active' },
  { id: 'st-05', name: 'Dewi Lestari', role: 'Financial Officer', status: 'active' },
  { id: 'st-06', name: 'Budi Hartono', role: 'Field Assistant', status: 'active' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p-01',
    name: 'Fisheries Improvement Project (FIP) - WPP 718',
    location: 'Merauke, Dobo, Tual',
    owner: 'Fadli S.',
    donor: 'USAID',
    status: 'On Track',
    startDate: '2026-01-10',
    deadline: '2026-12-20',
    progress: 70,
    budgetApproved: 750000000,
    budgetActual: 480000000,
    desc: 'Proyek peningkatan tata kelola perikanan kakap merah dan perlindungan awak kapal perikanan (AKP) di wilayah perairan Laut Arafura.',
    note: 'Koordinasi dengan pelabuhan berjalan baik, namun cuaca buruk sempat menunda kunjungan kapal di Dobo.',
    goal: 'Mewujudkan praktik perikanan tangkap yang lestari dan adil melalui sertifikasi kapabilitas nelayan dasar, jaminan sosial ketenagakerjaan, dan perlindungan ekosistem penangkapan kakap merah.',
    isArchived: false
  },
  {
    id: 'p-02',
    name: 'Safeguarding Against Forced Labor in Fishing (SAFE)',
    location: 'Bitung & Muara Baru',
    owner: 'Siti Nurul',
    donor: 'ILO',
    status: 'Terlambat',
    startDate: '2026-02-15',
    deadline: '2026-11-30',
    progress: 42,
    budgetApproved: 950000000,
    budgetActual: 380000000,
    desc: 'Upaya integratif pencegahan kerja paksa, perlindungan hak-hak pekerja, serta pemantauan rekrutmen awak kapal perikanan jarak jauh.',
    note: 'Butuh eskalasi komunikasi dengan dinas ketenagakerjaan setempat untuk akreditasi Posko Pengaduan.',
    goal: 'Meminimalisir eksploitasi, kerja paksa, dan TPPO bagi AKP migran maupun domestik yang beroperasi dari pelabuhan perikanan samudera.',
    isArchived: false
  },
  {
    id: 'p-03',
    name: 'Kemitraan Konservasi Mangrove & Ketahanan Pesisir',
    location: 'Kepulauan Seribu & Pantura',
    owner: 'Andi Wijaya',
    donor: 'Yayasan Kehati',
    status: 'Selesai',
    startDate: '2025-05-01',
    deadline: '2026-05-01',
    progress: 100,
    budgetApproved: 420000000,
    budgetActual: 418000000,
    desc: 'Rehabilitasi pesisir dan penganekaragaman mata pencaharian alternatif berkelanjutan bagi istri nelayan tradisional.',
    note: 'Seluruh target bibit tercapai. Penanaman tuntas dipantau bersama kelompok tani.',
    goal: 'Mengembalikan fungsi ekologis penyangga pantai dari ancaman abrasi pesisir utara dan memperkuat stabilitas ekonomi rumah tangga nelayan skala kecil.',
    isArchived: false
  },
  {
    id: 'p-04',
    name: 'Digitalisasi Pemantauan Kapal Nelayan Skala Kecil',
    location: 'Sultra & NTB',
    owner: 'Andi Wijaya',
    donor: 'WWF Indonesia',
    status: 'Ditangguhkan',
    startDate: '2026-03-01',
    deadline: '2026-10-15',
    progress: 15,
    budgetApproved: 350000000,
    budgetActual: 50000000,
    desc: 'Uji coba pemasangan perangkat tracker berbasis seluler/satelit hemat daya pada perahu nelayan di bawah 10 GT.',
    note: 'Proyek ditunda sementara karena masalah rantai pasok cip perangkat tracker impor.',
    goal: 'Mendeteksi pergerakan kapal tangkap skala kecil untuk memastikan pelaporan daerah penangkapan ikan (catch area tracing).',
    isArchived: false
  }
];

export const INITIAL_INDICATORS: Indicator[] = [
  // FIP WPP 718 (p-01)
  { id: 'ind-01', projectId: 'p-01', title: 'Kapal kakap merah kecil terdaftar dengan logbook aktif', target: 120, current: 85, unit: 'Kapal', lastUpdated: '2026-06-10', lastValue: 75 },
  { id: 'ind-02', projectId: 'p-01', title: 'Awak Kapal Perikanan mandiri yang dilindungi BPJS Ketenagakerjaan', target: 500, current: 380, unit: 'Orang', lastUpdated: '2026-06-12', lastValue: 320 },
  { id: 'ind-03', projectId: 'p-01', title: 'Pelabuhan perikanan pelaksana verifikasi hak upah minimum', target: 3, current: 2, unit: 'Pelabuhan', lastUpdated: '2026-05-20', lastValue: 1 },

  // SAFE (p-02)
  { id: 'ind-04', projectId: 'p-02', title: 'SOP rekrutmen AKP adil yang diadopsi oleh agen manning (manpower)', target: 10, current: 4, unit: 'Perusahaan', lastUpdated: '2026-06-05', lastValue: 3 },
  { id: 'ind-05', projectId: 'p-02', title: 'Kasus pengaduan kerja paksa nelayan yang ditindaklanjuti tuntas', target: 25, current: 12, unit: 'Kasus', lastUpdated: '2026-06-14', lastValue: 10 },
  { id: 'ind-06', projectId: 'p-02', title: 'Syahbandar perikanan yang dilatih pengawasan ketenagakerjaan', target: 40, current: 15, unit: 'Petugas', lastUpdated: '2026-05-15', lastValue: 15 },

  // Mangrove (p-03)
  { id: 'ind-07', projectId: 'p-03', title: 'Bibit mangrove tumbuh subur (survival rate > 80%)', target: 50000, current: 52000, unit: 'Batang', lastUpdated: '2026-04-28', lastValue: 48000 },
  { id: 'ind-08', projectId: 'p-03', title: 'Kelompok usaha wanita pengolah buah mangrove dibentuk & berizin', target: 4, current: 4, unit: 'Kelompok', lastUpdated: '2026-04-30', lastValue: 3 }
];

export const INITIAL_OUTCOMES: Outcome[] = [
  { id: 'out-01', projectId: 'p-01', title: 'Terwujudnya ketertelusuran produk kakap merah dari WPP 718 ke pasar ekspor.' },
  { id: 'out-02', projectId: 'p-01', title: 'Menurunnya angka kecelakaan kerja AKP tanpa santunan di Dobo dan Merauke.' },
  { id: 'out-03', projectId: 'p-02', title: 'Terbangunnya mekanisme perlindungan hukum bagi AKP dari penipuan upah dan penyanderaan dokumen oleh pemilik kapal.' },
  { id: 'out-04', projectId: 'p-03', title: 'Meningkatnya pertahanan pantai alami desa binaan dari ancaman banjir rob bulanan.' }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-01',
    projectId: 'p-01',
    title: 'Sosialisasi Keselamatan Berlayar & BPJS Ketenagakerjaan',
    desc: 'Penyuluhan langsung di balai nelayan muara mengenai pentingnya asuransi kecelakaan pelayaran mandiri.',
    pic: 'Fadli S.',
    status: 'Selesai',
    startDate: '2026-02-10',
    dueDate: '2026-02-12',
    progress: 100,
    notes: [
      { id: 'n-01', text: 'Dihadiri 75 nelayan lokal. Minat pendaftaran tinggi setelah simulasi klaim santunan diajarkan.', date: '2026-02-12', author: 'Fadli S.' }
    ],
    files: [
      { id: 'f-01', name: 'daftar_hadir_sosialisasi_dobo.pdf', size: 1240000, type: 'application/pdf' },
      { id: 'f-02', name: 'foto_dokumentasi_nelayan.jpg', size: 2800000, type: 'image/jpeg' }
    ]
  },
  {
    id: 'act-02',
    projectId: 'p-01',
    title: 'Pelatihan Pencatatan Logbook Elektronik Kakap Merah',
    desc: 'Pelatihan teknis pengoperasian aplikasi pencatatan tangkapan ikan pada nelayan tangkap kecil.',
    pic: 'Fadli S.',
    status: 'Sedang Berjalan',
    startDate: '2026-05-15',
    dueDate: '2026-06-30',
    progress: 75,
    notes: [
      { id: 'n-02', text: 'Tantangan: Beberapa nelayan tua kesulitan adaptasi antarmuka ponsel. Diberikan pendampingan intensif berdua.', date: '2026-06-01', author: 'Fadli S.' }
    ],
    files: [
      { id: 'f-03', name: 'panduan_manual_e_logbook.pdf', size: 4500000, type: 'application/pdf' }
    ]
  },
  {
    id: 'act-03',
    projectId: 'p-02',
    title: 'Inspeksi Bersama Hak Ketenagakerjaan di Atas Kapal Samudera',
    desc: 'Kolaborasi inspeksi acak dengan pengawas ketenagakerjaan setempat untuk memeriksa kontrak kerja fisik AKP sebelum berlayar.',
    pic: 'Siti Nurul',
    status: 'Tertunda',
    startDate: '2026-04-05',
    dueDate: '2026-05-10',
    progress: 30,
    notes: [
      { id: 'n-03', text: 'Hambatan: Pemilik kapal bersikap tidak kooperatif, menolak menyerahkan draf PKB dengan alasan rahasia perusahaan.', date: '2026-05-01', author: 'Siti Nurul' }
    ],
    files: []
  },
  {
    id: 'act-04',
    projectId: 'p-02',
    title: 'Peluncuran Posko Aduan Hak Nelayan & AKP',
    desc: 'Pengadaan meja bantuan aduan hukum bagi AKP yang mengalami perselisihan ketenagakerjaan atau gaji.',
    pic: 'Siti Nurul',
    status: 'Sedang Berjalan',
    startDate: '2026-03-20',
    dueDate: '2026-09-30',
    progress: 55,
    notes: [
      { id: 'n-04', text: 'Sudah menerima 8 aduan resmi. 3 di antaranya berhasil dimediasi untuk penyelesaian upah tertahan.', date: '2026-06-11', author: 'Siti Nurul' }
    ],
    files: [
      { id: 'f-04', name: 'laporan_triwulan_aduan_posko.pdf', size: 1800000, type: 'application/pdf' }
    ]
  },
  {
    id: 'act-05',
    projectId: 'p-03',
    title: 'Aksi Tanam Bersama 50.000 Mangrove Pesisir',
    desc: 'Mobilisasi relawan pesisir dan penamanan serentak kawasan penyangga pasang surut air laut.',
    pic: 'Andi Wijaya',
    status: 'Selesai',
    startDate: '2025-10-01',
    dueDate: '2025-10-15',
    progress: 100,
    notes: [
      { id: 'n-05', text: 'Kerjasama dengan 4 kelompok tani sukses. Survival rate 92% dipantau berkala.', date: '2025-11-20', author: 'Andi Wijaya' }
    ],
    files: [
      { id: 'f-05', name: 'laporan_survival_mangrove_1.pdf', size: 2100000, type: 'application/pdf' }
    ]
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-01',
    name: 'Saharudin Ali',
    phone: '081234567890',
    gender: 'Laki-laki',
    birthyear: 1980,
    location: 'Dobo, Kepulauan Aru',
    occupation: 'Nelayan Kakap',
    email: 'saharudin.aru@gmail.com',
    note: 'Nelayan kapal 8 GT yang vokal dan kooperatif sebagai kader lokal.',
    registrations: [
      { projectId: 'p-01', activityId: 'act-01', attendedDate: '2026-02-10', note: 'Aktif mendaftar BPJS Ketenagakerjaan langsung' },
      { projectId: 'p-01', activityId: 'act-02', attendedDate: '2026-05-15', note: 'Menguasai pencatatan e-logbook dengan cepat' }
    ]
  },
  {
    id: 'ben-02',
    name: 'Yohanis Maru',
    phone: '085299887711',
    gender: 'Laki-laki',
    birthyear: 1988,
    location: 'Wamar, Dobo',
    occupation: 'Nelayan Kakap',
    email: 'yohanismaru@yahoo.com',
    note: 'Butuh asistensi tambahan untuk navigasi ponsel.',
    registrations: [
      { projectId: 'p-01', activityId: 'act-02', attendedDate: '2026-05-15', note: 'Hadir membawa berkas tangkapan' }
    ]
  },
  {
    id: 'ben-03',
    name: 'Sumarni Jafar',
    phone: '082199002233',
    gender: 'Perempuan',
    birthyear: 1984,
    location: 'Untia, Makassar',
    occupation: 'Pengolah Ikan',
    email: 'sumarni.untia@gmail.com',
    note: 'Ketua Kelompok Wanita Nelayan Bahari Untia.',
    registrations: [
      { projectId: 'p-03', activityId: 'act-05', attendedDate: '2025-10-01', note: 'Penyokong utama kuliner buah mangrove' }
    ]
  },
  {
    id: 'ben-04',
    name: 'Robertus L.',
    phone: '081388776655',
    gender: 'Laki-laki',
    birthyear: 1993,
    location: 'Bitung',
    occupation: 'AKP Kapal Tuna',
    email: 'robertus.tuna@gmail.com',
    note: 'Pernah mengadukan masalah paspor ditahan agen; berhasil diselesaikan.',
    registrations: [
      { projectId: 'p-02', activityId: 'act-04', attendedDate: '2026-04-10', note: 'Konsultasi pengaduan penahanan dokumen kerja' }
    ]
  },
  {
    id: 'ben-05',
    name: 'Halimah',
    phone: '087812123434',
    gender: 'Perempuan',
    birthyear: 1976,
    location: 'Muarasari, Kepulauan Seribu',
    occupation: 'Ibu Rumah Tangga',
    email: 'halimah1000@gmail.com',
    note: 'Terlibat dalam budidaya sirup mangrove.',
    registrations: [
      { projectId: 'p-03', activityId: 'act-05', attendedDate: '2025-10-02', note: 'Membawa bibit tersertifikasi' }
    ]
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'is-01',
    title: 'Keterlambatan Penyaluran Hak Upah AKP Bitung',
    description: 'Sebanyak 12 orang pelaut perikanan lokal melaporkan bahwa pemilik kapal menghindar dan menahan gaji 3 bulan pasca-pendaratan.',
    category: 'HAM / Ketenagakerjaan',
    projectId: 'p-02',
    activityId: 'act-04',
    severity: 'high',
    status: 'active',
    dateOccurred: '2026-05-18',
    sourceType: 'MANUAL',
    tags: 'hak upah, akp bitung, eksploitasi',
    updates: [
      { id: 'up-01', text: 'Aduan diterima di Posko SAFE. Draf kronologi resmi telah disusun oleh tim hukum.', date: '2026-05-19' },
      { id: 'up-02', text: 'Melayangkan surat panggilan kesepakatan tripartit bersama Dinas Perikanan dan Pemilik Kapal.', date: '2026-06-02' },
      { id: 'up-03', text: 'Pemilik kapal bersedia membayar separuh tunggakan minggu ini. Pengawasan dilanjutkan.', date: '2026-06-12' }
    ]
  },
  {
    id: 'is-02',
    title: 'Dugaan Pelanggaran Jalur Tangkap Kapal Trawl Asing di Dobo',
    description: 'Kelompok nelayan tradisional Dobo mendeteksi 2 kapal trawl besar beroperasi di bawah 12 mil laut pendeteksian tradisional.',
    category: 'IUU Fishing',
    projectId: 'p-01',
    activityId: 'act-02',
    severity: 'critical',
    status: 'monitoring',
    dateOccurred: '2026-06-03',
    sourceType: 'MANUAL',
    tags: 'iuu fishing, arafura, trawl ilegal',
    updates: [
      { id: 'up-04', text: 'Tim mengumpulkan titik koordinat dan foto tangkapan layar radar nelayan.', date: '2026-06-04' },
      { id: 'up-05', text: 'Laporan diteruskan ke Pangkalan PSDKP Tual untuk rencana patroli reaksi cepat.', date: '2026-06-07' }
    ]
  }
];

export const INITIAL_REFLECTIONS: ProjectReflection[] = [
  {
    id: 'ref-01',
    projectId: 'p-01',
    title: 'Keberhasilan BPJS Nelayan Dobo',
    type: 'success',
    date: '2026-05-10',
    whatHappened: 'Sosialisasi program BPJS Ketenagakerjaan untuk nelayan mandiri di pulau terluar Dobo.',
    whatWorked: 'Gaya simulasi klaim asuransi praktis sangat menarik perhatian nelayan, mengalahkan diskusi materi regulasi teoritis.',
    whatDidnt: 'Koneksi internet di pelabuhan Dobo yang lambat menghambat pendaftaran digital saat itu juga.',
    lesson: 'Nelayan lebih cepat tergerak ketika ditunjukkan contoh kasus nyata nelayan sakit yang menerima santunan tunai ketimbang diajarkan hukum kewajiban.',
    nextSteps: 'Menyediakan draf pengumpulan data manual (offline first formulir) untuk kemudian diinput tim staf saat dapat jaringan stabil.'
  }
];

export const INITIAL_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-01',
    projectName: 'Fisheries Improvement Project (FIP) - WPP 718',
    category: 'TOR',
    fileName: 'TOR_Fisheries_Improvement_WPP718.pdf',
    mimeType: 'application/pdf',
    fileSize: 1048576 * 2.4, // 2.4 MB
    driveFileId: '1Ar_H3R_gS8p0G-nO3r89rG3bU0H4U1Z',
    webViewLink: 'https://drive.google.com/file/d/1Ar_H3R_gS8p0G-nO3r89rG3bU0H4U1Z/view',
    description: 'Panduan Detail Kerangka Kerja Peningkatan Ketertelusuran Kakap Merah di Laut Arafura.',
    createdAt: '2026-01-12'
  },
  {
    id: 'doc-02',
    projectName: 'Safeguarding Against Forced Labor in Fishing (SAFE)',
    category: 'LAPORAN_BULANAN',
    fileName: 'Laporan_Bulanan_Mei_SAFE_ILO.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1024 * 342, // 342 KB
    driveFileId: '1H3p_r4vB3r59gR3bU0H4U1Z3rH3A',
    webViewLink: 'https://drive.google.com/file/d/1H3p_r4vB3r59gR3bU0H4U1Z3rH3A/view',
    description: 'Laporan bulanan terkait status Posko Pengaduan Nelayan Bitung dan jaminan hak AKP.',
    createdAt: '2026-06-01'
  },
  {
    id: 'doc-03',
    projectName: 'Kemitraan Konservasi Mangrove & Ketahanan Pesisir',
    category: 'DATA_SURVEI',
    fileName: 'SOP_Pemberdayaan_Wanita_Pesisir_Kehati.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 1024 * 185, // 185 KB
    driveFileId: '1K3b_r9uB3r52gR1bU5H4UaZ3rH3M',
    webViewLink: 'https://drive.google.com/file/d/1K3b_r9uB3r52gR1bU5H4UaZ3rH3M/view',
    description: 'Dokumen panduan kelompok usaha wanita pesisir untuk pengolahan sirup dan dodol mangrove.',
    createdAt: '2025-06-15'
  },
  {
    id: 'doc-04',
    projectName: 'Kemitraan Konservasi Mangrove & Ketahanan Pesisir',
    category: 'FOTO_KEGIATAN',
    fileName: 'Foto_Hasil_Tanam_Mangrove_Kep_Seribu.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024 * 720, // 720 KB
    driveFileId: '1F3f_v4pB8r51gR0bU2H4UbZ3rH3G',
    webViewLink: 'https://drive.google.com/file/d/1F3f_v4pB8r51gR0bU2H4UbZ3rH3G/view',
    description: 'Hasil dokumentasi penanaman bibit mangrove bersama kelompok tani Tanjung Pasir.',
    createdAt: '2026-04-18'
  },
  {
    id: 'doc-05',
    projectName: 'Fisheries Improvement Project (FIP) - WPP 718',
    category: 'BUKTI_CAPAIAN',
    fileName: 'Formulir_Pendaftaran_BPJS_Nelayan_Dobo.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024 * 490, // 490 KB
    driveFileId: '1Ar_H3R_gS8p0G-nO3r89rG3bU0H4U1X',
    webViewLink: 'https://drive.google.com/file/d/1Ar_H3R_gS8p0G-nO3r89rG3bU0H4U1X/view',
    description: 'Bukti formulir fisik kepesertaan BPJS ketenagakerjaan bagi nelayan skala kecil Dobo.',
    createdAt: '2026-06-11'
  }
];
