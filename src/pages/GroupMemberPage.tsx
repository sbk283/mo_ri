import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupPagination from '../components/common/GroupPagination';
import Modal from '../components/common/modal/Modal';
import SuccessModal from '../components/common/modal/SuccessModal';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useGroupMember } from '../contexts/GroupMemberContext';

const ITEMS_PER_PAGE = 10;

// NEW 표시 여부 계산: 가입 후 3일 이내면 true
const isNewMember = (joinedAt: string): boolean => {
  const joinedDate = new Date(joinedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 3; // 3일 미만이면 NEW
};

function GroupMemberPage() {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  // URL 파라미터에서 groupId 가져옮
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Auth, GroupMember Context
  const { user, loading: authLoading } = useAuth();
  const { members, fetchMembers, kickMember, subscribeToGroup } = useGroupMember();

  // 권한 상태
  const [isHost, setIsHost] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // 추방 관련 상태
  const [kickModalOpen, setKickModalOpen] = useState(false);
  // const [targetMember, setTargetMember] = useState<{ id: number; name: string } | null>(null);
  const [targetMember, setTargetMember] = useState<{ id: string; name: string } | null>(null);
  const [kickSuccess, setKickSuccess] = useState(false);

  // 추방 시키면 추방 시킨 페이지로 이동
  useEffect(() => {
    if (!user || !members.length) return;

    const me = members.find(m => m.user_id === user.id);
    if (me && me.member_status === 'left') {
      navigate('/kicked');
    }
  }, [user, members, navigate]);

  // 그룹 멤버 데이터 불러오기
  useEffect(() => {
    if (!groupId) return;
    // 실시간 구독 등록 (옵션)
    subscribeToGroup(groupId);
    fetchMembers(groupId);
  }, [groupId, fetchMembers, subscribeToGroup]);

  // 로그인, 멤버, 호스트 여부 확인
  useEffect(() => {
    if (authLoading) return;

    // 로그인 안했을 시 로그인 페이지로 이동
    if (!user) {
      navigate('/login');
      return;
    }

    // 현재 로그인한 사용자가 이 그룹의 멤버인지 확인
    const currentUserInGroup = members.find(member => member.user_id === user.id);

    if (currentUserInGroup) {
      setIsMember(true);
      if (currentUserInGroup.member_role === 'host') {
        setIsHost(true);
      } else {
        setIsHost(false);
      }
    } else {
      setIsMember(false);
      setIsHost(false);
    }
  }, [user, members, authLoading, navigate]);

  // 추방 성공 모달 자동 닫기
  useEffect(() => {
    if (kickSuccess) {
      const timer = setTimeout(() => setKickSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [kickSuccess]);

  // 접근 제한 처리
  if (authLoading) return <div>로딩 중...</div>;
  if (!isMember)
    return <div className="p-10 text-center">이 모임의 멤버만 접근할 수 있습니다.</div>;

  // 페이지네이션 계산
  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentPageMembers = members
    // 호스트를 맨 앞으로~
    .sort((a, b) => (a.member_role === 'host' ? -1 : b.member_role === 'host' ? 1 : 0))
    .slice(start, end);

  // 채팅 가능 여부 판단 함수
  const canStartChat = (targetRole: 'host' | 'member', targetUserId: string): boolean => {
    if (!user) return false;
    if (user.id === targetUserId) return false;
    if (!isHost && targetRole === 'host') return true;
    if (isHost && targetRole === 'member') return true;
    return false;
  };

  // 채팅 이동 함수
  const handleChatClick = (targetUserId: string) => {
    navigate(`/chat?target=${targetUserId}`);
  };

  return (
    <GroupDashboardLayout>
      {/* 메인 컨테이너 */}
      <div className="bg-white shadow-card h-[770px] p-6 rounded-sm">
        <h2 className="text-black text-[28px] font-semibold pb-8">모임 멤버</h2>

        {/* 멤버 리스트 영역 */}
        <div className="grid grid-cols-2 gap-4">
          {currentPageMembers.map(member => {
            const chatAllowed = canStartChat(member.member_role, member.user_id);
            const nickname = member.profile?.nickname ?? '이름없음';
            const profileImage =
              !member.profile?.avatar_url ||
              member.profile.avatar_url === 'null' ||
              member.profile.avatar_url.trim() === ''
                ? '/profile_bg.png'
                : member.profile.avatar_url;

            // NEW 배지 표시 (가입 3일 이내)
            const showNewBadge = isNewMember(member.member_joined_at);

            return (
              <div
                key={member.member_id}
                className="relative flex items-center gap-3 w-full h-24 bg-white border border-neutral-400 rounded-sm px-4 py-3 hover:shadow overflow-visible"
              >
                {/* 프로필 이미지 */}
                <img
                  src={profileImage}
                  alt={`${nickname}의 프로필`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />

                {/* 이름 + 배지 표시 */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xl text-brand">{nickname}</p>

                    {/* HOST 배지 (모두에게 보임) */}
                    {member.member_role === 'host' && (
                      <span className="px-2 py-[2px] text-[10px] font-bold bg-brand text-white rounded-full border border-brand">
                        HOST
                      </span>
                    )}

                    {/* NEW 배지 (3일 이내 가입자) */}
                    {showNewBadge && (
                      <span className="px-2 py-[2px] text-[10px] font-bold bg-red-100 text-red-500 rounded-full border border-red-200">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                {/* 호스트일 때만 … 버튼 표시 */}
                {isHost && (
                  <div
                    className="text-neutral-400 text-3xl font-semibold pr-[2px] cursor-pointer select-none"
                    onClick={() =>
                      setOpenId(prev => (prev === member.member_id ? null : member.member_id))
                    }
                  >
                    …
                  </div>
                )}

                {/* 드롭다운 메뉴 */}
                <AnimatePresence>
                  {openId === member.member_id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-16 right-[-60px] w-30 bg-white rounded-md shadow-lg border border-neutral-300 overflow-hidden z-50"
                    >
                      {/* 호스트만 추방 가능 */}
                      {isHost && member.member_role !== 'host' && (
                        <button
                          onClick={() => {
                            // setTargetMember({ id: Number(member.member_id), name: nickname });
                            setTargetMember({ id: member.user_id, name: nickname }); // user_id 기반 추방
                            setKickModalOpen(true);
                            setOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100"
                        >
                          모임 추방하기
                        </button>
                      )}

                      <div className="h-px bg-neutral-200" />

                      {/* 채팅 버튼 */}
                      {chatAllowed ? (
                        <button
                          onClick={() => handleChatClick(member.user_id)}
                          className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100"
                        >
                          채팅 대화하기
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-2 text-center text-sm text-gray-400 cursor-not-allowed bg-gray-50"
                        >
                          채팅 불가
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        <GroupPagination
          page={page}
          totalPages={totalPages}
          onPageChange={newPage => setPage(newPage)}
        />
      </div>

      {/* 추방 확인 모달 */}
      <Modal
        isOpen={kickModalOpen}
        onClose={() => setKickModalOpen(false)}
        title={`정말 ${targetMember?.name} 님을 추방하시겠습니까?`}
        message="추방 시 해당 멤버는 다시 재가입이 불가능 합니다."
        actions={[
          {
            label: '취소',
            onClick: () => setKickModalOpen(false),
            variant: 'secondary',
          },
          {
            label: '추방하기',
            onClick: async () => {
              if (!groupId || !targetMember) return;

              const result = await kickMember(groupId, targetMember.id.toString());

              if (result === 'success') {
                setKickSuccess(true);

                // 내가 방금 추방한 대상이 나 자신이면, 즉시 접근 제한 처리
                if (user && user.id === targetMember.id) {
                  // 페이지를 벗어나면 더 안전
                  navigate('/groups');
                }
              } else if (result === 'denied') {
                alert('호스트는 추방할 수 없습니다.');
              } else {
                alert('추방 실패. 다시 시도해주세요.');
              }

              setKickModalOpen(false);
            },
            variant: 'primary',
          },
        ]}
      />

      {/* 추방 완료 모달 */}
      <SuccessModal
        isOpen={kickSuccess}
        onClose={() => setKickSuccess(false)}
        message="추방이 완료 되었습니다."
      />
    </GroupDashboardLayout>
  );
}

export default GroupMemberPage;
