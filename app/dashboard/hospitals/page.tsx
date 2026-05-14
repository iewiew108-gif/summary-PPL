'use client';

import { useEffect, useState, useCallback } from 'react';

interface Hospital {
  id: string; name: string; province_id: number; province_name: string; region: string;
  district: string | null; address: string | null;
  contact_name: string | null; contact_phone: string | null; phone: string | null; note: string | null;
}

type FormData = {
  name: string; province_id: string; district: string;
  address: string; contact_name: string; contact_phone: string; phone: string; note: string;
};

const EMPTY_FORM: FormData = {
  name: '', province_id: '', district: '', address: '',
  contact_name: '', contact_phone: '', phone: '', note: '',
};

function hospitalToForm(h: Hospital): FormData {
  return {
    name: h.name,
    province_id: String(h.province_id),
    district: h.district ?? '',
    address: h.address ?? '',
    contact_name: h.contact_name ?? '',
    contact_phone: h.contact_phone ?? '',
    phone: h.phone ?? '',
    note: h.note ?? '',
  };
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<{ id: number; name_th: string }[]>([]);

  const [mode, setMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Hospital | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/hospitals?${params}`);
    const data = await res.json();
    setHospitals(data.hospitals ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchHospitals, 300);
    return () => clearTimeout(t);
  }, [fetchHospitals]);

  useEffect(() => {
    fetch('/api/provinces').then(r => r.json()).then(d => setProvinces(d.provinces ?? []));
  }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setMode('add');
  }

  function openEdit(h: Hospital) {
    setForm(hospitalToForm(h));
    setEditTarget(h);
    setMode('edit');
  }

  function closeModal() {
    setMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (mode === 'add') {
      await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else if (mode === 'edit' && editTarget) {
      await fetch(`/api/hospitals/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    closeModal();
    fetchHospitals();
  }

  const f = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">โรงพยาบาล</h1>
          <p className="text-gray-500 text-sm mt-0.5">ฐานข้อมูลโรงพยาบาล {hospitals.length} แห่ง</p>
        </div>
        <button type="button" onClick={openAdd}
          className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + เพิ่มโรงพยาบาล
        </button>
      </div>

      <input
        type="text" placeholder="ค้นหาโรงพยาบาล..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">กำลังโหลด...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                {['ชื่อโรงพยาบาล', 'จังหวัด', 'ภูมิภาค', 'อำเภอ', 'ผู้ติดต่อ', 'เบอร์โทร', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่มีข้อมูล</td></tr>
              ) : hospitals.map(h => (
                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                  <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                  <td className="px-4 py-3 text-gray-600">{h.province_name}</td>
                  <td className="px-4 py-3 text-gray-500">{h.region}</td>
                  <td className="px-4 py-3 text-gray-500">{h.district ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{h.contact_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{h.contact_phone ?? h.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(h)}
                      className="text-xs text-amber-700 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">
                {mode === 'add' ? 'เพิ่มโรงพยาบาล' : `แก้ไข: ${editTarget?.name}`}
              </h2>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="h-name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงพยาบาล *</label>
                <input id="h-name" required {...f('name')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
              </div>

              <div>
                <label htmlFor="h-province" className="block text-sm font-medium text-gray-700 mb-1">จังหวัด *</label>
                <select id="h-province" required {...f('province_id')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600">
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="h-district" className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                  <input id="h-district" {...f('district')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
                <div>
                  <label htmlFor="h-phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input id="h-phone" type="tel" {...f('phone')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
              </div>

              <div>
                <label htmlFor="h-address" className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                <input id="h-address" {...f('address')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="h-cname" className="block text-sm font-medium text-gray-700 mb-1">ผู้ติดต่อ</label>
                  <input id="h-cname" {...f('contact_name')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
                <div>
                  <label htmlFor="h-cphone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์ผู้ติดต่อ</label>
                  <input id="h-cphone" type="tel" {...f('contact_phone')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
                </div>
              </div>

              <div>
                <label htmlFor="h-note" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea id="h-note" rows={2} {...f('note')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                  {saving ? 'กำลังบันทึก...' : mode === 'add' ? 'เพิ่มโรงพยาบาล' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
