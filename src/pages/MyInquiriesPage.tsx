import { useEffect, useState } from 'react';
import InquirySelectorEdit from '../components/InquirySelectorEdit';
import MyPageLayout from '../components/layout/MyPageLayout';
import { mockInquiries } from '../mocks/myInquiriesMock';
import ConfirmModal from '../components/common/modal/ConfirmModal';

// 1:1 문의 내역 페이지 입니다.
function MyInquiriesPage() {
  // 상태
  const [inquiries, setInquiries] = useState(mockInquiries);
  // 상세보기
  const [detailInquiries, setDetailInquiries] = useState<number | null>(null);

  // 수정하기
  const [editInquiry, setEditInquiry] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // 문의 유형
  const [inquiryMajor, setInquiryMajor] = useState('');
  const [inquirySub, setInquirySub] = useState('');

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'save' | 'cancel' | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  // 문의 유형 선택
  const handleChange = (field: 'inquiryMajor' | 'inquirySub', value: string) => {
    if (field === 'inquiryMajor') setInquiryMajor(value);
    if (field === 'inquirySub') setInquirySub(value);
  };

  // 삭제하기
  const handleDelete = (id: number) => {
    if (window.confirm('정말로 이 문의를 삭제하시겠습니까?')) {
      setInquiries(prev => prev.filter(item => item.id !== id));
      setDetailInquiries(null);
      // if (editInquiry === id) setEditInquiry(null);
    }
  };

  // 해당 내용 찾기
  const selectedInquiry = inquiries.find(item => item.id === detailInquiries);

  // 모달 오픈 함수.
  const openModal = (type: 'delete' | 'save' | 'cancel', id?: number) => {
    setModalType(type);
    setTargetId(id || null);
    setModalOpen(true);
  };
  // 모달 확인 시 실행
  const handleConfirm = () => {
    if (modalType === 'delete' && targetId) {
      setInquiries(prev => prev.filter(item => item.id !== targetId));
      setDetailInquiries(null);
    }

    if (modalType === 'save' && selectedInquiry) {
      setInquiries(prev =>
        prev.map(item =>
          item.id === selectedInquiry.id
            ? {
                ...item,
                contentDetail: editedContent,
                content: editedContent,
                maincategory: inquiryMajor,
                subcategory: inquirySub,
              }
            : item,
        ),
      );
      setEditInquiry(null);
    }

    if (modalType === 'cancel') {
      setEditInquiry(null);
      if (selectedInquiry) {
        setEditedContent(selectedInquiry.contentDetail);
        setInquiryMajor(selectedInquiry.maincategory);
        setInquirySub(selectedInquiry.subcategory);
      }
    }

    setModalOpen(false);
  };
  // 수정 버튼
  const handleEdit = (id: number) => {
    setEditInquiry(id);
  };
  // 수정저장
  const handleSaveEdit = () => {
    if (!selectedInquiry) return;

    setInquiries(prev =>
      prev.map(item =>
        item.id === selectedInquiry.id
          ? {
              ...item,
              contentDetail: editedContent,
              content: editedContent,
              maincategory: inquiryMajor,
              subcategory: inquirySub,
            }
          : item,
      ),
    );

    alert('수정이 저장되었습니다.');
    setEditInquiry(null);
  };

  // 수정 취소
  const handleEditCancel = () => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      setEditInquiry(null);
      // 기존 상세보기 내용으로 복원
      if (selectedInquiry) {
        setEditedContent(selectedInquiry.contentDetail);
        setInquiryMajor(selectedInquiry.maincategory);
        setInquirySub(selectedInquiry.subcategory);
      }
    }
  };

  // 상세보기 버튼
  const handleDetail = (id: number) => {
    setDetailInquiries(id === detailInquiries ? null : id);
  };

  // 기존 버튼 클릭을 모달로 변경
  const handleDeleteClick = (id: number) => openModal('delete', id);
  const handleSaveClick = () => openModal('save');
  const handleCancelClick = () => openModal('cancel');

  // 선택된 문의 변경 시 초기값 설정
  useEffect(() => {
    if (selectedInquiry) {
      setEditedContent(selectedInquiry.contentDetail);
      setInquiryMajor(selectedInquiry.maincategory || '');
      setInquirySub(selectedInquiry.subcategory || '');
    } else {
      setEditedContent('');
      setInquiryMajor('');
      setInquirySub('');
    }
  }, [selectedInquiry]);

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} 1:1 문의 내역
        </div>
      </div>
      <div className="flex gap-[12px] mb-[56px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">내가 보낸 1:1 문의 내역을 확인할 수 있어요.</div>
          <div className="text-md">
            답변 상태를 확인하고, 필요한 경우 추가 문의도 이어서 진행해 보세요.
          </div>
        </div>
      </div>
      {/* 하단 영역 부분  내용 없을때.*/}
      <div className="mb-[77px]">
        <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역</div>
        {inquiries.length === 0 ? (
          <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
            1:1 문의 내역이 없습니다.
          </div>
        ) : (
          <div className="w-[1024px] border border-gray-300 rounded-[5px] text-gray-200 font-medium">
            <div className="grid grid-cols-6 text-center pt-[14px] gap-[50px] text-lg font-semibold text-gray-400">
              <div>문의 일자</div>
              <div>문의 내용</div>
              <div>문의 유형</div>
              <div>상태</div>
              <div>답변일자</div>
              <div>상세보기</div>
            </div>
            <div className="border-b border-black opacity-30 my-[10px] m-[10px]" />

            {/* 문의 항목 */}
            {inquiries.map((item, index) => (
              <div key={item.id}>
                <div className="grid grid-cols-6 text-center pb-[14px] gap-[40px] items-center text-md text-gray-200 mt-[10px] font-normal">
                  <div className="font-medium">{item.date}</div>
                  <div className="truncate font-medium text-gray-400">{item.contentDetail}</div>
                  <div className="font-medium text-gray-400 text-sm">
                    <b>{item.maincategory}</b>
                    <br />
                    <span className=" text-gray-200">{item.subcategory}</span>
                  </div>
                  <div
                    className={`text-md ${
                      item.status === '답변완료'
                        ? 'text-gray-400 font-semibold'
                        : 'text-gray-200 font-medium'
                    }`}
                  >
                    {item.status}
                  </div>
                  <div className="font-medium">{item.replyDate}</div>
                  <button
                    className={`${
                      detailInquiries === item.id
                        ? 'font-bold text-brand'
                        : 'font-medium text-gray-200'
                    }`}
                    onClick={() => handleDetail(item.id)}
                  >
                    [상세보기]
                  </button>
                </div>

                {index !== inquiries.length - 1 && (
                  <div className="border-b border-black opacity-30 ml-[10px] mr-[10px]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세보기 */}
      <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역 상세보기</div>
      {selectedInquiry ? (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] p-[60px] text-gray-200 font-medium">
          {/* 이름 */}
          <div className="flex gap-[95px] items-center mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">이름</div>
            <div className="text-gray-200 text-md">{selectedInquiry.name}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 이메일 */}
          <div className="flex gap-[80px] items-center mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">이메일</div>
            <div className="text-gray-200 text-md">{selectedInquiry.email}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 문의 일자 / 유형 */}
          <div className="flex mb-[16px]">
            <div className="flex gap-[60px] items-center">
              <div className="text-gray-400 text-lg font-bold">문의 일자</div>
              <div className="text-gray-200 text-md">{selectedInquiry.date}</div>
            </div>
            <div className="flex items-center gap-[30px] ml-[160px]">
              <div className="text-gray-400 text-lg font-bold">문의 유형</div>
              {editInquiry === selectedInquiry.id ? (
                <InquirySelectorEdit
                  className="w-[100px]"
                  major={inquiryMajor}
                  sub={inquirySub}
                  onChange={handleChange}
                />
              ) : (
                <div className="text-gray-200 text-md">
                  {selectedInquiry.maincategory} {'>'} {selectedInquiry.subcategory}
                </div>
              )}
            </div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 문의 내용 */}
          <div className="flex gap-[60px] items-start mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">문의 내용</div>
            <div
              className="text-gray-200 text-md flex-1"
              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            >
              {editInquiry === selectedInquiry.id ? (
                <textarea
                  className="h-[150px] w-full border border-gray-300 bg-transparent rounded-[8px] text-gray-200 text-md p-[12px]"
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                />
              ) : (
                selectedInquiry.contentDetail.split('.').map((sentence, index) =>
                  sentence.trim() ? (
                    <span key={index}>
                      {sentence.trim()}.<br />
                    </span>
                  ) : null,
                )
              )}
            </div>
          </div>

          {/* 답변 완료 또는 수정/삭제 버튼 */}
          {selectedInquiry.status === '답변완료' ? (
            <>
              <div className="border-b border-black opacity-30 my-[16px]" />
              <div className="flex gap-[60px] items-start ">
                <div className="text-gray-400 text-lg font-bold">문의 답변</div>
                <div
                  className="text-gray-200 text-md"
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {selectedInquiry.replyContent?.split('.').map(
                    (sentence, index) =>
                      sentence.trim() && (
                        <span key={index}>
                          {sentence.trim()}.<br />
                        </span>
                      ),
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-[16px]">
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                >
                  문의 삭제
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end gap-[14px]">
              {editInquiry === selectedInquiry.id ? (
                <>
                  <div className="flex justify-end gap-[14px]">
                    <button
                      className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
                      onClick={handleCancelClick}
                    >
                      수정 취소
                    </button>
                    <button
                      className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                      onClick={handleSaveClick}
                    >
                      수정 완료
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(selectedInquiry.id)}
                    className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
                  >
                    문의 수정
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedInquiry.id)}
                    className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                  >
                    문의 삭제
                  </button>
                </>
              )}
              <ConfirmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                title={
                  modalType === 'delete'
                    ? '문의 내역을 삭제하시겠습니까?'
                    : modalType === 'save'
                      ? '수정 내용을 저장하시겠습니까?'
                      : '수정을 취소하시겠습니까?'
                }
                message={
                  modalType === 'delete'
                    ? '삭제 후에는 복구할 수 없습니다.\n정말 삭제하시겠습니까?'
                    : modalType === 'save'
                      ? '수정된 내용으로 저장됩니다.\n계속 진행하시겠습니까?'
                      : '변경된 내용이 사라집니다.\n정말 취소하시겠습니까?'
                }
                confirmText="확인"
                cancelText="취소"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
          1:1 문의 내역 상세보기를 눌러 확인하세요.
        </div>
      )}
    </MyPageLayout>
  );
}

export default MyInquiriesPage;
