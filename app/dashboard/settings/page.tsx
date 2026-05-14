'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Config {
  onsite_price: number; online_price: number;
  team_capacity: number; current_year: number; session_days: number;
}

interface YearlyTarget {
  year: number;
  target_amount: number;
  note: string | null;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [form, setForm] = useState<Partial<Config>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [targets, setTargets] = useState<YearlyTarget[]>([]);
  const [editTarget, setEditTarget] = useState<{ year: number; target_amount: number; note: string } | null>(null);
  const [newTarget, setNewTarget] = useState<{ year: string; target_amount: string; note: string }>({ year: '', target_amount: '', note: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [targetSaving, setTargetSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => {
      setConfig(d.config);
      setForm(d.config);
    });
    loadTargets();
  }, []);

  function loadTargets() {
    fetch('/api/targets').then(r => r.json()).then(d => setTargets(d.targets ?? []));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setTargetSaving(true);
    await fetch('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editTarget),
    });
    setTargetSaving(false);
    setEditTarget(null);
    loadTargets();
  }

  async function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();
    setTargetSaving(true);
    await fetch('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: Number(newTarget.year),
        target_amount: Number(newTarget.target_amount),
        note: newTarget.note || null,
      }),
    });
    setTargetSaving(false);
    setShowAdd(false);
    setNewTarget({ year: '', target_amount: '', note: '' });
    loadTargets();
  }

  async function handleDeleteTarget(year: number) {
    if (!confirm(`ลบเป้าหมายปี พ.ศ. ${year}?`)) return;
    await fetch('/api/targets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year }),
    });
    loadTargets();
  }

  if (!config) return <div className="flex items-center justify-center h-40 text-gray-400">กำลังโหลด...</div>;

  const systemFields = [
    { key: 'onsite_price', label: 'ราคา Onsite / ward (บาท)', hint: `ปัจจุบัน: ${formatCurrency(config.onsite_price)}` },
    { key: 'online_price', label: 'ราคา Online / ward (บาท)', hint: `ปัจจุบัน: ${formatCurrency(config.online_price)}` },
    { key: 'team_capacity', label: 'Capacity สูงสุด (ward/ทีม/เดือน)', hint: `ปัจจุบัน: ${config.team_capacity}` },
    { key: 'current_year', label: 'ปีปัจจุบัน (พ.ศ.)', hint: `ปัจจุบัน: ${config.current_year}` },
    { key: 'session_days', label: 'อายุ Session (วัน)', hint: `ปัจจุบัน: ${config.session_days} วัน` },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
        <p className="text-gray-500 text-sm mt-0.5">ปรับค่าตัวแปรหลักของระบบ</p>
      </div>

      {/* Yearly Targets Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">เป้าหมายรายปี</h2>
            <p className="text-xs text-gray-400 mt-0.5">กำหนดเป้ายอดขายแยกแต่ละปี พ.ศ.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowAdd(true); setEditTarget(null); }}
            className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="text-base leading-none">+</span> เพิ่มปี
          </button>
        </div>

        {/* Add new year form */}
        {showAdd && (
          <form onSubmit={handleAddTarget} className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-amber-800">เพิ่มเป้าหมายปีใหม่</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ปี พ.ศ.</label>
                <input
                  type="number"
                  placeholder="เช่น 2570"
                  required
                  value={newTarget.year}
                  onChange={e => setNewTarget(p => ({ ...p, year: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">เป้าหมาย (บาท)</label>
                <input
                  type="number"
                  placeholder="เช่น 86000000"
                  required
                  value={newTarget.target_amount}
                  onChange={e => setNewTarget(p => ({ ...p, target_amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
            <div>
              <label htmlFor="new-target-note" className="block text-xs font-medium text-gray-600 mb-1">หมายเหตุ (ไม่บังคับ)</label>
              <input
                id="new-target-note"
                type="text"
                value={newTarget.note}
                onChange={e => setNewTarget(p => ({ ...p, note: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={targetSaving}
                className="bg-amber-700 hover:bg-amber-800 disabled:bg-amber-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                {targetSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        {/* Yearly targets table */}
        {targets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีเป้าหมายรายปี</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="text-left px-4 py-2.5 font-medium">ปี พ.ศ.</th>
                  <th className="text-right px-4 py-2.5 font-medium">เป้าหมาย</th>
                  <th className="text-left px-4 py-2.5 font-medium">หมายเหตุ</th>
                  <th className="px-4 py-2.5 sr-only">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {targets.map(t => (
                  <tr key={t.year}>
                    {editTarget?.year === t.year ? (
                      <>
                        <td className="px-4 py-2 font-semibold text-gray-700">{t.year}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            aria-label="เป้าหมาย (บาท)"
                            value={editTarget.target_amount}
                            onChange={e => setEditTarget(p => p ? { ...p, target_amount: Number(e.target.value) } : p)}
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-600"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            aria-label="หมายเหตุ"
                            value={editTarget.note}
                            onChange={e => setEditTarget(p => p ? { ...p, note: e.target.value } : p)}
                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <form onSubmit={handleSaveTarget} className="flex gap-1.5">
                            <button
                              type="submit"
                              disabled={targetSaving}
                              className="text-xs bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded transition-colors"
                            >
                              บันทึก
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditTarget(null)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded transition-colors"
                            >
                              ยกเลิก
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold text-gray-700">{t.year}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-800">{formatCurrency(t.target_amount)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{t.note ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditTarget({ year: t.year, target_amount: t.target_amount, note: t.note ?? '' })}
                              className="text-xs text-amber-700 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTarget(t.year)}
                              className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Config Section */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">ตั้งค่าทั่วไป</h2>
          <p className="text-xs text-gray-400 mt-0.5">ค่าราคา, capacity และการตั้งค่าระบบ</p>
        </div>

        {systemFields.map(f => (
          <div key={f.key}>
            <label htmlFor={`cfg-${f.key}`} className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              id={`cfg-${f.key}`}
              type="number"
              value={form[f.key as keyof Config] ?? ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <p className="text-xs text-gray-400 mt-0.5">{f.hint}</p>
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
        </button>
      </form>
    </div>
  );
}
