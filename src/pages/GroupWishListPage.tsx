import GroupManagerLayout from '../components/layout/GroupManagerLayout';

// 찜리스트 페이지
function GroupWishListPage() {
  return (
    <GroupManagerLayout>
      {' '}
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">피그마 보시고 수정해주세요~</div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">피그마 보시구 수정해주세여~</div>
          <div className="text-md">피그마 보시구 수정해주세여~</div>
        </div>
      </div>
    </GroupManagerLayout>
  );
}

export default GroupWishListPage;
