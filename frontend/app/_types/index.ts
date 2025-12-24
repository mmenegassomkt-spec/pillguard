export interface Profile {
  id: string;
  name: string;
  color: string;
  avatar: string;
  created_at: string;
}

export interface Medication {
  id: string;
  profile_id: string;
  name: string;
  dosage: string;
  priority: 'normal' | 'importante' | 'crítico';
  stock_quantity: number;
  min_stock_alert: number;
  doctor_name?: string;
  doctor_contact?: string;
  prescription_photo?: string;
  box_photo?: string;
  is_prescription_required: boolean;
  created_at: string;
}

export interface Alarm {
  id: string;
  profile_id: string;
  time: string;
  frequency: 'daily' | 'alternate' | 'specific';
  specific_days?: number[];
  medication_ids: string[];
  is_critical: boolean;
  repeat_interval_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface AlarmLog {
  id: string;
  alarm_id: string;
  medication_ids: string[];
  profile_id: string;
  scheduled_time: string;
  confirmed_time?: string;
  status: 'taken' | 'skipped' | 'missed';
  notes?: string;
  created_at: string;
}

export interface PremiumTrial {
  id: string;
  profile_id: string;
  trial_start: string;
  trial_end: string;
  is_active: boolean;
}

export interface Stats {
  medications_count: number;
  alarms_count: number;
  low_stock_count: number;
  low_stock_items: Medication[];
  adherence_rate: number;
}