import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import NicknameEditModal from "../../common/modal/NicknameEditModal";
import { useAuth } from "../../../contexts/AuthContext";

interface ProfileInfoEditProps {
  name: string;
  email: string | undefined;
  nickname: string;
  setNickname: (newName: string) => void; // 기존 props 유지
}

function ProfileInfoEdit({
  name,
  email,
  nickname,
  setNickname,
}: ProfileInfoEditProps) {
  const { user, updateNickname } = useAuth(); // 2025-11-11-유비 Context 닉네임 변경 추가
  const [isNicknameEditModalOpen, setIsNicknameEditModalOpen] = useState(false);

  // 닉네임 저장함수
  const handleNicknameSave = async (newName: string) => {
    try {
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ nickname: newName })
        .eq("user_id", user.id);

      if (error) throw error;

      setNickname(newName);

      // 2025-11-11-유비: AuthContext 글로벌 nickname 업데이트
      updateNickname(newName);

      // 2025-11-11-유비 Header에게 전역 이벤트로 변경 알림 (기존 로직 유지)
      window.dispatchEvent(
        new CustomEvent("nicknameUpdated", { detail: newName }),
      );

      setIsNicknameEditModalOpen(false);
    } catch (err) {
      console.error("닉네임 업데이트 실패:", err);
      alert("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      {/* 오른쪽 -  아이디, 닉네임, 비밀번호 */}
      <div className="text-lg text-gray-200 font-medium">
        <div className="flex mb-[23px]">
          <label className="w-[100px] text-gray-400 font-semibold">이름</label>
          <p>{name || "이름없음"}</p>
        </div>

        <div className="flex  mb-[23px]">
          <label className="w-[100px] text-gray-400 font-semibold">
            아이디
          </label>
          <p>{user?.email || "이름없음"}</p>
        </div>

        <div className="flex mb-[10px] items-center justify-between">
          <label className="w-[100px] text-gray-400 font-semibold">
            닉네임
          </label>
          <p className="w-[300px]">{nickname}</p>
          <button
            onClick={() => setIsNicknameEditModalOpen(true)}
            className="mr-[3px] font-semibold text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
          >
            변경
          </button>
          {isNicknameEditModalOpen && (
            <NicknameEditModal
              currentNickname={nickname}
              onClose={() => setIsNicknameEditModalOpen(false)}
              onSave={handleNicknameSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoEdit;
