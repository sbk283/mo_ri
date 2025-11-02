import { motion, AnimatePresence, type Variants, Transition } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiMessageSquare, FiCheckCircle, FiInfo, FiHeart, FiStar, FiTrash2 } from 'react-icons/fi';

interface Notification {
  type: string;
  title: string | null;
  message: string | null;
  group_id: string | null;
  target_id: string | null;
  sender_nickname: string | null;
  last_message: string | null;
  unread: number | null;
  created_at: string | null;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 🔹 알림 불러오기
  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!userId) return;
    setLoading(true);

    const { data, error }: PostgrestSingleResponse<Notification[]> = await supabase.rpc(
      'get_all_notifications',
      { p_user_id: userId },
    );

    if (error) {
      console.error('알림 불러오기 실패:', error.message);
      setLoading(false);
      return;
    }

    const result = data ?? [];
    setNotifications(result);

    // 전체 unread 합산
    const totalUnread = result.reduce((sum, n) => sum + (n.unread || 0), 0);
    if (onUnreadChange) onUnreadChange(totalUnread);

    setLoading(false);
  }, [userId, onUnreadChange]);

  // 패널 열릴 때마다 갱신
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // 🔹 실시간 감시
  useEffect(() => {
    if (!userId) return;

    const chatChannel = supabase
      .channel('realtime:direct_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        payload => {
          const senderId = payload.new.sender_id as string;
          if (senderId !== userId) fetchNotifications();
        },
      )
      .subscribe();

    const notifyChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await fetchNotifications();

          // 🔹 최신 unreadCount를 Header로 전달
          if (onUnreadChange) {
            const { count, error } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('is_read', false);

            if (!error && count !== null) {
              onUnreadChange(count);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(notifyChannel);
    };
  }, [userId, fetchNotifications]);

  // 알림 클릭 시 이동
  const handleNavigate = (n: Notification): void => {
    switch (n.type) {
      case 'chat':
        if (n.group_id && n.target_id) navigate(`/chat/${n.group_id}/${n.target_id}`);
        break;
      case 'review_like':
      case 'review':
        navigate('/reviews');
        break;
      case 'post_like':
      case 'favorite':
        navigate('/grouplist');
        break;
      case 'group_approved':
        navigate('/groupmanager');
        break;
      case 'inquiry_reply':
        navigate('/inquiry/history');
        break;
    }
    onClose();
  };

  // Motion variants
  const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { x: '100%', transition: { duration: 0.35, ease: 'easeInOut' } },
  };

  const cardExitMotion = {
    x: 150,
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' as Transition['ease'] },
  };

  // 전체 삭제
  const handleClearAll = () => {
    setNotifications([]);
    if (onUnreadChange) onUnreadChange(0);
  };

  const handlePanelClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-20"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 p-6 overflow-y-auto rounded-l-sm"
            onClick={handlePanelClick}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-8 border-b border-gray-300 pb-3">
              <h2 className="text-2xl font-bold text-brand">알림</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand transition"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <p className="font-medium">전체삭제</p>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-[60vh]">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <AnimatePresence>
                  {notifications.map(n => (
                    <motion.div
                      key={`${n.type}-${n.created_at}-${n.target_id}`}
                      layout
                      exit={cardExitMotion}
                      onClick={() => handleNavigate(n)}
                      className={`bg-white border border-gray-300 rounded-sm p-4 shadow-sm hover:shadow-md transition cursor-pointer ${
                        n.unread && n.unread > 0
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {n.type === 'chat' && <FiMessageSquare className="text-brand" />}
                        {n.type === 'group_approved' && (
                          <FiCheckCircle className="text-green-500" />
                        )}
                        {n.type === 'inquiry_reply' && <FiInfo className="text-blue-500" />}
                        {n.type === 'review_like' && <FiHeart className="text-red-500" />}
                        {n.type === 'post_like' && <FiStar className="text-yellow-500" />}
                      </div>

                      <p className="font-semibold text-gray-800 mb-1">{n.title}</p>
                      <p
                        className={`text-sm truncate max-w-[280px] ${
                          n.type === 'chat' ? 'text-gray-800 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {n.type === 'chat'
                          ? n.last_message || n.message || '내용이 없습니다.'
                          : n.message || '내용이 없습니다.'}
                      </p>

                      {n.type === 'chat' && Number(n.unread) > 0 && (
                        <span className="mt-2 inline-block bg-brand-red text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {n.unread}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatNotificationPanel;
