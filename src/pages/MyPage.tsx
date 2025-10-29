import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MyPageLayout from '../components/layout/MyPageLayout';
import MypageMyGroupMenu from '../components/MypageMyGroupMenu';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

// 기본 회원 정보, 모임 참여이력, 모임 생성이력 출력해야합니다.
function MyPage() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('/profile_bg.png');
  const [interests, setInterests] = useState<string[]>([]);

  // 관리자 이메일 목록
  const adminEmails = [
    'wltjs6668@naver.com',
    'dev.yachea@gmail.com',
    'sbkcoding@gmail.com',
    'lynn9702@naver.com',
  ];
  // 이메일 기반으로 관리자 여부 체크
  const isAdmin = user ? adminEmails.includes(user.email ?? '') : false;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        //  기본 프로필 가져오기
        const profile = await getProfile(user.id);
        if (profile) {
          setNickname(profile.nickname || '사용자');
          setName(profile.name || '');
          setAvatarUrl(profile.avatar_url || 'profile_bg.png');
        }

        //  유저 관심사 id만 가져오기
        const { data: userInterests, error: interestsError } = await supabase
          .from('user_interests')
          .select('category_sub_id')
          .eq('user_id', user.id);

        if (interestsError) {
          console.error('관심사 로드 에러:', interestsError);
        }

        //  전체 카테고리 가져오기
        const { data: categories, error: categoriesError } = await supabase
          .from('categories_sub')
          .select('sub_id, category_sub_name');

        if (categoriesError) {
          console.error('카테고리 로드 에러:', categoriesError);
        }

        // id -> name 매핑
        if (userInterests && categories) {
          const interestNames = userInterests.map((ui: any) => {
            const cat = categories.find((c: any) => c.sub_id === ui.category_sub_id);
            return cat?.category_sub_name || '이름없음';
          });
          setInterests(interestNames);
          // console.log('userInterests mapped:', interestNames);
        }
      } catch (err) {
        console.error('프로필 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // 로딩중일때
  if (loading) {
    return (
      <MyPageLayout>
        <LoadingSpinner />
      </MyPageLayout>
    );
  }
  // 사용자 없다면(추후 확인 후 ui 작업 실행할거임.)
  if (!user) {
    return (
      <MyPageLayout>
        <div className="text-center text-gray-400  h-[1080px]">로그인이 필요합니다.</div>
      </MyPageLayout>
    );
  }

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">마이페이지</div>
      </div>
      <div className="flex gap-[12px] mb-[43px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            나의 기본 정보와 프로필을 확인하고 수정할 수 있는 공간입니다.
          </div>
          <div className="text-md">
            정확한 정보를 입력하면 더욱 편리하게 서비스를 이용하실 수 있습니다.
          </div>
        </div>
      </div>
      {/* 하단 내용 부분 -상단 박스  */}
      <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[30px] px-[40px] flex gap-[48px] mb-[59px]">
        <div className="overflow-hidden bg-slate-300 w-full max-w-[192px] h-[192px] rounded-[50%] border-[1px] border-brand">
          <img src={avatarUrl} alt="이미지" className="w-full h-full object-cover" />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between mb-[10px]">
            <div className="text-brand text-xxl font-bold mb-[4px] ">
              {nickname} <span className="text-black">님 반가워요✨</span>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Link
                  to={'/admin'}
                  className="bg-white border border-gray-300 py-[5px] px-[10px] rounded-[5px] text-gray-200 font-semibold"
                >
                  관리자 페이지
                </Link>
              )}
              <Link
                to={'/mypagesetting'}
                className="bg-white border border-gray-300 py-[5px] px-[10px] rounded-[5px] text-gray-200 font-semibold"
              >
                회원정보수정
              </Link>
            </div>
          </div>

          <div className="text-md text-gray-400 font-medium mb-[20px]">
            {name || '이름없음'} | {user?.email || '이메일 없음'}
          </div>
          <div className=" border border-gray-300 mb-[12px]" />
          <div>
            <div className="text-md font-bold text-gray-400 mb-[9px]">내 관심 키워드</div>
            {/* 관심사 키워드 영역 추후 선택따라서 변경 가능하게~ */}
            <div className="flex gap-[14px]">
              {interests.length > 0 ? (
                interests.map((item, idx) => (
                  <div
                    key={idx}
                    className="inline-block bg-brand py-[5px] px-[25px] rounded-[5px] text-white font-medium"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="text-gray-300">선택된 관심사가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 하단 내용 부분 -하단 박스  */}
      <div>
        <MypageMyGroupMenu />
      </div>
    </MyPageLayout>
  );
}

export default MyPage;
