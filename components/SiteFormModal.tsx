'use client';

import { useEffect, useState } from 'react';
import { STATUS_LIST, MONTHS } from '@/lib/utils';

interface SiteData {
  id?: unknown; hospital_id?: unknown; month?: unknown; year?: unknown; install_type?: unknown;
  wards?: unknown; unit_price?: unknown; amount?: unknown; team_id?: unknown;
  responsible_name?: unknown; status?: unknown; date_start?: unknown; date_end?: unknown; note?: unknown;
}
interface Props {
  site: SiteData | null;
  onClose: () => void;
  onSaved: () => void;
}

interface Hospital { id: string; name: string; province_name: string; }
interface Team { id: number; name: string; capacity: number; }

export default function SiteFormModal({ site, onClose, onSaved }: Props) {
  const isEdit = !!site;
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({
    hospital_id: String(site?.hospital_id ?? ''),
    month: String(site?.month ?? 'ม.ค.'),
    year: Number(site?.year ?? 2569),
    install_type: String(site?.install_type ?? 'onsite'),
    wards: Number(site?.wards ?? 1),
    unit_price: Number(site?.unit_price ?? ''),
    amount: Number(site?.amount ?? ''),
    team_id: String(site?.team_id ?? ''),
    responsible_name: String(site?.responsible_name ?? ''),
    status: String(site?.status ?? 'อยู่ในแผน'),
    date_start: String(site?.date_start ?? ''),
    date_end: String(site?.date_end ?? ''),
    note: String(site?.note ?? ''),
    hospitalSearch: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(d => setTeams(d.teams ?? []));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({ search: form.hospitalSearch });
      fetch(`/api/hospitals?${params}`).then(r => r.json()).then(d => setHospitals(d.hospitals ?? []));
    }, 300);
    return () => clearTimeout(timeout);
  }, [form.hospitalSearch]);

  function set(key: string, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hospital_id) { setError('กรุณาเลือกโรงพยาบาล'); return; }
    if (!form.team_id) { setError('กรุณาเลือกทีม'); return; }
    setSaving(true); setError('');

    const body = {
      hospital_id: form.hospital_id,
      month: form.month, year: form.year,
      install_type: form.install_type, wards: form.wards,
      unit_price: form.unit_price || undefined,
      amount: form.amount || undefined,
      team_id: Number(form.team_id),
      responsible_name: form.responsible_name || null,
      status: form.status,
      date_start: form.date_start || null,
      date_end: form.date_end || null,
      note: form.note || null,
    };

    const url = isEdit ? `/api/sites/${site!.id}` : '/api/sites';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? 'เกิดข้อผิดพลาด'); setSaving(false); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'แก้ไขไซต์' : 'เพิ่มไซต์ใหม่'}</h2>
          <button type="button" aria-label="ปิด" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* โรงพยาบาล */}
          <div>
            <label htmlFor="sf-hospital-search" className="block text-sm font-medium text-gray-700 mb-1">โรงพยาบาล *</label>
            <input
              id="sf-hospital-search"
              type="text"
              placeholder="ค้นหาโรงพยาบาล..."
              value={form.hospitalSearch}
              onChange={e => set('hospitalSearch', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 mb-1"
            />
            <select
              id="sf-hospital-id"
              aria-label="เลือกโรงพยาบาล"
              required
              value={form.hospital_id}
              onChange={e => set('hospital_id', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              <option value="">-- เลือกโรงพยาบาล --</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.province_name})</option>
              ))}
            </select>
          </div>

          {/* เดือน/ปี/ประเภท */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="sf-month" className="block text-sm font-medium text-gray-700 mb-1">เดือน</label>
              <select id="sf-month" value={form.month} onChange={e => set('month', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sf-year" className="block text-sm font-medium text-gray-700 mb-1">ปี (พ.ศ.)</label>
              <input id="sf-year" type="number" value={form.year} onChange={e => set('year', Number(e.target.value))}
                placeholder="2569"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label htmlFor="sf-install-type" className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
              <select id="sf-install-type" value={form.install_type} onChange={e => set('install_type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                <option value="onsite">Onsite</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* Ward/ราคา/ยอด */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="sf-wards" className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
              <input id="sf-wards" type="number" min={1} value={form.wards} onChange={e => set('wards', Number(e.target.value))}
                placeholder="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label htmlFor="sf-unit-price" className="block text-sm font-medium text-gray-700 mb-1">ราคา/ward (ว่าง=ใช้ค่า default)</label>
              <input id="sf-unit-price" type="number" value={form.unit_price || ''} onChange={e => set('unit_price', Number(e.target.value))}
                placeholder="590000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label htmlFor="sf-amount" className="block text-sm font-medium text-gray-700 mb-1">ยอดรวม (ว่าง=คำนวณเอง)</label>
              <input id="sf-amount" type="number" value={form.amount || ''} onChange={e => set('amount', Number(e.target.value))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>

          {/* ทีม/ผู้รับผิดชอบ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sf-team" className="block text-sm font-medium text-gray-700 mb-1">ทีม *</label>
              <select id="sf-team" required value={form.team_id} onChange={e => set('team_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                <option value="">-- เลือกทีม --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sf-responsible" className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
              <input id="sf-responsible" type="text" value={form.responsible_name} onChange={e => set('responsible_name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="ชื่อผู้รับผิดชอบ" />
            </div>
          </div>

          {/* สถานะ/วันที่ */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="sf-status" className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select id="sf-status" value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sf-date-start" className="block text-sm font-medium text-gray-700 mb-1">วันเริ่ม</label>
              <input id="sf-date-start" type="date" value={form.date_start} onChange={e => set('date_start', e.target.value)}
                placeholder="yyyy-mm-dd"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
            <div>
              <label htmlFor="sf-date-end" className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
              <input id="sf-date-end" type="date" value={form.date_end} onChange={e => set('date_end', e.target.value)}
                placeholder="yyyy-mm-dd"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>

          <div>
            <label htmlFor="sf-note" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea id="sf-note" rows={2} value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มไซต์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
