import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDirectChat } from '../../contexts/DirectChatContext';
import { supabase } from '../../lib/supabase';
import Modal from '../common/modal/Modal';
import SuccessModal from '../common/modal/SuccessModal';
import { DEFAULT_AVATAR, toAvatarUrl } from '../../utils/storage';

interface HostProfile {
  nickname: string;
  avatar_url: string | null;
  groupTitle?: string | null;
  groupSummary?: string | null;
}

function DirectChatList() {
  const { user } = useAuth();
  const { currentChat, fetchChats, fetchMessages, setCurrentChat } = useDirectChat();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 현재 로그인 사용자가 이 방의 호스트인지 (안전 계산)
  const isHost = useMemo(() => {
    if (!user?.id || !currentChat?.host_id) return false;
    return user.id === currentChat.host_id;
  }, [user?.id, currentChat?.host_id]);

  // 초기 목록 로드(안전)
  useEffect(() => {
    if (user) fetchChats();
  }, [user, fetchChats]);

  // 새로고침 시 메시지 재로드 (상대방 메시지 안 보이는 문제 해결)
  useEffect(() => {
    if (currentChat?.chat_id) {
      fetchMessages(currentChat.chat_id);
    }
  }, [currentChat?.chat_id, fetchMessages]);

  // 호스트 프로필 로드 (현재 방 기준)
  useEffect(() => {
    (async () => {
      if (!currentChat?.host_id || !currentChat?.group_id) {
        setHostProfile(null);
        return;
      }

      const [{ data: profileData, error: pErr }, { data: groupData }] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('nickname, avatar_url')
          .eq('user_id', currentChat.host_id)
          .maybeSingle(),
        supabase
          .from('groups')
          .select('group_title, group_short_intro')
          .eq('group_id', currentChat.group_id)
          .maybeSingle(),
      ]);

      if (pErr) {
        console.error('모임장 정보 조회 실패:', pErr.message);
        setHostProfile(null);
        return;
      }

      // storage 경로를 public URL 변환 (없으면 기본 이미지)
      const raw = profileData?.avatar_url ?? null;
      const avatar = toAvatarUrl(raw);
      setHostProfile({
        nickname: profileData?.nickname ?? '모임장',
        avatar_url: avatar,
        groupTitle: groupData?.group_title ?? '모임',
        groupSummary:
          groupData?.group_short_intro ??
          '이 모임의 관리자입니다. 궁금한 점이 있으면 자유롭게 문의해주세요.',
      });
    })();
  }, [currentChat?.host_id, currentChat?.group_id]);

  // 성공 모달 자동 닫기 (1800ms)
  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => setIsSuccessModalOpen(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen]);

  // 채팅방 나가기 모달 열기
  const openLeaveModal = () => setIsLeaveModalOpen(true);

  // 실제 나가기 처리
  const handleConfirmLeave = async () => {
    if (!currentChat || !user?.id) return;
    try {
      const { error } = await supabase
        .from('direct_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('chat_id', currentChat.chat_id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsLeaveModalOpen(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setCurrentChat(null);
        fetchChats();
      }, 1200);
    } catch (err) {
      console.error('채팅방 나가기 실패:', err);
      setIsLeaveModalOpen(false);
    }
  };

  // 로딩/없음 처리
  if (!currentChat) {
    return (
      <aside className="w-[324px] p-5 flex items-center justify-center text-gray-400">
        채팅방을 선택해주세요.
      </aside>
    );
  }
  if (!hostProfile) {
    return (
      <aside className="w-[324px] p-5 flex items-center justify-center text-gray-400">
        호스트 정보를 불러오는 중...
      </aside>
    );
  }

  return (
    <>
      <aside className="w-[324px] p-5">
        <div className="self-start pt-1 font-semibold text-[28px] pb-[14px] pl-1 flex justify-between items-center">
          <span>채팅/문의</span>
        </div>

        <div className="pl-5 flex flex-col items-center">
          <img
            src={
              hostProfile.avatar_url && hostProfile.avatar_url.trim() !== ''
                ? hostProfile.avatar_url
                : DEFAULT_AVATAR
            }
            alt="프로필"
            className="w-32 h-32 mt-3 rounded-full object-cover border border-[#dedede]"
            loading="lazy"
            onError={e => {
              const el = e.currentTarget as HTMLImageElement;
              if (!el.src.endsWith(DEFAULT_AVATAR)) el.src = DEFAULT_AVATAR;
            }}
          />

          <div className="mt-4 flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-brand whitespace-nowrap">
              {hostProfile.nickname}
            </h2>
            {isHost && (
              <div className="flex w-[23px] h-[13px] px-[5px] py-[2px] rounded-[11px] bg-[#0689E8] items-center justify-center">
                <img src="/images/group_crown.svg" alt="모임장크라운" className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="w-full border-b border-[#dedede] my-4" />

          {isHost && (
            <>
              <p className="text-[#3C3C3C] text-md font-medium text-center">
                {hostProfile.groupTitle} 관리자 입니다.
              </p>
              <p className="mt-4 text-[#8C8C8C] text-sm font-medium leading-normal text-center">
                {hostProfile.groupSummary}
                <br />
                비방이나 욕설 등 부적절한 메시지가 보이면 고객센터로 연락주세요.
              </p>
            </>
          )}

          {/* 내가 호스트가 아닐 때만 나가기 버튼 노출함 */}
          {!isHost && (
            <button
              onClick={openLeaveModal}
              className="text-sm text-white transition w-full h-8 bg-brand hover:bg-[#1362d0] rounded-sm"
            >
              나가기
            </button>
          )}
        </div>
      </aside>

      {/* 나가기 확인 모달 */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="채팅방 나가기"
        message="채팅방을 나가시겠습니까?"
        actions={[
          { label: '취소', onClick: () => setIsLeaveModalOpen(false), variant: 'secondary' },
          { label: '나가기', onClick: handleConfirmLeave, variant: 'primary' },
        ]}
      />

      {/* 나가기 완료 모달 */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="채팅방에서 나갔습니다."
      />
    </>
  );
}

export default DirectChatList;
