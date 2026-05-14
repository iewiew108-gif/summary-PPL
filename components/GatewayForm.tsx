'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface GatewayData {
  gateway_type: string;
  hospital_id: string;
  hamin: string;
  installer_name: string;
  contact_name: string;
  contact_position: string;
  contact_phone: string;
  contact_email: string;
  db_ip: string;
  db_name: string;
  db_user: string;
  db_pass: string;
  remote_ip: string;
  remote_computer_name: string;
  anydesk_user: string;
  anydesk_pass: string;
  telegram_token: string;
  date_contact: string;
  date_completed: string;
  status: string;
  note: string;
}

const EMPTY: GatewayData = {
  gateway_type: 'HOSxPLineOfficialGateway',
  hospital_id: '', hamin: '', installer_name: '',
  contact_name: '', contact_position: '', contact_phone: '', contact_email: '',
  db_ip: '', db_name: '', db_user: '', db_pass: '',
  remote_ip: '', remote_computer_name: '', anydesk_user: '', anydesk_pass: '',
  telegram_token: '',
  date_contact: '', date_completed: '',
  status: 'รอดำเนินการ', note: '',
};

const GATEWAY_TYPES = ['HOSxPLineOfficialGateway'];

interface Props {
  id?: string;
  initial?: Partial<GatewayData>;
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center shrink-0">{n}</div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600';
const pwCls   = inputCls + ' font-mono';

export default function GatewayForm({ id, initial }: Props) {
  const router = useRouter();
  const isEdit = !!id;

  const [form, setForm] = useState<GatewayData>({ ...EMPTY, ...initial });
  const [hospitals, setHospitals] = useState<{ id: string; name: string; province_name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState({ db: false, anydesk: false });
  const [hospitalSearch, setHospitalSearch] = useState('');

  useEffect(() => {
    if (initial) setForm(f => ({ ...f, ...initial }));
  }, [initial]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const p = new URLSearchParams();
      if (hospitalSearch) p.set('search', hospitalSearch);
      const res = await fetch(`/api/hospitals?${p}`);
      const data = await res.json();
      setHospitals(data.hospitals ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [hospitalSearch]);

  const set = (k: keyof GatewayData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url  = isEdit ? `/api/gateway/${id}` : '/api/gateway';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) router.push('/dashboard/gateway');
  }

  async function handleDelete() {
    if (!confirm('ลบรายการนี้?')) return;
    await fetch(`/api/gateway/${id}`, { method: 'DELETE' });
    router.push('/dashboard/gateway');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* ─── Section 1 ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={1} title="ข้อมูลโรงพยาบาล & ผู้ติดตั้ง" />
        <div className="space-y-4">
          <Field label="ประเภท Gateway" required>
            <select value={form.gateway_type} onChange={set('gateway_type')} className={inputCls}>
              {GATEWAY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="โรงพยาบาล" required>
            <input
              type="text"
              placeholder="พิมพ์ค้นหา รพ..."
              value={hospitalSearch || (hospitals.find(h => h.id === form.hospital_id)?.name ?? '')}
              onChange={e => { setHospitalSearch(e.target.value); setForm(f => ({ ...f, hospital_id: '' })); }}
              className={inputCls}
            />
            {hospitalSearch && (
              <div className="border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-sm">
                {hospitals.length === 0
                  ? <p className="px-3 py-2 text-sm text-gray-400">ไม่พบ รพ.</p>
                  : hospitals.map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, hospital_id: h.id })); setHospitalSearch(''); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 flex justify-between"
                    >
                      <span className="font-medium">{h.name}</span>
                      <span className="text-gray-400 text-xs">{h.province_name}</span>
                    </button>
                  ))
                }
              </div>
            )}
            {form.hospital_id && !hospitalSearch && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {hospitals.find(h => h.id === form.hospital_id)?.name ?? form.hospital_id}
              </p>
            )}
            <input type="hidden" required value={form.hospital_id} onChange={() => {}} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hamin">
              <input placeholder="รหัส HospitalAdmin" value={form.hamin} onChange={set('hamin')} className={inputCls} />
            </Field>
            <Field label="ติดตั้ง Paperless โดย" required>
              <input required placeholder="ชื่อจริงหัวหน้าทีม" value={form.installer_name} onChange={set('installer_name')} className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* ─── Section 2 ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={2} title="ข้อมูลติดต่อ รพ." />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="ชื่อ" required>
              <input required value={form.contact_name} onChange={set('contact_name')} className={inputCls} />
            </Field>
            <Field label="ตำแหน่ง">
              <input value={form.contact_position} onChange={set('contact_position')} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="เบอร์โทร" required>
              <input required type="tel" value={form.contact_phone} onChange={set('contact_phone')} className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.contact_email} onChange={set('contact_email')} className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* ─── Section 3 ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={3} title="รายละเอียด Connection Database" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="IP" required>
              <input required placeholder="192.168.x.x" value={form.db_ip} onChange={set('db_ip')} className={`${inputCls} font-mono`} />
            </Field>
            <Field label="Database" required>
              <input required value={form.db_name} onChange={set('db_name')} className={`${inputCls} font-mono`} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="User" required>
              <input required value={form.db_user} onChange={set('db_user')} className={pwCls} />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <input
                  required
                  type={showPass.db ? 'text' : 'password'}
                  value={form.db_pass}
                  onChange={set('db_pass')}
                  className={pwCls + ' pr-16'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({ ...p, db: !p.db }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPass.db ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ─── Section 4 ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={4} title="เครื่องที่ทำการ Remote" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="IP เครื่อง" required>
              <input required placeholder="192.168.x.x" value={form.remote_ip} onChange={set('remote_ip')} className={`${inputCls} font-mono`} />
            </Field>
            <Field label="ชื่อเครื่องคอมพิวเตอร์">
              <input value={form.remote_computer_name} onChange={set('remote_computer_name')} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="AnyDesk User / ID">
              <input value={form.anydesk_user} onChange={set('anydesk_user')} className={pwCls} />
            </Field>
            <Field label="AnyDesk Password">
              <div className="relative">
                <input
                  type={showPass.anydesk ? 'text' : 'password'}
                  value={form.anydesk_pass}
                  onChange={set('anydesk_pass')}
                  className={pwCls + ' pr-16'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => ({ ...p, anydesk: !p.anydesk }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showPass.anydesk ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ─── Section 5 ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={5} title="Telegram Token" />
        <Field label="Token จาก Telegram Bot">
          <textarea
            rows={2}
            placeholder="1234567890:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={form.telegram_token}
            onChange={set('telegram_token')}
            className={`${inputCls} font-mono resize-none`}
          />
        </Field>
      </div>

      {/* ─── Dates & Status ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader n={6} title="วันที่ & สถานะ" />
        <div className="grid grid-cols-3 gap-4">
          <Field label="วันที่ประสานติดตั้ง">
            <input type="date" value={form.date_contact} onChange={set('date_contact')} className={inputCls} />
          </Field>
          <Field label="วันที่ตั้งเสร็จ">
            <input type="date" value={form.date_completed} onChange={set('date_completed')} className={inputCls} />
          </Field>
          <Field label="สถานะ">
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option>รอดำเนินการ</option>
              <option>กำลังดำเนินการ</option>
              <option>เสร็จสิ้น</option>
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="หมายเหตุ">
            <textarea rows={2} value={form.note} onChange={set('note')} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </div>

      {/* ─── Actions ─── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/gateway')}
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            ลบ
          </button>
        )}
      </div>
    </form>
  );
}
