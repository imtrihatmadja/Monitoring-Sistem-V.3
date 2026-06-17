import React, { useState, useMemo } from 'react';
import { Staff, Activity, Project } from '../types';
import { Users, ClipboardList, TrendingUp, AlertOctagon, Eye, CheckCircle2 } from 'lucide-react';

interface StaffTabProps {
  staffList: Staff[];
  activities: Activity[];
  projects: Project[];
  onOpenTasksModal: (staffName: string) => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staffList,
  activities,
  projects,
  onOpenTasksModal,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter staff by status
  const filteredStaff = useMemo(() => {
    if (selectedStatus === 'all') return staffList;
    return staffList.filter((s) => s.status === selectedStatus);
  }, [staffList, selectedStatus]);

  // Aggregate stats across all staff assignments
  const totalInvolvedStaff = staffList.filter((s) => s.status === 'active').length;
  const totalAssignedActivities = activities.length;
  
  const pendingTasksCount = activities.filter(
    (a) => a.status === 'Belum Mulai' || a.status === 'Sedang Berjalan' || a.status === 'Tertunda'
  ).length;

  const averageActivitiesProgress = activities.length
    ? Math.round(activities.reduce((sum, a) => sum + a.progress, 0) / activities.length)
    : 0;

  // Compile individual staff workloads sheet
  const staffWorkloads = useMemo(() => {
    return filteredStaff.map((staff) => {
      const staffActs = activities.filter((a) => a.pic === staff.name);
      
      const totalCount = staffActs.length;
      const completedCount = staffActs.filter((a) => a.status === 'Selesai').length;
      const runningCount = staffActs.filter((a) => a.status === 'Sedang Berjalan').length;
      const delayedCount = staffActs.filter((a) => a.status === 'Tertunda').length;
      const notStartedCount = staffActs.filter((a) => a.status === 'Belum Mulai').length;

      const meanProgress = totalCount
        ? Math.round(staffActs.reduce((sum, a) => sum + a.progress, 0) / totalCount)
        : 0;

      const criticalOverdues = staffActs.filter((a) => {
        // Simple logic for pending delays
        if (a.status === 'Tertunda') return true;
        
        // checking if deadline is passed to simulate overdue workloads
        if (a.status !== 'Selesai' && a.dueDate) {
          const due = new Date(a.dueDate).getTime();
          const now = new Date().getTime();
          return due < now;
        }
        return false;
      }).length;

      return {
        ...staff,
        totalCount,
        completedCount,
        runningCount,
        delayedCount,
        notStartedCount,
        meanProgress,
        criticalOverdues,
      };
    });
  }, [filteredStaff, activities]);

  return (
    <div id="staff-tab-container" className="space-y-6">
      {/* Visual Workload banner */}
      <div id="staff-dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff Aktif</p>
            <p className="text-xl font-bold text-slate-800">{totalInvolvedStaff} Anggota</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kegiatan</p>
            <p className="text-xl font-bold text-slate-800">{totalAssignedActivities} Ditugaskan</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata Progress</p>
            <p className="text-xl font-bold text-slate-800">{averageActivitiesProgress}% Tuntas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hambatan/Delay Aktif</p>
            <p className="text-xl font-bold text-slate-800">{pendingTasksCount} Tertunda</p>
          </div>
        </div>
      </div>

      {/* Grid container tables */}
      <div id="staff-table-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">📊 Distribusi Beban Kerja Personel</h3>
            <p className="text-xs text-slate-400">Metrik pengawasan tingkat penyelesaian program dan penugasan per staff</p>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl py-1.5 px-3 focus:outline-none focus:border-blue-400 cursor-pointer text-slate-700"
          >
            <option value="all">Semua Status Staff</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        {/* Workloads details matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Personel</th>
                <th className="py-3 px-4">Status Staff</th>
                <th className="py-3 px-4 text-center">Total Penugasan</th>
                <th className="py-3 px-4 text-center text-emerald-600">Selesai</th>
                <th className="py-3 px-4 text-center text-sky-600">Sedang Berjalan</th>
                <th className="py-3 px-4 text-center text-rose-600">Tertunda</th>
                <th className="py-3 px-4 text-center text-slate-400">Belum Mulai</th>
                <th className="py-3 px-4">Efisiensi Progress</th>
                <th className="py-3 px-4 text-center text-amber-600">Overdue/Hambatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {staffWorkloads.map((sw) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (sw.status === 'inactive') {
                  badgeClass = 'bg-slate-50 text-slate-400 border-slate-100';
                }

                return (
                  <tr key={sw.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{sw.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`py-0.5 px-2 rounded-full border text-[9px] uppercase tracking-wider font-bold ${badgeClass}`}>
                        {sw.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-800 font-bold">{sw.totalCount}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 bg-emerald-50/10 font-bold">{sw.completedCount}</td>
                    <td className="py-3.5 px-4 text-center text-sky-600 bg-sky-50/10 font-bold">{sw.runningCount}</td>
                    <td className="py-3.5 px-4 text-center text-rose-600 bg-rose-50/10 font-bold">{sw.delayedCount}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{sw.notStartedCount}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${sw.meanProgress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-600 text-[11px]">{sw.meanProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`py-0.5 px-2 rounded-full font-bold text-[10px] ${
                          sw.criticalOverdues > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {sw.criticalOverdues} Kasus
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenTasksModal(sw.name)}
                        className="py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Eye className="w-3 h-3" /> Lihat Tugas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
