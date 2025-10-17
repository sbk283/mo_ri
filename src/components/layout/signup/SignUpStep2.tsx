import { Button } from 'antd';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { saveUserInterests } from '../../../lib/interests';
import { useCategorySubs } from '../../../hooks/useCategoriesSub';

interface SignUpStep2Props {
  onSubmit: (selectedItems: string[]) => void;
}

const categories = [
  {
    label: '운동 / 건강',
    items: ['구기활동', '실내활동', '실외활동', '힐링/건강관리'],
    icon: '/images/health.svg',
  },
  {
    label: '취미 / 여가',
    items: ['예술/창작', '음악/공연/문화', '요리/제과제빵', '게임/오락'],
    icon: '/images/hobby.svg',
  },
  {
    label: '봉사 / 사회참여',
    items: ['복지/나눔', '캠페인'],
    icon: '/images/volunteer.svg',
  },
  {
    label: '스터디 / 자기계발',
    items: ['학습', 'IT'],
    icon: '/images/study.svg',
  },
];

function SignUpStep2({ onSubmit }: SignUpStep2Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { subCategories, loading, error } = useCategorySubs();
  const MAX_SELECTION = 5;

  console.log('subCategories:', subCategories, loading, error);

  const toggleSelect = (item: string) => {
    if (selected.includes(item)) {
      setSelected(prev => prev.filter(i => i !== item));
    } else {
      // 5개 미만일 때만 추가
      if (selected.length < MAX_SELECTION) {
        setSelected(prev => [...prev, item]);
      }
      // 5개를 이미 선택한 상태에서 더 추가하면 무시(아무 동작 없음)
    }
  };

  const handleNext = async () => {
    if (selected.length === 0 || saving) return;

    setSaving(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) {
      setSaving(false);
      alert('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    const selectedSubIds = subCategories
      .filter(sub => selected.includes(sub.category_sub_name))
      .map(sub => sub.sub_id);

    const { error: saveError } = await saveUserInterests(user.id, selectedSubIds);
    setSaving(false);

    if (saveError) {
      alert('관심사 저장 실패');
      return;
    }

    onSubmit(selected);
  };

  return (
    <div className="py-[40px] px-[90px]">
      <div className="flex items-center gap-4 mb-5">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">관심사 선택</div>
      </div>

      <div>
        {categories.map(({ label, items, icon }) => (
          <div key={label} className="mb-6">
            <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
              <img className="h-[29px]" src={icon} alt={label} />
              <p className="font-bold text-xl text-gray-[#3c3c3c]">{label}</p>
            </div>
            <div className="flex gap-[10px] text-lg font-bold text-gray-600">
              {items.map(item => (
                <button
                  key={item}
                  className={`border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand ${selected.includes(item) ? 'bg-brand text-white border-brand' : ''}
    ${selected.length >= MAX_SELECTION && !selected.includes(item) ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
  `}
                  onClick={() => toggleSelect(item)}
                  type="button"
                  disabled={selected.length >= MAX_SELECTION && !selected.includes(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}

        {selected.length === 0 && (
          <div className="mb-3 text-red-600 relative">
            <p className="absolute">관심사는 최대 5개까지 선택하실 수 있습니다.</p>
          </div>
        )}

        <div className="mb-14"></div>
        <Button
          htmlType="button"
          onClick={handleNext}
          disabled={selected.length === 0 || saving}
          className="w-[100%] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
        >
          다음단계
        </Button>
      </div>
    </div>
  );
}

export default SignUpStep2;
