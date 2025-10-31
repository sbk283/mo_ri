import { motion, AnimatePresence, type Variants, Transition } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiMessageSquare, FiCheckCircle, FiInfo, FiTrash2 } from 'react-icons/fi';

interface ChatNotification {
  chat_id: string;
  group_id: string;
  group_title: string;
  sender_nickname: string | null;
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
  const [showGroupApproval, setShowGroupApproval] = useState(true);
  const [hasInquiryReply, setHasInquiryReply] = useState(false);
  const [approvedGroup, setApprovedGroup] = useState<string>('');

  // 그룹 승인 알림 (항상 있음)
  const fetchApprovedGroup = useCallback(async (): Promise<void> => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('groups')
      .select('group_title')
      .eq('created_by', userId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.group_title) setApprovedGroup(data.group_title);
  }, [userId]);

  // 문의답변 알림 확인
  const fetchInquiryReply = useCallback(async (): Promise<void> => {
    if (!userId) return;
    const { count, error } = await supabase
      .from('user_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('inquiry_status', 'answered');
    if (!error && count && count > 0) setHasInquiryReply(true);
    else setHasInquiryReply(false);
  }, [userId]);

  // 채팅 알림 불러오기
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

  useEffect(() => {
    if (open) {
      fetchNotifications();
      fetchApprovedGroup();
      fetchInquiryReply();
    }
  }, [open, fetchNotifications, fetchApprovedGroup, fetchInquiryReply]);

  // 실시간 감시
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
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
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  // 패널 전체 슬라이드 모션
  const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { x: '100%', transition: { duration: 0.35, ease: 'easeInOut' } },
  };

  const cardExitMotion = {
    x: 150,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut' as Transition['ease'],
    },
  };

  const handleNavigateChat = (groupId: string, chatId: string): void => {
    navigate(`/chat/${groupId}/${chatId}`);
    onClose();
  };

  const handleHideGroupApproval = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGroupApproval(false);
  };

  const handleHideInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInquiryReply(false);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowGroupApproval(false);
    setHasInquiryReply(false);
    if (onUnreadChange) onUnreadChange(0);
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-20"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 오른쪽 패널 */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 p-6 overflow-y-auto rounded-l-sm"
            onClick={handlePanelClick}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-300 pb-3">
              <h2 className="text-2xl font-bold text-brand">알림</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand transition"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <p className="font-medium hover:text-brand transition">전체삭제</p>
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
                {/* 그룹 생성 승인 카드 */}
                <AnimatePresence>
                  {showGroupApproval && (
                    <motion.div
                      key="group-approval"
                      onClick={handleHideGroupApproval}
                      className="bg-white border border-gray-300 rounded-sm p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                      initial={{ opacity: 1, x: 0 }}
                      exit={cardExitMotion}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-800">그룹 생성 승인</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        그룹 <span className="font-medium text-brand">{approvedGroup}</span> 생성
                        신청이 승인되었습니다.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 채팅 알림 */}
                <AnimatePresence>
                  {notifications.map(n => (
                    <motion.li
                      key={n.chat_id}
                      layout
                      exit={cardExitMotion}
                      onClick={() => handleNavigateChat(n.group_id, n.chat_id)}
                      className={`flex items-start justify-between bg-white border border-gray-300 rounded-sm p-4 shadow-sm cursor-pointer hover:shadow-md transition ${
                        n.unread > 0 ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">{n.group_title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-[240px]">
                          {(n.sender_nickname || '알 수 없음') +
                            ' : ' +
                            (n.last_message || '메시지가 없습니다.')}
                        </p>
                      </div>
                      {n.unread > 0 && (
                        <span className="bg-brand-red text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {n.unread}
                        </span>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>

                {/* 문의 답변 알림 */}
                <AnimatePresence>
                  {hasInquiryReply && (
                    <motion.div
                      key="inquiry-reply"
                      onClick={handleHideInquiry}
                      className="bg-white border border-gray-300 rounded-sm p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                      exit={cardExitMotion}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FiInfo className="w-5 h-5 text-brand" />
                        <h3 className="text-lg font-semibold text-gray-800">문의 답변 완료</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        작성하신 문의의 답변이 완료되었습니다.
                      </p>
                    </motion.div>
                  )}
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
