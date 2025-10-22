interface MeetingLeaderInfoProps {
  leaderName: string;
  leaderLocation?: string;
  leaderCareer?: string;
}

function MeetingLeaderInfo({ leaderName, leaderLocation, leaderCareer }: MeetingLeaderInfoProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">모임장에 관한 정보</h4>
      <table className="w-full border border-[#c0c0c0] border-collapse">
        <tbody>
          {/* 이름 */}
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 w-32 text-center font-bold text-[17px]">
              이름
            </td>
            <td className="border border-[#c0c0c0] px-4 py-3 text-[17px]">
              {leaderName || '이름 정보 없음'}
            </td>
          </tr>

          {/* 위치 */}
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 text-center font-bold text-[17px]">
              위치
            </td>
            <td className="border border-[#c0c0c0] px-4 py-3 text-[17px]">
              {leaderLocation || '위치 정보 없음'}
            </td>
          </tr>

          {/* 경력 */}
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 text-center font-bold text-[17px]">
              경력
            </td>
            <td
              className="border border-[#c0c0c0] px-4 py-3 text-[17px] leading-relaxed whitespace-pre-line"
            >
              {leaderCareer || '경력 정보 없음'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MeetingLeaderInfo;
