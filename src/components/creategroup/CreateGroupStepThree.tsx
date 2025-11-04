import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useGroup } from "../../contexts/GroupContext";
import { useGroupMember } from "../../contexts/GroupMemberContext";
import { getProfile } from "../../lib/profile";
import { calcDday } from "../../utils/date";
import Modal from "../common/modal/Modal";
import MeetingHeader from "../common/prevgroup/MeetingHeader";
import MeetingTabs from "../common/prevgroup/MeetingTabs";
import CreateGroupNavigation from "./CreateGroupNavigation";
import type { StepTwoProps, groups } from "../../types/group"; // groups 타입 import
import type { careers } from "../../types/careerType";
import { notifyGroupRequest } from "../../lib/notificationHandlers";

type StepThreeProps = Omit<StepTwoProps, "onChange">;

function CreateGroupStepThree({ formData, onPrev, onNext }: StepThreeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createGroup } = useGroup();
  const { fetchUserCareers } = useGroupMember();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderNickName, setLeaderName] = useState("");
  const [leaderCareers, setLeaderCareers] = useState<careers[]>([]);

  // 관리자 ID 목록 (실제 DB의 관리자 user_id와 동일하게)
  const adminIds = [
    "67f710e0-6e6a-471e-af8a-1d3de89ab22d", // 유비 lynn9702@naver.com
    "b8f3e47a-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // 관리자2 user_id
    "b8f3e47a-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // 관리자3 user_id
    "b8f3e47a-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // 관리자4 user_id
  ];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // createGroup은 타입상 void이지만 실제로 데이터 리턴함.
      const newGroup = (await (createGroup(formData) as unknown)) as {
        group_id: string;
        group_title?: string;
      };

      // 관리자에게 승인요청 알림 전송
      if (newGroup?.group_id && leaderNickName) {
        for (const adminUserId of adminIds) {
          await notifyGroupRequest({
            adminUserId,
            creatorNickname: leaderNickName,
            groupId: newGroup.group_id,
            groupTitle: formData.title,
          });

          // DB insert 실패 대비: 프론트 수동 알림 트리거
          window.dispatchEvent(
            new CustomEvent("notification:new", {
              detail: {
                type: "group_request",
                title: "그룹 승인 요청",
                message: `${leaderNickName}님이 "${formData.title}" 모임 승인을 요청했습니다.`,
                targetUser: adminUserId, // 관리자에게 가는 알림
              },
            }),
          );
        }

        console.log(
          "[CreateGroupStepThree] 그룹 승인요청 알림 전송 완료 (DB+프론트)",
        );
      }

      // 완료 모달 오픈
      setOpen(true);
    } catch (error) {
      console.error("[CreateGroupStepThree] 모임 생성 오류:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const profile = await getProfile(user.id);
      if (profile?.nickname) setLeaderName(profile.nickname);
    };
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const fetchCareerData = async () => {
      if (!user) return;
      const data = await fetchUserCareers(user.id);
      setLeaderCareers(data);
    };
    fetchCareerData();
  }, [user, fetchUserCareers]);

  const dday = calcDday(formData.startDate);

  return (
    <div className="flex flex-col p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">미리보기 / 확정</h2>
      <hr className="mb-6 pb-3 border-brand" />

      <div className="space-y-8">
        <MeetingHeader
          groupId="preview-temp-id"
          title={formData.title}
          status="모집중"
          category={formData.interestMajor}
          subCategory={formData.interestSub}
          summary={formData.summary}
          dday={dday}
          duration={`${formData.startDate} ~ ${formData.endDate}`}
          participants={`0/${formData.memberCount}`}
          images={formData.images.map((file) => URL.createObjectURL(file))}
          isFavorite={false}
          mode="preview"
          onFavoriteToggle={() => {}}
          onApply={() => {}}
        />

        <MeetingTabs
          intro={formData.description}
          curriculum={formData.curriculum.map((c) => ({
            title: c.title,
            detail: c.detail,
            files: c.files ? c.files.map((f) => URL.createObjectURL(f)) : [],
          }))}
          leader={{
            nickName: leaderNickName || "닉네임 정보 없음",
            location: formData.group_region || "활동 지역 무관",
            career:
              leaderCareers.length > 0
                ? leaderCareers.map((career) => ({
                    company_name: career.company_name,
                    start_date: career.start_date,
                    end_date: career.end_date,
                    career_image_url: career.career_image_url,
                  }))
                : [],
          }}
        />
      </div>

      <div className="flex justify-end">
        <CreateGroupNavigation
          step={3}
          totalSteps={3}
          onPrev={onPrev!}
          onNext={onNext!}
          onSubmit={handleSubmit}
          disableNext={submitting}
        />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="🎉 모임 생성 신청이 완료 되었습니다!"
        message="관리자 승인 후 모임 리스트에 표시됩니다."
        actions={[
          {
            label: "모임 리스트로 이동",
            onClick: () => navigate("/grouplist"),
            variant: "primary",
          },
        ]}
      />
    </div>
  );
}

export default CreateGroupStepThree;
