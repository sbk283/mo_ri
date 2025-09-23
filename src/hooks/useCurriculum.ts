// 커리큘럼 훅 - 코드 너무 길어져서 로직 분리 했어요 (CreateGroupStep2, 3 다 쓰는 형태라)
import { useState } from 'react';

// CurriculumCard Props 타입
export interface CurriculumCardProps {
  index: number;
  item: CurriculumItem;
  onChange: (index: number, field: keyof CurriculumItem, value: string) => void;
  onFileChange: (index: number, file: File | null) => void;
  onRemove?: (index: number) => void;
}

// 커리큘럼 아이템 타입 (각 단계별 제목 + 상세내용)
export interface CurriculumItem {
  title: string;
  detail: string;
}

// 커리큘럼 관리용 훅 - initial: 초기 커리큘럼 배열 (길이에 맞춰 files 초기화)
export function useCurriculum(initial: CurriculumItem[]) {
  const [files, setFiles] = useState<(File | null)[]>(Array(initial.length).fill(null));

  // 새로운 커리큘럼 단계 추가
  const addCurriculum = (
    curriculum: CurriculumItem[],
    onChange: (next: CurriculumItem[]) => void,
  ) => {
    const next = [...curriculum, { title: '', detail: '' }];
    onChange(next);
    setFiles([...files, null]);
  };

  // 특정 커리큘럼 단계 내용 업데이트
  const updateCurriculum = (
    index: number,
    field: keyof CurriculumItem,
    value: string,
    curriculum: CurriculumItem[],
    onChange: (next: CurriculumItem[]) => void,
  ) => {
    const next = [...curriculum];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  // 삭제
  const removeCurriculum = (
    index: number,
    curriculum: CurriculumItem[],
    onChange: (next: CurriculumItem[]) => void,
  ) => {
    if (curriculum.length <= 2) return;
    const next = curriculum.filter((_, i) => i !== index);
    onChange(next);
    setFiles(files.filter((_, i) => i !== index));
  };

  return { files, setFiles, addCurriculum, updateCurriculum, removeCurriculum };
}
