import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ChatNotification {
  chat_id: string;
  group_id: string;
  group_title: string;
  last_message: string | null;
  unread: number;
}

interface ChatNotificationPanelProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onUnreadChange?: (count: number) => void;
}

const ChatNotificationPanel: React.FC<ChatNotificationPanelProps> = ({
  open,
  onClose,
  userId,
  onUnreadChange,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // RPC를 통해 현재 알림 목록을 가져옴
  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!userId) return;
    setLoading(true);

    const { data, error }: PostgrestSingleResponse<ChatNotification[]> = await supabase.rpc(
      'get_chat_notifications',
      { p_user_id: userId },
    );

    if (error) {
      console.error('알림 불러오기 실패:', error.message);
      setLoading(false);
      return;
    }

    const result = data ?? [];
    setNotifications(result);

    // unread 합계 계산 후 부모(Header)에 전달
    const totalUnread = result.reduce((sum, n) => sum + (n.unread || 0), 0);
    if (onUnreadChange) onUnreadChange(totalUnread);

    setLoading(false);
  }, [userId, onUnreadChange]);

  // 패널이 열릴 때 데이터 로드
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // 새 메시지 수신 시 자동 갱신 (Supabase Realtime 적용)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime:direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        async payload => {
          const senderId = payload.new.sender_id as string;
          // 본인이 보낸 메시지는 제외
          if (senderId !== userId) {
            await fetchNotifications();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  // 애니메이션 설정
  const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { x: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
  };

  // 채팅방으로 이동하는 함수
  const handleNavigateChat = (groupId: string, chatId: string): void => {
    navigate(`/chat/${groupId}/${chatId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 반투명 배경 */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 오른쪽 패널 */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white shadow-2xl z-50 p-5 overflow-y-auto"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center mt-1 mb-7">
              <h2 className="text-xl font-semibold text-brand">채팅 알림</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 알림 목록 */}
            {loading ? (
              <p className="text-sm text-gray-400">불러오는 중...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">새로운 알림이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n: ChatNotification) => (
                  <li
                    key={n.chat_id}
                    onClick={() => handleNavigateChat(n.group_id, n.chat_id)}
                    className="flex items-start justify-between border-b border-[#a3a3a3] pb-3 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{n.group_title}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[240px]">
                        {n.last_message || '메시지가 없습니다'}
                      </p>
                    </div>
                    {n.unread > 0 && (
                      <span className="bg-brand-red text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {n.unread}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatNotificationPanel;
