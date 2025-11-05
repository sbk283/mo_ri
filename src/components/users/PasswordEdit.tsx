// 비밀번호 확인 완료시 나오는 수정창.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile } from "../../lib/profile";
import ProfileCareerEdit from "./profilesetting/ProfileCareerEdit";
import ProfileImageEdit from "./profilesetting/ProfileImageEdit";
import ProfileInfoEdit from "./profilesetting/ProfileInfoEdit";
import ProfileInterestEdit from "./profilesetting/ProfileInterestEdit";
import ProfileMarketingEdit from "./profilesetting/ProfileMarketingEdit";
import LoadingSpinner from "../common/LoadingSpinner";

function PasswordEdit() {
  const { user } = useAuth();

  // 닉네임 , 이름 , 프로필 이미지 상태
  const [nickname, setNickname] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("/profile_bg.png");

  // 프로필 불러오기
  useEffect(() => {
    const fetchProfileAndInterests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // 프로필 가져오기
        const profile = await getProfile(user.id);
        if (profile) {
          setNickname(profile.nickname || "사용자");
          setName(profile.name || "");
          const avatar = profile.avatar_url || "/profile_bg.png";
          setAvatarUrl(avatar);
        }
      } catch (err) {
        console.error("프로필 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndInterests();
  }, [user]);

  // 로딩중..
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="text-brand font-bold text-xl mb-[21px]">기본정보</div>

      {/* 박스 부분 */}
      <div className="border border-gray-300 rounded-[5px] py-[60px] px-[80px] mb-[39px] w-[1024px]">
        <div className="flex justify-between">
          {/* 왼쪽 - 이름 프로필 */}
          <div className="text-lg text-gray-200 font-semibold mr-[63px]">
            <div className="flex gap-[38px]">
              <label className="w-[100px] text-gray-400">프로필 사진</label>

              {/* 프로필 이미지 영역 (클릭 시 교체 가능) */}
              <ProfileImageEdit
                user={user}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
              />
            </div>
          </div>

          {/* 오른쪽 -  아이디, 닉네임, 비밀번호 */}
          <ProfileInfoEdit
            name={name}
            email={user?.email}
            nickname={nickname}
            setNickname={setNickname}
          />
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 관심사 */}
        <ProfileInterestEdit />

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 경력사항 */}
        <ProfileCareerEdit />

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 마케팅 수신동의 */}
        <ProfileMarketingEdit />
      </div>

      {/* 탈퇴하기 */}
      {/* <Link
        to={'/deleteaccount'}
        className="flex justify-end font-normal text-[12px] text-gray-200 mr-[39px]"
      >
        회원 탈퇴 하기
      </Link> */}
    </div>
  );
}

export default PasswordEdit;
