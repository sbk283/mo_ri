import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { profile } from '../../types/profileType';
import { diffDaysInclusive, toGroupTypeByRange } from '../../utils/date';

// 그룹 데이터 타입 정의
type GroupMemberData = {
  group_id: string;
  groups: {
    group_title: string;
    group_start_day: string;
    group_end_day: string;
  };
};

function IntroSection() {
  const { user } = useAuth();
  // 로그인 상태관리
  const [profile, setProfile] = useState<profile | null>(null);
  // 참여중인 그룹 확인하기.
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 감지 및 프로필 불러오기
  useEffect(() => {
    const fetchProfileAndGroups = async () => {
      setLoading(true);

      // 로그인한 사용자 있는경우
      if (user) {
        // 프로필 불러오기
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          console.error('프로필 조회 실패:', error);
          setProfile(null);
          setLoading(false);
          return;
        }
        if (!data.is_active) {
          // 탈퇴 회원이면 즉시 로그아웃 및 리다이렉트
          await supabase.auth.signOut();
          alert('탈퇴한 계정입니다.');
          navigate('/');
          return;
        }
        setProfile(data);

        //  참여 중인 그룹 불러오기
        const { data: groupData, error: groupError } = await supabase
          .from('group_members')
          .select(
            `
            group_id,
            groups (
              group_title,
              group_start_day,
              group_end_day
            )
          `,
          )
          .eq('user_id', user.id)
          .eq('member_status', 'approved'); // 승인된 모임만

        if (groupError) {
          console.error('참여 모임 조회 실패:', groupError);
        } else if (groupData) {
          // 날짜 계산을 통해 group_kind 추가
          const groupsWithKind = groupData.map((item: any) => {
            const totalDays = diffDaysInclusive(
              item.groups.group_start_day,
              item.groups.group_end_day,
            );
            const groupType = toGroupTypeByRange(totalDays);

            // 한글 변환
            let groupKind = '기타';
            if (groupType === 'oneday') groupKind = '원데이';
            else if (groupType === 'short') groupKind = '단기';
            else if (groupType === 'long') groupKind = '장기';

            return {
              ...item,
              groups: {
                ...item.groups,
                group_kind: groupKind,
              },
            };
          });

          setJoinedGroups(groupsWithKind);
        }
      } else {
        // 비로그인 상태
        setProfile(null);
        setJoinedGroups([]);
      }

      setLoading(false);
    };

    fetchProfileAndGroups();
  }, [user, navigate]);

  if (loading) {
    return <div>로딩중...</div>;
  }

  return (
    <div>
      <div className="relative  mt-[70px]">
        <div className="relative w-full h-[500px] overflow-hidden rounded-bl-[80px] rounded-br-[80px]">
          <img src="/bgimg.jpg" alt="" className="absolute inset-0 bg-cover bg-center " />
          <div className="absolute inset-0 bg-black/50 " />
        </div>

        <div className="absolute top-[135px] left-1/2 transform -translate-x-1/2  text-xxl font-bold text-gray-50">
          당신의 모임을 검색하세요!
        </div>
        {/* 검색창 */}
        <div className="absolute flex justify-center left-1/2 -translate-x-1/2 top-[214px]">
          <input
            type="text"
            placeholder="모임명이나 카테고리를 입력해 주세요."
            className="w-[550px] p-[15px] rounded-[40px] placeholder:text-md placeholder:text-gray-200 px-8 border-brand border-[2px]"
          />
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2">
            <img src="./search.png" alt="검색" className="w-[30px] h-[30px] transform scale-75" />
          </button>
        </div>
        {/* 프로필 영역 */}
        <div>
          <div className="absolute  top-[380px] left-1/2  transform -translate-x-1/2 bg-white w-[1024px] h-[216px] flex rounded-[5px] shadow-card gap-[18px]  items-start">
            <Link
              to={'/creategroup'}
              className="bg-brand-light w-[207px] h-[227px]  transform -translate-y-[30px] -translate-x-[-42px] rounded-[5px]  rounded-tr-[50px] px-[26px] py-[37px]"
            >
              <div className=" text-md font-bold text-white">관리자</div>
              <div className="flex justify-between items-center">
                <div className=" text-[25px] font-semibold text-white">모임 생성</div>
                <img src="./direction.svg" alt="바로가기" />
              </div>
              <div className=" text-sm font-sans text-white">모임을 만들어 보세요!</div>
              <img
                src="./meetingsicon.svg"
                alt="그림아이콘"
                className="transform -translate-y-[-12px]"
              />
            </Link>
            <Link
              to={'/grouplist'}
              className="bg-brand-red w-[207px] h-[227px]  transform -translate-y-[30px] -translate-x-[-42px] rounded-[5px]  rounded-tr-[50px]  px-[26px] py-[37px] "
            >
              <div className=" text-md font-bold text-white">참가자</div>
              <div className="flex justify-between items-center">
                <div className=" text-[25px] font-semibold text-white">모임 리스트</div>
                <img src="./direction.png" alt="바로가기" />
              </div>
              <div className=" text-sm font-sans text-white">모임에 참여해 보세요!</div>
              <img
                src="./Onlinemeetingicon.svg"
                alt="그림아이콘"
                className="transform -translate-y-[-14px]"
              />
            </Link>

            {/* 로그인 / 비회원 일때 보여지는 화면 전환 (날리지 말것!!) */}
            {user && profile ? (
              <>
                <div className="flex transform -translate-x-[-65px] pt-[22px]">
                  <div>
                    <img
                      src={profile.avatar_url || './profile_bg.png'}
                      alt="프로필 이미지"
                      className="w-[140px] h-[175px] rounded-[5px] object-cover "
                    />
                  </div>
                </div>
                <div className="flex transform -translate-x-[-40px] pt-[19px]">
                  <div className="pl-[35px]">
                    <div className="flex justify-between font-bold text-lg">
                      <div>
                        {profile.nickname || '프로모임자1'}
                        <span className="font-medium text-sm text-gray-200 ml-[3px]">
                          님 환영합니다.
                        </span>
                      </div>
                      <button onClick={() => supabase.auth.signOut()}>
                        <img src="/logout.svg" alt="로그아웃" className="w-[18px]" />
                      </button>
                    </div>
                    <div className=" flex justify-between mt-[9px] items-center gap-[8px] mb-[6px]">
                      <div className="font-bold text-md text-brand">참여중인모임</div>
                      <div className="border-[0.5px] w-[160px] border-[#dadada]" />
                      <Link to={'/joingroups'} className="font-normal text-sm">
                        더보기
                      </Link>
                    </div>
                    <div className="space-y-[4px] text-sm h-[65px]">
                      {joinedGroups.length > 0 ? (
                        joinedGroups.slice(0, 3).map((item, index) => (
                          <div key={index}>
                            · [{item.groups.group_kind}] {item.groups.group_title}
                          </div>
                        ))
                      ) : (
                        <div>참여 중인 모임이 없습니다.</div>
                      )}
                    </div>
                    <div className=" flex justify-between mt-[9px] items-center gap-[8px]">
                      <div className="font-bold text-md text-brand">바로가기</div>
                      <div className="border-[0.5px] w-[231px] border-[#dadada]" />
                    </div>
                    <div className="flex gap-[17px] text-sm">
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./reviewicon.png" alt="리뷰 아이콘" />
                        <Link to={'/groupreviews'}>리뷰</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./star.png" alt="찜리스트 아이콘" />
                        <Link to={'/groupwish'}>찜리스트</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./headseticon.png" alt="고객센터 아이콘" />
                        <Link to={'/faq'}>고객센터</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./settingicon.png" alt="회원설정 아이콘" />
                        <Link to={'/mypagesetting'}>회원설정</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-[23px] transform -translate-x-[-155px] pt-[54px]">
                  <img src="/images/mori_logo.svg" alt="" className="w-[80px] h-[29px]" />
                  <div>
                    <p className=" text-[16px] font-medium text-gray-500 leading-snug">
                      참여와 기록을 통해 <br />
                      <span className=" text-brand font-semibold">성장과 커리어</span>를 만들어
                      보세요.
                    </p>
                  </div>
                </div>
                <Link
                  to={'/login'}
                  className="absolute transform -translate-x-[-570px] -translate-y-[-115px] "
                >
                  <p className="text-xl font-semibold text-white  bg-brand w-[385px] text-center py-[6px] rounded-[5px]">
                    로그인 / 회원가입
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroSection;
