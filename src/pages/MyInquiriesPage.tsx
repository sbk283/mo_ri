import { useEffect, useState } from 'react';
import InquirySelectorEdit from '../components/InquirySelectorEdit';
import MyPageLayout from '../components/layout/MyPageLayout';
import { mockInquiries } from '../mocks/myInquiriesMock';

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
    }
  };

  // 해당 내용 찾기
  const selectedInquiry = inquiries.find(item => item.id === detailInquiries);

  // 수정 버튼
  const handleEdit = (id: number) => {
    setEditInquiry(id);
  };

  const handleSaveEdit = () => {
    if (!selectedInquiry) return;

    setInquiries(prev =>
      prev.map(item =>
        item.id === selectedInquiry.id
          ? {
              ...item,
              contentDetail: editedContent,
              maincategory: inquiryMajor,
              subcategory: inquirySub,
            }
          : item,
      ),
    );

    alert('수정이 저장되었습니다.');
    setEditInquiry(null);
  };

  const handleEditDelete = () => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      setEditInquiry(null);
    }
  };

  // 상세보기 버튼
  const handleDetail = (id: number) => {
    setDetailInquiries(id === detailInquiries ? null : id);
  };

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
          // 문의 내역 없을 때
          <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
            1:1 문의 내역이 없습니다.
          </div>
        ) : (
          // 문의 내역 있을 때
          <div className="w-[1024px] border border-gray-300 rounded-[5px] text-gray-200 font-medium">
            {/* 헤더 */}
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
                <div className="grid grid-cols-6 text-center pb-[14px] gap-[50px] items-center text-md text-gray-200 mt-[10px] font-normal">
                  <div>{item.date}</div>
                  <div className="truncate font-medium text-gray-400">{item.content}</div>
                  <div className="font-medium text-gray-400">
                    {item.maincategory}
                    {'>'}
                    {item.subcategory}
                  </div>
                  <div
                    className={`text-md ${
                      item.status === '답변완료' ? 'text-gray-400 font-semibold' : 'text-gray-200'
                    }`}
                  >
                    {item.status}
                  </div>
                  <div>{item.replyDate}</div>
                  <button
                    className={`${
                      detailInquiries === item.id
                        ? 'font-bold text-brand'
                        : 'font-normal text-gray-200'
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
      {inquiries.length > 0 ? (
        (() => {
          const inquiry = inquiries.find(i => i.id === detailInquiries);
          if (!inquiry)
            return (
              <div>
                <div className="w-[1024] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
                  1:1 문의 내역 상세보기를 눌러 확인하세요.
                </div>
              </div>
            );

          return (
            <div className="w-[1024px] border border-gray-300 rounded-[5px] p-[60px] text-gray-200 font-medium">
              <div className="flex gap-[95px] items-center mb-[16px]">
                <div className="text-gray-400 text-lg font-bold">이름</div>
                <div className="text-gray-200 text-md">{inquiry.name}</div>
              </div>

              <div className="border-b border-black opacity-30 my-[16px]" />

              <div className="flex gap-[80px] items-center mb-[16px]">
                <div className="text-gray-400 text-lg font-bold">이메일</div>
                <div className="text-gray-200 text-md">{inquiry.email}</div>
              </div>

              <div className="border-b border-black opacity-30 my-[16px]" />

              <div className="flex  mb-[16px]">
                <div className="flex gap-[60px] items-center">
                  <div className="text-gray-400 text-lg font-bold">문의 일자</div>
                  <div className="text-gray-200 text-md">{inquiry.date}</div>
                </div>
                <div className="flex gap-[60px] items-center  ml-[195px]">
                  <div className="text-gray-400 text-lg font-bold">문의 유형</div>
                  <div className="text-gray-200 text-md">
                    {` ${inquiryMajor}
                     > ${inquirySub}`}
                  </div>
                </div>
              </div>

              <div className="border-b border-black opacity-30 my-[16px]" />

              <div className="flex gap-[60px] items-start mb-[16px]">
                <div className="text-gray-400 text-lg font-bold ">문의 내용</div>
                <div
                  className="text-gray-200 text-md"
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {inquiry.contentDetail.split('.').map((sentence, index) =>
                    sentence.trim() ? (
                      <span key={index}>
                        {sentence.trim()}.
                        <br />
                      </span>
                    ) : null,
                  )}
                </div>
              </div>

              {/*  답변 완료 */}
              {inquiry.status === '답변완료' ? (
                <>
                  <div className="border-b border-black opacity-30 my-[16px]" />
                  <div className="flex gap-[60px] items-start ">
                    <div className="text-gray-400 text-lg font-bold">문의 답변</div>
                    <div
                      className="text-gray-200 text-md"
                      style={{
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {inquiry.replyContent?.split('.').map(
                        (sentence, index) =>
                          sentence.trim() && (
                            <span key={index}>
                              {sentence.trim()}.
                              <br />
                            </span>
                          ),
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(inquiry.id)}
                      className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                    >
                      문의 삭제
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-end gap-[14px] ">
                  <button
                    onClick={() => handleEdit(inquiry.id)}
                    className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
                  >
                    문의 수정
                  </button>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg "
                  >
                    문의 삭제
                  </button>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
          1:1 문의 내역 상세보기를 눌러 확인하세요.
        </div>
      )}

      {/*  문의 수정 버튼 눌렀을때 */}
      {editInquiry && (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] text-gray-200 font-medium p-[60px]">
          <div className="flex gap-[95px] items-center">
            <div className="text-gray-400 text-lg font-bold">이름</div>
            <div className="text-gray-200 text-md">{selectedInquiry?.name}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />
          <div className="flex gap-[80px] items-center">
            <div className="text-gray-400 text-lg font-bold">이메일</div>
            <div className="text-gray-200 text-md">{selectedInquiry?.email}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />
          <div className="flex">
            <div className="flex gap-[60px] items-center">
              <div className="text-gray-400 text-lg font-bold">문의 일자</div>
              <div className="text-gray-200 text-md">{selectedInquiry?.date}</div>
            </div>
            <div className="flex items-center gap-[30px] ml-[160px]">
              <div className="text-gray-400 text-lg font-bold">문의 유형</div>
              <InquirySelectorEdit
                className="w-[100px]"
                major={inquiryMajor}
                sub={inquirySub}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />
          <div className="flex gap-[60px]">
            <div className="text-gray-400 text-lg font-bold">문의 내용</div>
            <div className="flex-1 text-gray-200 text-md mb-[60px]">
              <textarea
                className="h-[150px] w-full border border-gray-300 bg-transparent rounded-[8px] text-gray-200 text-md p-[12px]"
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-[14px]">
            <button
              className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
              onClick={handleEditDelete}
            >
              수정 취소
            </button>
            <button
              className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
              onClick={handleSaveEdit}
            >
              수정 완료
            </button>
          </div>
        </div>
      )}

      {/* <div className="w-[1024] border border-gray-300 rounded-[5px] text-gray-200 font-medium p-[60px]">
        <div className=" flex gap-[95px] items-center">
          <div className="text-gray-400 text-lg font-bold">이름</div>
          <div className="text-gray-200 text-md ">홍길동</div>
        </div>
        <div className="border-b border-black opacity-30 my-[16px] " />
        <div className=" flex gap-[80px] items-center">
          <div className="text-gray-400 text-lg font-bold">이메일</div>
          <div className="text-gray-200 text-md ">z.seon.dev@gmail.com</div>
        </div>
        <div className="border-b border-black opacity-30 my-[16px] " />
        <div className=" flex">
          <div className=" flex gap-[60px] items-center">
            <div className="text-gray-400 text-lg font-bold">문의 일자</div>
            <div className="text-gray-200 text-md ">2025.09.03</div>
          </div>
          <div className=" flex items-center gap-[30px] ml-[160px]">
            <div className="text-gray-400 text-lg font-bold">문의 유형</div>
            <InquirySelectorEdit
              className="w-[100px]"
              major={inquiryMajor}
              sub={inquirySub}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="border-b border-black opacity-30 my-[16px] " />
        <div className=" flex gap-[60px]">
          <div className="text-gray-400 text-lg font-bold">문의 내용</div>
          <div className="flex-1 text-gray-200 text-md mb-[60px]">
            <textarea
              className="h-[150px] w-full border border-gray-300 bg-transparent rounded-[8px] text-gray-200 text-md p-[12px]"
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-[14px]">
          <button className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg">
            수정 취소
          </button>
          <button className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg">
            수정 완료
          </button>
        </div>
      </div> */}
    </MyPageLayout>
  );
}

export default MyInquiriesPage;
