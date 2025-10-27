// 회원 (호스트가 아닐 때) 일 때 보여지는 사이드바

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDirectChat } from '../../contexts/DirectChatContext';
import { supabase } from '../../lib/supabase';

interface HostProfile {
  nickname: string;
  avatar_url: string | null;
  groupTitle?: string | null;
  groupSummary?: string | null;
}

function DirectChatList() {
  const { user } = useAuth();
  const { currentChat, fetchChats } = useDirectChat();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);

  // 로그인 및 채팅 정보 로드
  useEffect(() => {
    if (!user) return;
    fetchChats(); // 혹시 안 불러온 상태 대비
  }, [user, fetchChats]);

  // 현재 선택된 채팅방의 호스트 정보 가져오기
  useEffect(() => {
    const loadHostProfile = async () => {
      if (!currentChat) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('nickname, avatar_url')
        .eq('user_id', currentChat.host_id)
        .maybeSingle();

      if (error) {
        console.error('모임장 정보 조회 실패:', error);
        return;
      }

      // group_id로 모임 정보도 가져옴
      const { data: groupData } = await supabase
        .from('groups')
        .select('group_title, group_short_intro')
        .eq('group_id', currentChat.group_id)
        .maybeSingle();

      setHostProfile({
        nickname: data?.nickname ?? '모임장',
        avatar_url: data?.avatar_url ?? '/profile_bg.png',
        groupTitle: groupData?.group_title ?? '모임',
        groupSummary:
          groupData?.group_short_intro ??
          '이 모임의 관리자입니다. 궁금한 점이 있으면 자유롭게 문의해주세요.',
      });
    };

    loadHostProfile();
  }, [currentChat]);

  // 로딩 or 데이터 없음 처리
  if (!currentChat || !hostProfile) {
    return (
      <aside className="w-[324px] p-5 flex items-center justify-center text-gray-400">
        채팅방을 선택해주세요.
      </aside>
    );
  }

  // 현재 로그인 유저가 호스트인지 판별
  const isHost = user?.id === currentChat.host_id;

  return (
    <aside className="w-[324px] p-5">
      <div className="self-start pt-1 font-semibold text-[28px] pb-[14px] pl-1">채팅/문의</div>
      <div className="pl-5 flex flex-col items-center">
        {/* 프로필 이미지 */}
        <img
          src={hostProfile.avatar_url ?? '/profile_bg.png'}
          alt="프로필"
          className="w-32 h-32 mt-3 rounded-full object-cover border border-gray-300"
        />

        {/* 닉네임 + (호스트일 때만 왕관) */}
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

        {/* 구분선 */}
        <div className="w-full border-b border-[#8c8c8c] my-4" />

        {/* 설명글 (호스트일 때만 출력) */}
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
      </div>
    </aside>
  );
}

export default DirectChatList;
