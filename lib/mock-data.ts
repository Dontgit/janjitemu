import {
  AvailabilityDay,
  Booking,
  BusinessHour,
  BusinessProfile,
  Customer,
  DashboardStat,
  Service,
  TimelineItem
} from "@/lib/types";

export const businessProfile: BusinessProfile = {
  id: "business-mock-1",
  ownerName: "Owner Temujanji",
  slug: "temujanji-studio",
  name: "Temujanji Studio",
  category: "Beauty Studio",
  city: "Bandung",
  description:
    "Studio appointment-based untuk treatment singkat, konsultasi, dan layanan premium dengan booking yang rapi.",
  bookingLink: "temujanji.app/book/temujanji-studio",
  phone: "0812-0000-1234",
  email: "halo@temujanji.app",
  reminderChannel: "Email + reminder dashboard"
};

export const services: Service[] = [
  {
    id: "svc-1",
    businessId: "business-mock-1",
    name: "Haircut Signature",
    duration: 45,
    price: 95000,
    description: "Potong rambut, styling ringan, dan konsultasi cepat.",
    active: true,
    popular: true
  },
  {
    id: "svc-2",
    businessId: "business-mock-1",
    name: "Creambath Relax",
    duration: 60,
    price: 145000,
    description: "Perawatan rambut dengan pijat kepala dan blow ringan.",
    active: true
  },
  {
    id: "svc-3",
    businessId: "business-mock-1",
    name: "Express Facial",
    duration: 30,
    price: 120000,
    description: "Facial cepat untuk customer yang datang di sela jadwal kerja.",
    active: true
  }
];

export const bookings: Booking[] = [
  {
    id: "BK-24031",
    businessId: "business-mock-1",
    customerId: "cust-1",
    customerName: "Anisa Putri",
    phone: "0812-3344-1100",
    email: "anisa@email.com",
    serviceId: "svc-1",
    serviceName: "Haircut Signature",
    date: "2026-03-26",
    time: "09:00",
    endDate: "2026-03-26",
    endTime: "09:45",
    duration: 45,
    status: "confirmed",
    notes: "Minta potongan pendek rapih untuk acara kantor."
  },
  {
    id: "BK-24032",
    businessId: "business-mock-1",
    customerId: "cust-2",
    customerName: "Raka Saputra",
    phone: "0819-2045-0091",
    serviceId: "svc-2",
    serviceName: "Creambath Relax",
    date: "2026-03-26",
    time: "11:00",
    endDate: "2026-03-26",
    endTime: "12:00",
    duration: 60,
    status: "pending"
  },
  {
    id: "BK-24033",
    businessId: "business-mock-1",
    customerId: "cust-3",
    customerName: "Lina Marlina",
    phone: "0857-8811-1022",
    serviceId: "svc-3",
    serviceName: "Express Facial",
    date: "2026-03-27",
    time: "14:00",
    endDate: "2026-03-27",
    endTime: "14:30",
    duration: 30,
    status: "rescheduled",
    notes: "Dipindah dari jam 13.00 karena bentrok."
  },
  {
    id: "BK-24034",
    businessId: "business-mock-1",
    customerId: "cust-4",
    customerName: "Dewi Anggraini",
    phone: "0811-8877-6655",
    serviceId: "svc-1",
    serviceName: "Haircut Signature",
    date: "2026-03-27",
    time: "16:00",
    endDate: "2026-03-27",
    endTime: "16:45",
    duration: 45,
    status: "completed"
  }
];

export const businessHours: BusinessHour[] = [
  { day: "Senin", open: "09:00", close: "18:00", active: true },
  { day: "Selasa", open: "09:00", close: "18:00", active: true },
  { day: "Rabu", open: "09:00", close: "19:00", active: true },
  { day: "Kamis", open: "09:00", close: "19:00", active: true },
  { day: "Jumat", open: "09:00", close: "19:00", active: true },
  { day: "Sabtu", open: "08:00", close: "17:00", active: true },
  { day: "Minggu", open: "00:00", close: "00:00", active: false }
];

export const availableDates: AvailabilityDay[] = [
  {
    label: "Hari ini",
    value: "2026-03-26",
    slots: ["09:00", "10:00", "11:00", "13:00", "15:00"]
  },
  {
    label: "Besok",
    value: "2026-03-27",
    slots: ["09:30", "10:30", "14:00", "16:00"]
  },
  {
    label: "Sabtu",
    value: "2026-03-28",
    slots: ["08:00", "09:00", "10:00", "13:00", "15:30"]
  }
];

export const customers: Customer[] = [
  {
    id: "cust-1",
    businessId: "business-mock-1",
    name: "Anisa Putri",
    phone: "0812-3344-1100",
    email: "anisa@email.com",
    source: "Instagram",
    bookingCount: 3,
    lastBookingAt: "2026-03-26T09:00:00.000Z"
  },
  {
    id: "cust-2",
    businessId: "business-mock-1",
    name: "Raka Saputra",
    phone: "0819-2045-0091",
    source: "WhatsApp",
    bookingCount: 1,
    lastBookingAt: "2026-03-26T11:00:00.000Z"
  },
  {
    id: "cust-3",
    businessId: "business-mock-1",
    name: "Lina Marlina",
    phone: "0857-8811-1022",
    email: "lina@email.com",
    source: "Referral",
    bookingCount: 2,
    lastBookingAt: "2026-03-27T14:00:00.000Z"
  }
];

export const dashboardStats: DashboardStat[] = [
  { label: "Booking hari ini", value: "12", detail: "+3 dari kemarin" },
  { label: "Menunggu konfirmasi", value: "4", detail: "Perlu follow up pagi ini" },
  { label: "No-show bulan ini", value: "2", detail: "Turun 33%" },
  { label: "Layanan terlaris", value: "Haircut", detail: "41% dari total booking" }
];

export const timelineItems: TimelineItem[] = [
  {
    time: "09:00",
    title: "Anisa Putri - Haircut Signature",
    meta: "Confirmed • Staff utama"
  },
  {
    time: "11:00",
    title: "Raka Saputra - Creambath Relax",
    meta: "Pending • Perlu konfirmasi"
  },
  {
    time: "14:00",
    title: "Lina Marlina - Express Facial",
    meta: "Rescheduled • Slot baru"
  }
];
