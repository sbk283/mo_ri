function SignUpBanner() {
  return (
    <div className="w-[50%] y-full">
      <div className="my-[150px]">
        <img className="mx-auto mb-[42px] " src="/loginimage.svg" alt="로그인" />
        <div className="flex justify-center items-center">
          <img src="/images/footerLogo.svg" alt="Mo:ri" />
          <div className="ml-6">
            <p className="text-sm font-bold text-gray-600">
              다양한 관심사를 바탕으로 한 자기계발 모임 플랫폼.
            </p>
            <p className="text-sm font-bold text-gray-600">
              참여와 기록을 통해 성장과 커리어를 이어갑니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpBanner;
