'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import GatewayForm, { type GatewayData } from '@/components/GatewayForm';

export default function EditGatewayPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<GatewayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gateway/${id}`)
      .then(r => r.json())
      .then(d => {
        const g = d.gateway;
        setData({
          gateway_type:         g.gateway_type ?? 'HOSxPLineOfficialGateway',
          hospital_id:          g.hospital_id ?? '',
          hamin:                g.hamin ?? '',
          installer_name:       g.installer_name ?? '',
          contact_name:         g.contact_name ?? '',
          contact_position:     g.contact_position ?? '',
          contact_phone:        g.contact_phone ?? '',
          contact_email:        g.contact_email ?? '',
          db_ip:                g.db_ip ?? '',
          db_name:              g.db_name ?? '',
          db_user:              g.db_user ?? '',
          db_pass:              g.db_pass ?? '',
          remote_ip:            g.remote_ip ?? '',
          remote_computer_name: g.remote_computer_name ?? '',
          anydesk_user:         g.anydesk_user ?? '',
          anydesk_pass:         g.anydesk_pass ?? '',
          telegram_token:       g.telegram_token ?? '',
          date_contact:         g.date_contact ? g.date_contact.slice(0, 10) : '',
          date_completed:       g.date_completed ? g.date_completed.slice(0, 10) : '',
          status:               g.status ?? 'รอดำเนินการ',
          note:                 g.note ?? '',
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="space-y-5">
      <div>
        <nav className="text-sm text-gray-400 mb-1">
          <Link href="/dashboard/gateway" className="hover:text-amber-700">การติดตั้ง Gateway</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">แก้ไขรายการ</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขรายการติดตั้ง Gateway</h1>
      </div>
      {data && <GatewayForm id={id} initial={data} />}
    </div>
  );
}
