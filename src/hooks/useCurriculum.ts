// 커리큘럼 훅 - Step2, Step3 공용
import { useCallback } from 'react';
import type { CurriculumItem } from '../types/group';

// Step2, Step3 공용 커리큘럼 관리 훅
export function useCurriculum() {
  // 새 커리큘럼 추가
  const addCurriculum = useCallback(
    (
      curriculum: CurriculumItem[],
      onChange: (next: CurriculumItem[]) => void,
      index?: number, // 중간 삽입 위치
    ) => {
      const newItem: CurriculumItem = { title: '', detail: '', files: [] };

      const next =
        typeof index === 'number'
          ? [...curriculum.slice(0, index + 1), newItem, ...curriculum.slice(index + 1)]
          : [...curriculum, newItem];

      onChange(next);
    },
    [],
  );

  // 특정 항목 수정 (제목, 내용, 파일 등)
  const updateCurriculum = useCallback(
    <K extends keyof CurriculumItem>(
      index: number,
      field: K,
      value: CurriculumItem[K],
      curriculum: CurriculumItem[],
      onChange: (next: CurriculumItem[]) => void,
    ) => {
      const next = [...curriculum];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [],
  );

  // 삭제
  const removeCurriculum = useCallback(
    (index: number, curriculum: CurriculumItem[], onChange: (next: CurriculumItem[]) => void) => {
      if (curriculum.length <= 2) return; // 최소 2단계는 유지
      const next = curriculum.filter((_, i) => i !== index);
      onChange(next);
    },
    [],
  );

  return { addCurriculum, updateCurriculum, removeCurriculum };
}
