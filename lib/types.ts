export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type FollowUpStatus =
  | "none"
  | "needs-follow-up"
  | "contacted"
  | "offer-sent"
  | "won"
  | "lost";

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
  isAddon?: boolean;
  allowedPrimaryServiceIds?: string[];
  allowedPrimaryServiceNames?: string[];
  linkedAddonIds?: string[];
  linkedAddonNames?: string[];
};

export type BookingAddOn = {
  id: string;
  name: string;
  price: number;
  duration: number;
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
  assignedTeamMemberId?: string | null;
  assignedStaffName?: string | null;
  assignedStaffActive?: boolean | null;
  assignedStaffServiceFit?: boolean | null;
  assignedStaffDailyLoad?: number | null;
  addOns?: BookingAddOn[];
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  duration?: number;
  totalDuration?: number;
  totalPrice?: number;
  status: BookingStatus;
  notes?: string;
  followUpStatus?: FollowUpStatus;
  followUpNote?: string | null;
  followUpNextActionAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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
  bookingSlotInterval?: number;
  bookingBufferMins?: number;
  onboardingCompleted?: boolean;
};


export type TeamMemberAvailability = {
  id?: string;
  dayOfWeek: number;
  label: string;
  shortLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  note?: string | null;
};

export type TeamMember = {
  id: string;
  businessId?: string;
  name: string;
  roleLabel: string;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  availabilitySummary?: string | null;
  workDaysSummary?: string[];
  active?: boolean;
  serviceIds?: string[];
  serviceNames?: string[];
  weeklyAvailability?: TeamMemberAvailability[];
  weeklyAvailabilityNote?: string | null;
  serviceFit?: boolean;
  dailyLoad?: number | null;
  availabilityFit?: boolean | null;
  hasBookingConflict?: boolean;
  assignmentWarnings?: string[];
  assignmentHint?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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


export type TeamCapacityBookingItem = {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  endTime?: string;
  totalDuration: number;
  status: BookingStatus;
};

export type TeamCapacityMember = {
  id: string;
  name: string;
  roleLabel: string;
  active: boolean;
  serviceNames: string[];
  availabilitySummary?: string | null;
  workDaysSummary: string[];
  weeklyAvailabilityHours: number;
  weeklyAvailabilityLabel: string;
  todayAvailabilityMinutes: number;
  bookingsToday: number;
  upcomingBookings: number;
  totalAssignedMinutes: number;
  assignedServicesSummary: string;
  utilizationPercent: number | null;
  capacityState: "available" | "light" | "balanced" | "busy" | "inactive";
  capacityLabel: string;
  todayBookings: TeamCapacityBookingItem[];
  nextBookings: TeamCapacityBookingItem[];
};

export type TeamCapacityPageData = {
  summary: {
    totalMembers: number;
    activeMembers: number;
    assignedToday: number;
    totalTodayMinutes: number;
    weeklyCapacityHours: number;
    lightlyLoadedMembers: number;
    busyMembers: number;
  };
  focusDate: string;
  members: TeamCapacityMember[];
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AnalyticsStatusBreakdownItem = {
  status: BookingStatus;
  label: string;
  count: number;
  share: number;
};

export type AnalyticsServicePerformanceItem = {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  completed: number;
  completionRate: number;
  addonAttachRate: number;
};

export type AnalyticsAddonPerformanceItem = {
  id: string;
  name: string;
  attachCount: number;
  revenue: number;
  totalDuration: number;
};

export type AnalyticsInsightItem = {
  title: string;
  detail: string;
  tone: "good" | "warning" | "neutral";
};

export type AnalyticsPageData = {
  summary: AnalyticsMetric[];
  statusBreakdown: AnalyticsStatusBreakdownItem[];
  servicePerformance: AnalyticsServicePerformanceItem[];
  addonPerformance: AnalyticsAddonPerformanceItem[];
  operationalInsights: AnalyticsInsightItem[];
  upcomingBookings: Booking[];
  dueFollowUps: Booking[];
  nextSevenDays: {
    totalBookings: number;
    totalRevenue: number;
    busyDays: Array<{
      date: string;
      count: number;
    }>;
  };
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

export type BookingDetailData = {
  booking: Booking;
  customer?: Customer | null;
  relatedBookings: Booking[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    totalSpent: number;
    latestBookingAt: string | null;
  };
};

export type FollowUpBoardColumn = {
  id: FollowUpStatus;
  label: string;
  description: string;
  items: Booking[];
};

export type ReminderItem = {
  booking: Booking;
  type: "follow-up" | "appointment";
  priority: "high" | "medium" | "low";
  dueAt: string;
  title: string;
  detail: string;
};

export type PublicBookingFormValues = {
  serviceId?: string;
  addOnIds?: string;
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
