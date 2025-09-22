function SignUpEmail() {
  return (
    <div className=" y-full py-[40px] px-[107px]">
      <div className="flex items-center gap-4 mb-[180px]">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-brand font-bold text-lg">01_ 기본 정보 작성</span>
          <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
          <span className=" font-bold text-lg text-gray-600">02_ 관심사 선택</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold mb-5 text-gray-600 ">
          작성하신 이메일로 인증 메일이 발송 되었습니다.
        </p>
        <p className="text-xl font-bold">
          받으신 메일함을 확인하여 <span className="text-brand">인증 버튼을 클릭</span>해 주세요.
        </p>
      </div>
    </div>
  );
}

export default SignUpEmail;
