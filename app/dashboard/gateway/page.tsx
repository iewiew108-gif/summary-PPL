'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Gateway {
  id: string;
  gateway_type: string;
  hospital_name: string;
  province_name: string;
  hamin: string | null;
  installer_name: string;
  contact_name: string;
  contact_phone: string;
  status: string;
  date_contact: string | null;
  date_completed: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  'รอดำเนินการ':    'bg-gray-100 text-gray-600',
  'กำลังดำเนินการ': 'bg-yellow-100 text-yellow-700',
  'เสร็จสิ้น':      'bg-green-100 text-green-700',
};

export default function GatewayPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (statusFilter) p.set('status', statusFilter);
    const res = await fetch(`/api/gateway?${p}`);
    const data = await res.json();
    setGateways(data.gateways ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function fmt(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การติดตั้ง Gateway</h1>
          <p className="text-gray-500 text-sm mt-0.5">รายการติดตั้ง {gateways.length} รายการ</p>
        </div>
        <Link
          href="/dashboard/gateway/new"
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + เพิ่มรายการ
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="ค้นหา รพ. / ผู้ติดตั้ง / ผู้ติดต่อ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="">ทุกสถานะ</option>
          <option>รอดำเนินการ</option>
          <option>กำลังดำเนินการ</option>
          <option>เสร็จสิ้น</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">กำลังโหลด...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500 text-xs font-medium">
                  <th className="px-4 py-3">ประเภท Gateway</th>
                  <th className="px-4 py-3">โรงพยาบาล</th>
                  <th className="px-4 py-3">จังหวัด</th>
                  <th className="px-4 py-3">Hamin</th>
                  <th className="px-4 py-3">ผู้ติดตั้ง</th>
                  <th className="px-4 py-3">ผู้ติดต่อ รพ.</th>
                  <th className="px-4 py-3">วันประสาน</th>
                  <th className="px-4 py-3">วันเสร็จ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {gateways.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">ยังไม่มีรายการ</td></tr>
                ) : gateways.map(g => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                    <td className="px-4 py-3">
                      <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                        {g.gateway_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{g.hospital_name}</td>
                    <td className="px-4 py-3 text-gray-500">{g.province_name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{g.hamin ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{g.installer_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{g.contact_name}</div>
                      <div className="text-xs text-gray-400">{g.contact_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(g.date_contact)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(g.date_completed)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[g.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/gateway/${g.id}`}
                        className="text-xs text-amber-700 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
