import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import InterestModal from '../../common/modal/InterestModal';

//관심사 수정
function ProfileInterestEdit() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 프로필 / 관심사 불러오기
  useEffect(() => {
    const fetchProfileAndInterests = async () => {
      if (!user) {
        // setLoading(false);
        return;
      }

      try {
        // 프로필 가져오기
        // const profile = await getProfile(user.id);
        // if (profile) {
        //   setNickname(profile.nickname || '사용자');
        //   setName(profile.name || '');
        //   const avatar = profile.avatar_url || '/ham.png';
        //   setAvatarUrl(avatar);
        // }

        // 유저 관심사 ID 가져오기
        const { data: userInterests, error: interestsError } = await supabase
          .from('user_interests')
          .select('category_sub_id')
          .eq('user_id', user.id);

        if (interestsError) {
          console.error('관심사 로드 에러:', interestsError);
        }

        // 전체 카테고리 가져오기
        const { data: categories, error: categoriesError } = await supabase
          .from('categories_sub')
          .select('sub_id, category_sub_name');

        if (categoriesError) {
          console.error('카테고리 로드 에러:', categoriesError);
        }

        // id -> name 매핑
        if (userInterests && categories) {
          const interestNames = userInterests.map((ui: any) => {
            const cat = categories.find((c: any) => c.sub_id === ui.category_sub_id);
            return cat?.category_sub_name || '이름없음';
          });

          setSelected(interestNames);
          // console.log('유저 관심사:', interestNames);
        }
      } catch (err) {
        console.error('프로필/관심사 로드 실패:', err);
      }
    };

    fetchProfileAndInterests();
  }, [user]);

  // 관심사
  const toggleInterest = async (item: string) => {
    if (!user) return;

    try {
      // 전체 카테고리에서 sub_id 찾기
      const { data: categories } = await supabase
        .from('categories_sub')
        .select('sub_id, category_sub_name');

      const category = categories?.find(c => c.category_sub_name === item);
      if (!category) return;

      // 선택 해제
      if (selected.includes(item)) {
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user.id)
          .eq('category_sub_id', category.sub_id);

        setSelected(prev => prev.filter(i => i !== item));
      }
      // 선택 추가
      else if (selected.length < 5) {
        await supabase
          .from('user_interests')
          .insert({ user_id: user.id, category_sub_id: category.sub_id });

        setSelected(prev => [...prev, item]);
      }
    } catch (err) {
      console.error('관심사 업데이트 실패:', err);
      alert('관심사 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="text-lg text-gray-400 font-semibold mr-[70px]">관심사</div>
        <div className="flex gap-[13px]">
          {selected.map(item => (
            <div key={item} className="bg-brand text-white py-[5px] px-[8px] rounded-[5px]">
              {item}
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
        >
          변경
        </button>

        <InterestModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selected={selected}
          toggleInterest={toggleInterest}
        />
      </div>
    </div>
  );
}

export default ProfileInterestEdit;
