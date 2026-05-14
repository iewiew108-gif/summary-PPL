'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatNumber, STATUS_COLOR, MONTHS } from '@/lib/utils';

interface DashboardData {
  summary: { target: string; plan_total: string; installed_total: string };
  statusSummary: { status: string; count: number; total_wards: number; total_amount: string }[];
  monthly: { month: string; site_count: number; total_wards: number; total_amount: string; installed_amount: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">กำลังโหลด...</div></div>;
  if (!data) return null;

  const target = Number(data.summary?.target ?? 0);
  const planTotal = Number(data.summary?.plan_total ?? 0);
  const installedTotal = Number(data.summary?.installed_total ?? 0);
  const progressPct = target > 0 ? Math.min(100, Math.round((installedTotal / target) * 100)) : 0;
  const planPct = target > 0 ? Math.min(100, Math.round((planTotal / target) * 100)) : 0;

  const totalSites = data.statusSummary.reduce((s, r) => s + Number(r.count), 0);
  const totalWards = data.statusSummary.reduce((s, r) => s + Number(r.total_wards), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมโครงการ IPD Paperless ปี 2569</p>
      </div>

      {/* เป้าหมาย */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">ยอดรวมทั้งปี vs เป้าหมาย</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(installedTotal)}</p>
            <p className="text-sm text-gray-400 mt-1">เป้าหมาย: {formatCurrency(target)}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${progressPct >= 100 ? 'text-green-600' : progressPct >= 70 ? 'text-amber-700' : 'text-orange-500'}`}>
              {progressPct}%
            </div>
            <p className="text-xs text-gray-400">ติดตั้งแล้ว</p>
          </div>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gray-200 rounded-full transition-all"
            style={{ width: `${planPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-amber-600 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>ในแผน: {formatCurrency(planTotal)} ({planPct}%)</span>
          <span>ยังขาด: {formatCurrency(Math.max(0, target - installedTotal))}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ไซต์ทั้งหมด', value: formatNumber(totalSites), sub: 'ไซต์', color: 'bg-amber-600' },
          { label: 'Ward ทั้งหมด', value: formatNumber(totalWards), sub: 'ward', color: 'bg-indigo-500' },
          { label: 'ติดตั้งแล้ว', value: formatNumber(data.statusSummary.find(s => s.status === 'ติดตั้งแล้ว')?.count ?? 0), sub: 'ไซต์', color: 'bg-green-500' },
          { label: 'อยู่ในแผน', value: formatNumber(data.statusSummary.find(s => s.status === 'อยู่ในแผน')?.count ?? 0), sub: 'ไซต์', color: 'bg-yellow-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`w-8 h-1 ${card.color} rounded-full mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub} · {card.label}</p>
          </div>
        ))}
      </div>

      {/* สถานะ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">สรุปตามสถานะ</h2>
        <div className="space-y-3">
          {data.statusSummary.map(row => (
            <div key={row.status} className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLOR[row.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {row.status}
              </span>
              <div className="flex-1 text-sm text-gray-600">
                {formatNumber(Number(row.count))} ไซต์ · {formatNumber(Number(row.total_wards))} ward
              </div>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(Number(row.total_amount))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* รายเดือน */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">ยอดรายเดือน</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">เดือน</th>
                <th className="pb-2 font-medium text-right">ไซต์</th>
                <th className="pb-2 font-medium text-right">Ward</th>
                <th className="pb-2 font-medium text-right">ยอดแผน</th>
                <th className="pb-2 font-medium text-right">ยอดจริง</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map(month => {
                const row = data.monthly.find(m => m.month === month);
                if (!row) return null;
                return (
                  <tr key={month} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-900">{month}</td>
                    <td className="py-2.5 text-right text-gray-600">{formatNumber(Number(row.site_count))}</td>
                    <td className="py-2.5 text-right text-gray-600">{formatNumber(Number(row.total_wards))}</td>
                    <td className="py-2.5 text-right text-gray-700">{formatCurrency(Number(row.total_amount))}</td>
                    <td className="py-2.5 text-right font-medium text-green-700">{formatCurrency(Number(row.installed_amount))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
