// types/index.ts

export interface Customer {
  id: string;
  name_kor: string;
  name_eng: string;
  passport_number: string;
  birth_date: string;
  passport_expiry: string;
  phone: string;
  email?: string;
  address?: string;
  travel_history?: string;
  notes?: string;
  passport_file_name?: string;
  passport_file_data?: string; // Base64 encoded data
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  destination: string;
  duration: number;
  price: number;
  status: '활성' | '비활성';
  description?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  departure_date?: string;
  return_date?: string;
  participants?: number;
  total_price?: number;
  hotel_name?: string;
  flight_number?: string;
  status?: '문의' | '견적발송' | '예약확정' | '출발완료' | '여행완료' | '취소';
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  booking_id?: string;
  customer_name?: string;
  product_name?: string;
  departure_date?: string;
  days_before?: number;
  notification_type?: '여권확인' | '출발준비' | '출발임박' | '당일';
  message?: string;
  is_read: 0 | 1;
  priority?: 'สูง' | 'ปกติ' | 'ต่ำ'; // 태국어? -> '높음' | '보통' | '낮음'
  created_at: string;
}

export interface Todo {
  id: string;
  title: string;
  due_date?: string;
  priority?: '높음' | '보통' | '낮음';
  description?: string;
  is_completed: 0 | 1;
  created_at: string;
}
