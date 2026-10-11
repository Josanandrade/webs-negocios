export type Role = "admin" | "athlete";
export type PaymentStatus = "paid" | "pending";
export type AccessStatus = "pending" | "active" | "blocked";
export type WeekStatus = "draft" | "published";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  payment_status: PaymentStatus;
  access_status: AccessStatus;
  created_at: string;
};

export type Settings = {
  auto_block_unpaid: boolean;
  show_past_weeks: boolean;
};

export type Block = {
  id: string;
  title: string;
  content: string;
  position: number;
};

export type Day = {
  id: string;
  date: string;
  day_of_week: number;
  workout_blocks: Block[];
};

export type Week = {
  id: string;
  start_date: string;
  end_date: string;
  status: WeekStatus;
  published_at: string | null;
  updated_at: string;
};

export type WeekWithDays = Week & { days: Day[] };
