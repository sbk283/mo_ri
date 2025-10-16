// 참여한 모임들 이력 (생성모임, 참여모임 포함.)

import { forwardRef, useImperativeHandle, useState } from 'react';
import { userCareers, type userCareersType } from '../../mocks/userCareers';
import { Link } from 'react-router-dom';

interface ParticipationHistoryProps {
  onCheckChange: (count: number) => void;
}

//전체 선택을 위한 forwardRef 사용
const ParticipationHistory = forwardRef<{ selectAll: () => void }, ParticipationHistoryProps>(
  ({ onCheckChange }, ref) => {
    const [careerItems, setCareerItems] = useState<userCareersType[]>(userCareers);

    // 체크박스 토글 함수
    const handleCheckboxToggle = (id: number) => {
      setCareerItems(prev => {
        const updated = prev.map(item =>
          item.id === id ? { ...item, isChecked: !item.isChecked } : item,
        );

        // ✅ 체크된 개수를 부모에게 전달
        const checkedCount = updated.filter(item => item.isChecked).length;
        onCheckChange(checkedCount);
        return updated;
      });
    };

    //  전체 선택 함수
    const selectAll = () => {
      setCareerItems(prev => {
        const allChecked = prev.every(item => item.isChecked);
        const updated = prev.map(item => ({ ...item, isChecked: !allChecked }));
        const checkedCount = updated.filter(item => item.isChecked).length;
        onCheckChange(checkedCount);
        return updated;
      });
    };

    // 부모에서 ref.current.selectAll() 호출 가능하게 연결
    useImperativeHandle(ref, () => ({
      selectAll,
    }));

    if (careerItems.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400 font-bold">참여한 모임이 없습니다.</div>
      );
    }

    return (
      <div>
        {/* 메뉴 클릭시 변경되는 부분 추후 데이터베이스 연동 해야함 */}
        {careerItems.map(career => (
          <div
            key={career.id}
            className="flex border-[1px] border-gray-300 rounded-[5px] py-[23px] px-[26px] items-center mb-[10px]"
          >
            {/* 체크박스 영역 */}
            <button
              onClick={() => handleCheckboxToggle(career.id)}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors duration-200
                  ${career.isChecked ? 'bg-[#0689E8]' : 'bg-white border-[2px] border-brand'}`}
            >
              {career.isChecked && <span className="text-white text-sm">✔</span>}
            </button>

            {/* 이름 영역 */}
            <div className="ml-[24px]">
              <div className="font-bold text-xl text-gray-400">{career.title}</div>
              <div className="text-sm text-[#777777] font-bold">
                모임 기간 : {career.period.start}~{career.period.end}
              </div>
            </div>

            {/* 아이콘 영역 */}
            <div className="flex gap-[9px] ml-[30px] items-center">
              <div className="text-brand text-md font-semibold border border-brand py-[3px] px-[11px] rounded-[5px]">
                {career.category}
              </div>
              <div
                className={`text-white text-md font-semibold py-[3px] px-[11px] rounded-[5px] ${
                  career.status === '진행중' ? 'bg-brand-orange' : 'bg-brand-red'
                }`}
              >
                {career.status}
              </div>
              <div className="flex items-center justify-center">
                {career.created_by ? (
                  <div className=" bg-brand py-[8px] px-[8px] rounded-2xl">
                    <img src="/images/group_crown.svg" alt="생성자" className="w-4" />
                  </div>
                ) : null}
              </div>
            </div>

            {/* 공백 */}
            <div className="flex-grow" />

            {/* 상세보기 영역 */}
            <Link
              to={career.detailLink}
              className="text-lg font-medium text-gray-200 hover:text-brand"
            >
              상세보기
            </Link>
          </div>
        ))}
      </div>
    );
  },
);

export default ParticipationHistory;
