import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { group_schedule } from '../types/group';

export interface Schedule extends group_schedule {}

interface ScheduleContextType {
  schedules: Schedule[];
  loading: boolean;
  error: string | null;
  fetchSchedules: (groupId: string, startDate: string, endDate: string) => Promise<void>;
  addSchedule: (
    payload: Omit<group_schedule, 'schedule_id' | 'schedule_created_at'>,
  ) => Promise<void>;
  updateSchedule: (scheduleId: string, updates: Partial<group_schedule>) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  clearSchedules: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 일정 조회: 종료일도 고려하여 해당 월과 겹치는 모든 일정 조회
  const fetchSchedules = useCallback(
    async (groupId: string, startDate: string, endDate: string) => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('group_schedule')
        .select('*')
        .eq('group_id', groupId)
        .gte('schedule_end_at', startDate) // 종료일이 월 시작일 이후 (아직 끝나지 않음)
        .lt('schedule_start_at', endDate) // 시작일이 월 종료일 이전 (이미 시작됨)
        .order('schedule_start_at', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setSchedules(data as Schedule[]);
      }
      setLoading(false);
    },
    [],
  );

  // 일정 추가
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
        setSchedules(previousSchedules => [...previousSchedules, data as Schedule]);
      }
    },
    [],
  );

  // 일정 업데이트
  const updateSchedule = useCallback(
    async (scheduleId: string, updates: Partial<group_schedule>) => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('group_schedule')
        .update(updates)
        .eq('schedule_id', scheduleId)
        .select('*')
        .single();

      if (updateError) {
        setError(updateError.message);
      } else if (data) {
        setSchedules(previousSchedules =>
          previousSchedules.map(schedule =>
            schedule.schedule_id === scheduleId ? (data as Schedule) : schedule,
          ),
        );
      }
    },
    [],
  );

  // 일정 삭제
  const deleteSchedule = useCallback(async (scheduleId: string) => {
    setError(null);
    const { error: deleteError } = await supabase
      .from('group_schedule')
      .delete()
      .eq('schedule_id', scheduleId);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSchedules(previousSchedules =>
        previousSchedules.filter(schedule => schedule.schedule_id !== scheduleId),
      );
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
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule은 ScheduleProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
