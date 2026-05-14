export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('th-TH').format(n);
}

export const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'] as const;
export type Month = typeof MONTHS[number];

export const STATUS_LIST = ['อยู่ในแผน','รอเข้าปฏิบัติงาน','กำลังปฏิบัติงาน','ติดตั้งแล้ว','แถม','ยกเลิก'] as const;
export type SiteStatus = typeof STATUS_LIST[number];

export const STATUS_COLOR: Record<string, string> = {
  'อยู่ในแผน': 'bg-amber-100 text-blue-800',
  'รอเข้าปฏิบัติงาน': 'bg-yellow-100 text-yellow-800',
  'กำลังปฏิบัติงาน': 'bg-orange-100 text-orange-800',
  'ติดตั้งแล้ว': 'bg-green-100 text-green-800',
  'แถม': 'bg-purple-100 text-purple-800',
  'ยกเลิก': 'bg-red-100 text-red-800',
};
