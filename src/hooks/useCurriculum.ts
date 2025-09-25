// 커리큘럼 훅 - 코드 너무 길어져서 로직 분리 했어요 (CreateGroupStep2, 3 다 쓰는 형태라)
// 2025-09-24 업데이트: RichTextEditor 안정성을 위한 useCallback 추가
import { useState, useCallback } from 'react';

// CurriculumCard Props 타입
export interface CurriculumCardProps {
  index: number;
  item: CurriculumItem;
  onChange: (index: number, field: keyof CurriculumItem, value: string) => void;
  onFileChange: (index: number, files: File[]) => void; // 여러 장 파일을 배열로 받도록 변경함!
  onRemove?: (index: number) => void;
}

// 커리큘럼 아이템 타입 (각 단계별 제목 + 상세내용)
export interface CurriculumItem {
  title: string;
  detail: string;
}

// 커리큘럼 관리용 훅 - initial: 초기 커리큘럼 배열 (길이에 맞춰 files 초기화)
export function useCurriculum(initial: CurriculumItem[]) {
  // ✅ 각 단계별 파일을 여러 장 보관할 수 있도록 2차원 배열로 변경
  const [files, setFiles] = useState<File[][]>(
    Array(initial.length).fill([]), // 초기화: 각 단계는 빈 배열
  );

  // 2025-09-24 업데이트: 새로운 커리큘럼 단계 추가 - useCallback으로 메모이제이션
  const addCurriculum = useCallback(
    (curriculum: CurriculumItem[], onChange: (next: CurriculumItem[]) => void) => {
      const next = [...curriculum, { title: '', detail: '' }];
      onChange(next);
      setFiles(prev => [...prev, []]); // 새 단계에 파일 배열 추가!!!
    },
    [],
  );

  // 2025-09-24 업데이트: 특정 커리큘럼 단계 내용 업데이트 - useCallback으로 메모이제이션
  const updateCurriculum = useCallback(
    (
      index: number,
      field: keyof CurriculumItem,
      value: string,
      curriculum: CurriculumItem[],
      onChange: (next: CurriculumItem[]) => void,
    ) => {
      const next = [...curriculum];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [],
  );

  // 2025-09-24 업데이트: 삭제 - useCallback으로 메모이제이션
  const removeCurriculum = useCallback(
    (index: number, curriculum: CurriculumItem[], onChange: (next: CurriculumItem[]) => void) => {
      if (curriculum.length <= 2) return;
      const next = curriculum.filter((_, i) => i !== index);
      onChange(next);
      setFiles(prev => prev.filter((_, i) => i !== index)); // 파일 배열도 같은 인덱스 제거함
    },
    [],
  );

  return { files, setFiles, addCurriculum, updateCurriculum, removeCurriculum };
}
