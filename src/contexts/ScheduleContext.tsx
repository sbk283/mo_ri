import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { group_schedule } from '../types/group';

export interface Schedule extends group_schedule {}

interface ScheduleContextType {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: (groupId: string, start: string, end: string) => Promise<void>;
  addSchedule: (
    payload: Omit<group_schedule, 'schedule_id' | 'schedule_created_at'>,
  ) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<group_schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  clearSchedules: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (groupId: string, start: string, end: string) => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('group_schedule')
      .select('*')
      .eq('group_id', groupId)
      .gte('schedule_start_at', start)
      .lt('schedule_start_at', end)
      .order('schedule_start_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setSchedules(data as Schedule[]);
    }
    setLoading(false);
  }, []);

  // 추가
  const addSchedule = useCallback(
    async (payload: Omit<group_schedule, 'schedule_id' | 'schedule_created_at'>) => {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('group_schedule')
        .insert([payload])
        .select('*')
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data) {
        setSchedules(prev => [...prev, data as Schedule]);
      }
    },
    [],
  );

  // 업데이트
  const updateSchedule = useCallback(async (id: string, updates: Partial<group_schedule>) => {
    setError(null);
    const { data, error: updateError } = await supabase
      .from('group_schedule')
      .update(updates)
      .eq('schedule_id', id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      setSchedules(prev => prev.map(s => (s.schedule_id === id ? (data as Schedule) : s)));
    }
  }, []);

  // 삭제
  const deleteSchedule = useCallback(async (id: string) => {
    setError(null);
    const { error: deleteError } = await supabase
      .from('group_schedule')
      .delete()
      .eq('schedule_id', id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSchedules(prev => prev.filter(s => s.schedule_id !== id));
    }
  }, []);

  // 달(month)이 바뀔 때 상태 초기화
  const clearSchedules = useCallback(() => {
    setSchedules([]);
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        clearSchedules,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

// 커스텀 훅
export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error('useSchedule은 ScheduleProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
