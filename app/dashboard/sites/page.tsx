'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency, STATUS_COLOR, STATUS_LIST, MONTHS } from '@/lib/utils';
import SiteFormModal from '@/components/SiteFormModal';

interface Site {
  id: string; hospital_id: string; hospital_name: string; province_name: string; region: string;
  month: string; year: number; install_type: string; wards: number; amount: number; unit_price: number;
  status: string; team_id: number; team_name: string; responsible_name: string; date_start: string | null;
  date_end: string | null; days_total: number | null; note: string | null; owner_name: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filterStatus) params.set('status', filterStatus);
    if (filterMonth) params.set('month', filterMonth);
    const res = await fetch(`/api/sites?${params}`);
    const data = await res.json();
    setSites(data.sites ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filterStatus, filterMonth]);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบไซต์นี้ใช่ไหม?')) return;
    await fetch(`/api/sites/${id}`, { method: 'DELETE' });
    fetchSites();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายการไซต์</h1>
          <p className="text-gray-500 text-sm mt-0.5">ทั้งหมด {total} ไซต์</p>
        </div>
        <button
          onClick={() => { setEditSite(null); setShowModal(true); }}
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + เพิ่มไซต์ใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="">ทุกสถานะ</option>
          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="">ทุกเดือน</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">กำลังโหลด...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  {['โรงพยาบาล', 'จังหวัด', 'เดือน', 'Ward', 'ประเภท', 'สถานะ', 'ทีม', 'ยอด', ''].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sites.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400">ไม่มีข้อมูล</td></tr>
                ) : sites.map(site => (
                  <tr key={site.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{site.hospital_name}</td>
                    <td className="px-4 py-3 text-gray-500">{site.province_name}</td>
                    <td className="px-4 py-3 text-gray-600">{site.month} {site.year}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{site.wards}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${site.install_type === 'onsite' ? 'bg-amber-50 text-amber-800' : 'bg-purple-50 text-purple-700'}`}>
                        {site.install_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[site.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{site.team_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(Number(site.amount))}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditSite(site); setShowModal(true); }}
                          className="text-amber-700 hover:text-amber-800 text-xs font-medium"
                        >แก้ไข</button>
                        <button
                          onClick={() => handleDelete(site.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>แสดง {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} จาก {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">ก่อนหน้า</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">ถัดไป</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <SiteFormModal
          site={editSite}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchSites(); }}
        />
      )}
    </div>
  );
}
