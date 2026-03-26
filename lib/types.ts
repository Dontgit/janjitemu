export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type UserRole = "owner" | "staff";

export type Service = {
  id: string;
  businessId?: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  active?: boolean;
  popular?: boolean;
};

export type Booking = {
  id: string;
  businessId?: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string | null;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  duration?: number;
  status: BookingStatus;
  notes?: string;
};

export type BusinessHour = {
  id?: string;
  dayOfWeek?: number;
  day: string;
  open: string;
  close: string;
  active: boolean;
};

export type BusinessProfile = {
  id?: string;
  ownerName?: string;
  slug?: string;
  name: string;
  category: string;
  city: string;
  description: string;
  bookingLink: string;
  phone?: string;
  email?: string;
  reminderChannel: string;
  onboardingCompleted?: boolean;
};

export type Customer = {
  id: string;
  businessId?: string;
  name: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  notes?: string | null;
  bookingCount?: number;
  lastBookingAt?: string | null;
};

export type AvailabilityDay = {
  label: string;
  value: string;
  slots: string[];
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};

export type TimelineItem = {
  time: string;
  title: string;
  meta: string;
};

export type DashboardHighlight = {
  label: string;
  value: string;
  detail: string;
};

export type BookingSummary = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
  today: number;
};

export type PublicBookingFormValues = {
  serviceId?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  source?: string;
  date?: string;
  time?: string;
  notes?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};
