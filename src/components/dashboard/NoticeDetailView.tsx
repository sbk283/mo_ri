// src/components/dashboard/NoticeDetailView.tsx
import React, { useState } from "react";
import ConfirmModal from "../common/modal/ConfirmModal";

type NoticeDetailData = {
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  views?: number;
};

export type NoticeDetailViewProps = {
  notice: NoticeDetailData;
  isHost: boolean;
  boardType?: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function NoticeDetailView({
  notice,
  isHost,
  boardType = "notice",
  onBack,
  onEdit,
  onDelete,
}: NoticeDetailViewProps) {
  const [openConfirm, setOpenConfirm] = useState(false);

  const isHtml =
    typeof notice.content === "string" && notice.content.trim().startsWith("<");

  return (
    <>
      <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[450px]">
        <header className="px-8 pt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800 leading-none mb-3">
              {notice.title}
            </h1>
            {!isHost && (
              <span
                className={`w-[50px] py-1 rounded-full font-semibold text-white text-sm flex items-center justify-center leading-4 ${
                  notice.isRead ? "bg-[#C4C4C4]" : "bg-[#FF5252]"
                }`}
              >
                {notice.isRead ? "읽음" : "안읽음"}
              </span>
            )}
          </div>

          <div className="flex items-center text-[#8C8C8C] text-md gap-3">
            <span>{notice.date}</span>
            <span>조회수 {notice.views ?? 0}</span>
          </div>
        </header>

        <div className="text-center">
          <div className="inline-block border-b border-[#A3A3A3] w-[910px]" />
        </div>

        <section className="px-8 py-8 text-gray-800 leading-relaxed">
          {isHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: notice.content || "" }}
              className="prose max-w-none ql-editor"
              style={{ padding: 0 }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {notice.content}
            </div>
          )}
        </section>
      </article>

      <footer className="pt-6 flex text-left justify-start">
        <button onClick={onBack} className="text-[#8C8C8C] py-2 text-md">
          &lt; 목록으로
        </button>

        {(boardType !== "notice" || isHost) && (
          <div className="ml-auto flex py-2">
            <button
              className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-brand border border-brand rounded-sm"
              onClick={() => setOpenConfirm(true)}
            >
              삭제
            </button>
            <button
              className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-brand border border-brand rounded-sm"
              onClick={onEdit}
            >
              수정
            </button>
          </div>
        )}
      </footer>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={openConfirm}
        title="정말 삭제하시겠습니까?"
        message={"삭제 후 되돌릴 수 없습니다.\n이 게시글을 삭제하시겠습니까?"}
        confirmText="삭제"
        cancelText="취소"
        onConfirm={() => {
          setOpenConfirm(false);
          onDelete();
        }}
        onClose={() => setOpenConfirm(false)}
        preventBackdropClose={false}
      />
    </>
  );
}
