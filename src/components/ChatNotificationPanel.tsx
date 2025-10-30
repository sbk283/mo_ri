import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

  // 알림 목록 로드
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

    const totalUnread = result.reduce((sum, n) => sum + (n.unread || 0), 0);
    if (onUnreadChange) onUnreadChange(totalUnread);

    setLoading(false);
  }, [userId, onUnreadChange]);

  // 패널 열릴 때 로드
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime:direct_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        payload => {
          const senderId = payload.new.sender_id as string;
          if (senderId !== userId) {
            // 비동기 함수는 따로 호출
            fetchNotifications();
          }
        },
      )
      .subscribe();

    // cleanup은 동기적으로만 작성해야 함
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { x: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const handleNavigateChat = (groupId: string, chatId: string): void => {
    navigate(`/chat/${groupId}/${chatId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white shadow-2xl z-50 p-5 overflow-y-auto"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mt-1 mb-7">
              <h2 className="text-2xl font-semibold text-brand">알림</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-[60vh]">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-6">
                {/* 그룹 생성 승인 알림 */}
                <section className="border-b border-gray-300 pb-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">그룹 생성 알림</h3>
                  <p className="text-sm text-gray-700">
                    그룹 <span className="font-medium text-brand">SSGSAG 모임</span> 생성 신청이
                    승인되었습니다.
                  </p>
                </section>

                {/* 채팅 알림 목록 */}
                <section className="border-b border-gray-300 pb-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">채팅</h3>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">새로운 채팅 알림이 없습니다.</p>
                  ) : (
                    <ul className="space-y-3">
                      {notifications.map(n => (
                        <li
                          key={n.chat_id}
                          onClick={() => handleNavigateChat(n.group_id, n.chat_id)}
                          className="flex items-start justify-between border-b border-gray-200 pb-3 cursor-pointer hover:bg-gray-100 transition"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">{n.group_title}</p>
                            <p className="text-sm text-gray-600 truncate max-w-[240px]">
                              {n.last_message || '메시지가 없습니다.'}
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
                </section>

                {/* 문의 답변 완료 알림 */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">문의내역 알림</h3>
                  <p className="text-sm text-gray-700">작성하신 문의의 답변이 완료되었습니다.</p>
                </section>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatNotificationPanel;
