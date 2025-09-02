import { createClient } from '@supabase/supabase-js';

// CRA : process.env .... 의 환경 변수 호출과는 형식이 다름.
// Vite : import.meta.env ...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
// 웹 브라우저 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
