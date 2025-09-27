// 모임장 정보들 (추후 DB 연결 후 다시 코드 리팩토링해야함)
import type { GroupFormData } from '../../../types/group';

interface MeetingLeaderInfoProps {
  formData: GroupFormData;
}

function MeetingLeaderInfo({ formData }: MeetingLeaderInfoProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">모임장에 관한 정보</h4>
      <table className="w-full border border-[#c0c0c0] border-collapse">
        <tbody>
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 w-32 text-center align-middle text-black font-bold text-[17px]">
              이름
            </td>
            <td className="border border-[#c0c0c0] px-4 py-3 align-middle text-black font-medium text-[17px]">
              {formData.leaderName || '이름 정보 없음'}
            </td>
          </tr>
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 text-center align-middle text-black font-bold text-[17px]">
              위치
            </td>
            <td className="border border-[#c0c0c0] px-4 py-3 align-middle text-black font-medium text-[17px]">
              {formData.leaderLocation || '위치 정보 없음'}
            </td>
          </tr>
          <tr>
            <td className="border border-[#c0c0c0] bg-[#f8f8f8] px-4 py-3 text-center align-middle text-black font-bold text-[17px]">
              경력
            </td>
            <td className="border border-[#c0c0c0] px-4 py-3 align-middle text-black font-medium text-[17px]">
              {formData.leaderCareer || '경력 정보 없음'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MeetingLeaderInfo;
