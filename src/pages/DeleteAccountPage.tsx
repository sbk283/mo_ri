// 회원탈퇴 페이지

import { Checkbox } from "antd";
import DeleteAccountselector from "../components/DeleteAccountselector";
import MyPageLayout from "../components/layout/MyPageLayout";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SuccessModal from "../components/common/modal/SuccessModal";

function DeleteAccountPage() {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");

      // 탈퇴테이블 저장 추가
      const ipAddr = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => null);
      const logKey = `${user.id}-${Date.now()}`;
      const { error: logError } = await supabase
        .from("user_delete_logs")
        .insert({
          user_id: user.id,
          delete_reason: reason,
          delete_feedback: feedback,
          ip_addr: ipAddr,
          user_agent: navigator.userAgent,
          log_key: logKey,
        });
      if (logError) throw logError;

      // is_active를 false로 변경
      const { error } = await supabase
        .from("user_profiles")
        .update({
          is_active: false,
        })
        .eq("user_id", user.id);
      if (error) throw error;

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("회원 탈퇴 중 오류:", error);
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const handleSuccessClose = async () => {
    setSuccessModalOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (successModalOpen) {
      const timer = setTimeout(() => {
        handleSuccessClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModalOpen]);

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {">"} 설정 {">"} 회원 탈퇴
        </div>
      </div>
      <div className="flex gap-[12px] mb-[45px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">회원 탈퇴</div>
          <div className="text-md">
            탈퇴 시 회원님의 모든 정보와 이용 내역이 삭제 되며, 복구가 불가능
            합니다.
          </div>
        </div>
      </div>

      {/* 하단 영역 */}
      <div className=" text-brand font-semibold mb-[21px] text-xl">
        주의사항을 꼭 확인해 주세요.
      </div>
      <div className="border border-gray-300 rounded-[5px] py-[57px] px-[107px] mb-[66px]">
        <b>탈퇴 후 복구 불가</b>
        <div className="mt-[10px] mb-[25px]">
          <p>
            · 회원탈퇴가 완료되면 개인정보 및 계정 정보는 즉시 삭제되어 복구할
            수 없습니다.
          </p>
          <p>
            · 탈퇴한 후에는 기존 계정으로 재가입이 제한될 수 있으니 신중하게
            결정해야 합니다.
          </p>
        </div>
        <b>혜택·포인트 소멸</b>
        <div className="mt-[10px] mb-[25px]">
          <p>
            · 탈퇴 시 적립된 포인트, 혜택, 쿠폰 등은 모두 소멸되며 복구되지
            않습니다.
          </p>
          <p>
            · 탈퇴 이후 남은 혜택이나 이벤트 참여 기록은 자동으로 무효 처리될 수
            있습니다.
          </p>
        </div>
        <b>개인정보 처리 및 보관</b>
        <div className="mt-[10px] mb-[25px]">
          <p>
            · 개인정보는 즉시 파기되거나, 관련 법령에 따라 일정 기간 보관 후
            완전히 삭제됩니다.
          </p>
          <p>
            · 부정 이용 방지나 법적 분쟁 대응 목적으로 일부 정보가 임시로 보관될
            수 있으며, 이 기간이 지나면 영구 삭제됩니다.
          </p>
        </div>
        <b>계정 연동 및 서비스 해지</b>
        <div className="mt-[10px] mb-[25px]">
          <p>
            · 탈퇴 시 웹사이트 내의 모든 모임 활동(참여 이력, 게시물 등)이
            삭제될 수 있습니다.
          </p>
          <p>
            · 연계된 외부 서비스(제휴사, SNS 등)나 본인의 다른 계정에 영향이
            있을 수 있으니 사전에 확인해야 합니다.
          </p>
        </div>
        <b>이용 중인 서비스 점검</b>
        <div className="mt-[10px] mb-[25px]">
          <p>
            · 미완료 주문, 예약, 반품 등 진행 중인 서비스가 있는 경우 완료 또는
            환불 이후 탈퇴가 처리될 수 있습니다.
          </p>
          <p>
            · 휴면 계정 전환, 별도 인증 등 추가 절차가 필요한 경우 안내에 따라
            진행해야 합니다.
          </p>
        </div>
      </div>
      <div className=" text-brand font-semibold mb-[21px] text-xl">
        설문조사
      </div>
      <div className="border border-gray-300 rounded-[5px] py-[57px] px-[107px] mb-[24px]">
        <div className="mb-[13px] text-lg font-bold text-gray-400">
          탈퇴 사유를 선택해주세요. <span className="text-red-500">*</span>{" "}
        </div>
        <DeleteAccountselector reasons={reason} onChange={setReason} />

        <div className="mb-[13px] mt-[19px] text-lg font-bold text-gray-400">
          탈퇴하고 싶은 사유나 건의사항을 적어주세요.
          <span className="text-[#8c8c8c] font-normal text-[13px] pl-[10px]">
            (선택사항)
          </span>
        </div>
        <textarea
          className="w-full border border-gray-300 rounded-[5px] h-[166px] p-3"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <Checkbox
        className="mb-[43px]"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
      >
        위의 내용, 회원 탈퇴 시 주의사항을 모두 확인했습니다.
      </Checkbox>
      <div className="flex gap-[27px] justify-center">
        <button
          onClick={handleDeleteAccount}
          disabled={!agreed || !reason}
          className={`py-[8px] px-[65px] rounded-[5px] text-xl ${
            !agreed || !reason
              ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-300"
              : "text-brand border border-brand bg-white hover:bg-brand hover:text-white"
          }`}
        >
          회원탈퇴
        </button>
      </div>

      <SuccessModal
        isOpen={successModalOpen}
        onClose={handleSuccessClose}
        type="success"
      />
    </MyPageLayout>
  );
}

export default DeleteAccountPage;
