// ? 아이콘 재사용함
import { Tooltip } from 'antd';

function CreateGroupExample() {
  return (
    <div className="space-y-4">
      {/* 복잡한 JSX 툴팁 */}
      <Tooltip
        title={
          <ul className="whitespace-nowrap list-disc list-inside space-y-1">
            <li>모임 소개를 작성해 주세요.</li>
            <li>하단 예시</li>
            <br />
            <li>난이도: 입문 / 초급 / 중급 / 고급</li>
            <li>참가 대상: 누구나, 성인만, 특정 연령대</li>
            <li>참여 비용: 무료/유료</li>
            <li>모임 목적: 목표나 기대 효과</li>
            <li>진행 방식: 온라인/오프라인 여부</li>
            <li>필요 준비물: 선택 등</li>
          </ul>
        }
        placement="right"
      >
        <span className="cursor-pointer rounded-full text-white text-sm font-bold">
          <img src="/images/tooltip_dark.svg" alt="물음표툴팁아이콘" />
        </span>
      </Tooltip>
    </div>
  );
}

export default CreateGroupExample;
