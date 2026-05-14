'use client';

import { useEffect, useState } from 'react';
import { MONTHS, formatNumber } from '@/lib/utils';

interface Team { id: number; name: string; capacity: number; leader_name: string | null; }
interface WorkloadRow { team_id: number; team_name: string; month: string; total_wards: number; capacity: number; remaining_capacity: number; }

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [workload, setWorkload] = useState<WorkloadRow[]>([]);
  const [year, setYear] = useState(2569);

  useEffect(() => {
    fetch(`/api/teams?year=${year}`)
      .then(r => r.json())
      .then(d => { setTeams(d.teams ?? []); setWorkload(d.workload ?? []); });
  }, [year]);

  function getLoad(teamId: number, month: string) {
    return workload.find(w => w.team_id === teamId && w.month === month);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แผน & ทีม</h1>
          <p className="text-gray-500 text-sm mt-0.5">โหลดงานของแต่ละทีมรายเดือน</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          {[2568, 2569, 2570].map(y => <option key={y} value={y}>ปี {y}</option>)}
        </select>
      </div>

      {/* ทีมข้อมูล */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="font-semibold text-gray-900">{team.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">หัวหน้า: {team.leader_name ?? '—'}</p>
            <div className="mt-3 text-sm text-gray-600">
              Capacity: <span className="font-medium text-gray-900">{team.capacity} ward/เดือน</span>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">ตาราง Ward × เดือน (ปี {year})</h2>
          <p className="text-xs text-gray-400 mt-0.5">🟢 ว่าง  🟡 ใกล้เต็ม  🔴 เต็มแล้ว</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ทีม</th>
                {MONTHS.map(m => (
                  <th key={m} className="px-3 py-3 text-center font-medium text-gray-500 min-w-[80px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                  {MONTHS.map(month => {
                    const row = getLoad(team.id, month);
                    const used = row?.total_wards ?? 0;
                    const cap = team.capacity;
                    const pct = cap > 0 ? used / cap : 0;
                    const bg = pct === 0 ? 'bg-gray-50 text-gray-400'
                      : pct < 0.75 ? 'bg-green-50 text-green-700'
                      : pct < 1 ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700';
                    return (
                      <td key={month} className="px-3 py-3 text-center">
                        <div className={`rounded-lg px-2 py-1 text-xs font-medium ${bg}`}>
                          {used}/{cap}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ทีมที่ว่างที่สุด */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">สรุปโหลดงานรวมทั้งปี {year}</h2>
        <div className="space-y-3">
          {teams.map(team => {
            const totalUsed = workload.filter(w => w.team_id === team.id).reduce((s, w) => s + Number(w.total_wards), 0);
            const totalCap = team.capacity * 12;
            const pct = totalCap > 0 ? Math.round((totalUsed / totalCap) * 100) : 0;
            return (
              <div key={team.id} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-900">{team.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 w-24 text-right">
                  {formatNumber(totalUsed)}/{formatNumber(totalCap)} ward ({pct}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
