// 마이페이지 설정 > 회운정보관리 비밀번호 확인 영역

function PasswordCheck() {
  return (
    <div className="border border-gray-300 rounded-[5px] py-[117px]  justify-center flex items-center">
      <div className="text-xl font-semibold text-gray-400">현재 비밀번호</div>
      <input
        type="password"
        className="border border-gray-300 rounded-[5px] ml-[28px] p-2 w-[350px] placeholder:text-gray-200"
        placeholder="현재 비밀번호를 입력하세요."
      />
      <button className="ml-[17px] bg-brand py-[11px] px-[27px] text-white text-md font-bold rounded-[5px]">
        확인
      </button>
    </div>
  );
}

export default PasswordCheck;
