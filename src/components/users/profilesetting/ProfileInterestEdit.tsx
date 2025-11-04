import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import InterestModal from "../../common/modal/InterestModal";

//관심사 수정
function ProfileInterestEdit() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [originalSelected, setOriginalSelected] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 프로필 / 관심사 불러오기
  useEffect(() => {
    const fetchProfileAndInterests = async () => {
      if (!user) {
        // setLoading(false);
        return;
      }

      try {
        // 유저 관심사 ID 가져오기
        const { data: userInterests, error: interestsError } = await supabase
          .from("user_interests")
          .select("category_sub_id")
          .eq("user_id", user.id);

        if (interestsError) {
          console.error("관심사 로드 에러:", interestsError);
        }

        // 전체 카테고리 가져오기
        const { data: categories, error: categoriesError } = await supabase
          .from("categories_sub")
          .select("sub_id, category_sub_name");

        if (categoriesError) {
          console.error("카테고리 로드 에러:", categoriesError);
        }

        // id -> name 매핑
        if (userInterests && categories) {
          const interestNames = userInterests.map((ui: any) => {
            const cat = categories.find(
              (c: any) => c.sub_id === ui.category_sub_id,
            );
            return cat?.category_sub_name || "이름없음";
          });

          setSelected(interestNames);
          setOriginalSelected(interestNames);
          // console.log('유저 관심사:', interestNames);
        }
      } catch (err) {
        console.error("프로필/관심사 로드 실패:", err);
      }
    };

    fetchProfileAndInterests();
  }, [user]);

  // 선택/해제 (로컬에서만 변경)
  const toggleInterest = (item: string) => {
    setSelected((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else if (prev.length < 5) {
        return [...prev, item];
      }
      return prev;
    });
  };

  // 저장 눌렀을 때 DB 반영
  const handleSave = async () => {
    if (!user) return;

    try {
      const { data: categories } = await supabase
        .from("categories_sub")
        .select("sub_id, category_sub_name");

      if (!categories) return;

      // 기존 관심사 모두 삭제
      await supabase.from("user_interests").delete().eq("user_id", user.id);

      // 새로 선택된 관심사 추가
      const insertData = selected
        .map((item) => {
          const cat = categories.find((c) => c.category_sub_name === item);
          return { user_id: user.id, category_sub_id: cat?.sub_id };
        })
        .filter((d) => d.category_sub_id);

      if (insertData.length > 0) {
        await supabase.from("user_interests").insert(insertData);
      }

      setOriginalSelected(selected);
      setIsModalOpen(false);
    } catch (err) {
      console.error("관심사 저장 실패:", err);
      alert("관심사 저장 중 오류가 발생했습니다.");
    }
  };

  // 취소 눌렀을 때
  const handleCancel = () => {
    setSelected(originalSelected);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="text-lg text-gray-400 font-semibold mr-[70px]">
          관심사
        </div>
        <div className="flex gap-[13px]">
          {selected.map((item) => (
            <div
              key={item}
              className="bg-brand text-white py-[5px] px-[8px] rounded-[5px]"
            >
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
          selected={selected}
          toggleInterest={toggleInterest}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default ProfileInterestEdit;
