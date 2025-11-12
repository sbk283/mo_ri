import { useState } from "react";
import SignUpBanner from "../components/layout/signup/SignUpBanner";
import GoogleLoginButton from "../components/login/GoogleLoginButton";
import KakaoLoginButton from "../components/login/KakaoLoginButton";
import { supabase } from "../lib/supabase";

export type FieldData = {
  name: (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: any[];
};

function LoginPage() {
  const [msg, setMsg] = useState<string>("");

  const checkUserStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 프로필 조회
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("is_active")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      // 탈퇴한 계정이면 로그아웃
      if (!profile.is_active) {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("사용자 상태 확인 오류:", error);
    }
  };

  const handleLoginSuccess = async (message: string) => {
    setMsg(message);
    await checkUserStatus();
  };

  return (
    <div>
      {/* 박스 */}
      <div className="mt-[140px] mb-[100px]">
        <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
          {/* 왼쪽 */}
          <SignUpBanner />
          {/* 오른쪽 */}
          <div className="w-[50%] y-full py-[160px] px-[107px]">
            <div className="pr-4">
              <div className="flex justify-center items-center mb-10 gap-4">
                <div className="w-[135px] h-[60px]">
                  <img
                    className="w-full h-full"
                    src="/images/mori_logo.svg"
                    alt="Mo:ri"
                  />
                </div>
                <div className="text-lg ml-5">
                  <p>mo:ri 에 오신 걸 환영합니다.</p>
                  <p className="font-bold text-nowrap">
                    로그인 후 더 많은 모임을 만나보세요!
                  </p>
                </div>
              </div>
              <div className="border-t py-12 flex flex-col gap-7">
                <KakaoLoginButton
                  onSuccess={handleLoginSuccess}
                  onError={(error) => setMsg(`카카오 로그인 오류 : ${error}`)}
                />
                <GoogleLoginButton
                  onError={(error) => setMsg(`구글 로그인 오류 : ${error}`)}
                  onSuccess={handleLoginSuccess}
                />
              </div>
              {msg && (
                <p
                  style={{
                    marginTop: "5px",
                    padding: "8px",
                    backgroundColor: msg.includes("성공")
                      ? "var(--success-50)"
                      : "#fef2f2",
                    color: msg.includes("성공") ? "#000" : "#dc2626",
                  }}
                >
                  {msg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
