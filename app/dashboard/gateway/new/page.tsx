import Link from 'next/link';
import GatewayForm from '@/components/GatewayForm';

export default function NewGatewayPage() {
  return (
    <div className="space-y-5">
      <div>
        <nav className="text-sm text-gray-400 mb-1">
          <Link href="/dashboard/gateway" className="hover:text-amber-700">การติดตั้ง Gateway</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">เพิ่มรายการใหม่</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มรายการติดตั้ง Gateway</h1>
        <p className="text-gray-500 text-sm mt-0.5">กรอกข้อมูลให้ครบถ้วนก่อนบันทึก</p>
      </div>
      <GatewayForm />
    </div>
  );
}
