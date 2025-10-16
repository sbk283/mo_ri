// 비밀번호 확인 완료시 나오는 수정창.
import { Checkbox, Switch } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getProfile } from '../../lib/profile';
import CareerModal, { type CareerItem } from '../common/modal/CareerModal';
import InterestModal from '../common/modal/InterestModal';
import NicknameEditModal from '../common/modal/NicknameEditModal';

function PasswordEdit() {
  const { user } = useAuth();

  // 닉네임 , 이름 , 프로필 이미지 상태
  const [nickname, setNickname] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isNicknameEditModalOpen, setIsNicknameEditModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('/ham.png');

  // 관심사
  const [selected, setSelected] = useState(['구기활동', 'IT']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 경력사항
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerList, setCareerList] = useState<CareerItem[]>([]);

  // 프로필 이미지 업로드 상태
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('/ham.png'); // 초기 이미지
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checked, setChecked] = useState(false);

  // 프로필 / 관심사 불러오기
  useEffect(() => {
    const fetchProfileAndInterests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 프로필 가져오기
        const profile = await getProfile(user.id);
        if (profile) {
          setNickname(profile.nickname || '사용자');
          setName(profile.name || '');
          const avatar = profile.avatar_url || '/ham.png';
          setAvatarUrl(avatar);
          setProfilePreview(avatar);
        }

        // 유저 관심사 ID 가져오기
        const { data: userInterests, error: interestsError } = await supabase
          .from('user_interests')
          .select('category_sub_id')
          .eq('user_id', user.id);

        if (interestsError) {
          console.error('관심사 로드 에러:', interestsError);
        }

        // 전체 카테고리 가져오기
        const { data: categories, error: categoriesError } = await supabase
          .from('categories_sub')
          .select('sub_id, category_sub_name'); // 🔑 컬럼명 주의

        if (categoriesError) {
          console.error('카테고리 로드 에러:', categoriesError);
        }

        // id -> name 매핑
        if (userInterests && categories) {
          const interestNames = userInterests.map((ui: any) => {
            const cat = categories.find((c: any) => c.sub_id === ui.category_sub_id);
            return cat?.category_sub_name || '이름없음';
          });

          setSelected(interestNames);
          console.log('유저 관심사:', interestNames);
        }
      } catch (err) {
        console.error('프로필/관심사 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndInterests();
  }, [user]);

  // 닉네임 저장함수
  const handleNicknameSave = async (newName: string) => {
    try {
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ nickname: newName })
        .eq('user_id', user.id);

      if (error) throw error;

      setNickname(newName);
      setIsNicknameEditModalOpen(false);
    } catch (err) {
      console.error('닉네임 업데이트 실패:', err);
      alert('닉네임 변경 중 오류가 발생했습니다.');
    }
  };

  // 미리보기 URL 관리 (메모리 누수 방지)
  useEffect(() => {
    if (!profileFile) return;
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  // 파일 선택창 열기
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 동일 파일 다시 선택 가능하게
      fileInputRef.current.click();
    }
  };

  // 파일 선택 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 기존 이미지 삭제(있다면!)
      if (avatarUrl && avatarUrl !== '/ham.png') {
        const oldFileName = avatarUrl.split('/').pop();
        await supabase.storage.from('avatars').remove([`avatars/${oldFileName}`]);
      }

      // 새 이미지 업로드
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }

      // public url 얻기
      const { data: publicURL } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!publicURL?.publicUrl) {
        throw new Error('URL 생성 실패');
      }
      console.log('업로드 후 URL:', publicURL.publicUrl);

      // DB 업데이트
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      // ui 반영하기
      setAvatarUrl(publicURL.publicUrl);
      setProfilePreview(publicURL.publicUrl);
      alert('프로필 이미지가 업데이트 되었습니다.');
    } catch (err) {
      console.log('이미지 업로드 실패 : ', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  // 이미지 제거
  const clearImage = async () => {
    try {
      if (!user) return;

      // avatarUrl이 기본 이미지가 아닐 때만 스토리지 파일 삭제
      if (avatarUrl && avatarUrl !== '/ham.png') {
        try {
          const url = new URL(avatarUrl);
          const parts = url.pathname.split('/');
          const fileName = parts[parts.length - 1]; // 파일명만 추출

          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('avatars')
              .remove([fileName]);
            if (storageError) {
              console.error('Storage 파일 삭제 실패:', storageError);
            } else {
              console.log('스토리지 파일 삭제 성공:', fileName);
            }
          }
        } catch (err) {
          console.error('파일 삭제 중 URL 파싱 오류:', err);
        }
      }

      // DB에서 avatar_url 제거
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (dbError) {
        console.error('DB 업데이트 실패:', dbError);
      }

      // UI 기본 이미지로 변경
      setAvatarUrl('/ham.png');
      setProfilePreview('/ham.png');

      console.log('프로필 이미지 삭제 완료');
    } catch (err) {
      console.error('이미지 삭제 중 오류:', err);
      alert('프로필 이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleInterest = async (item: string) => {
    if (!user) return;

    try {
      // 전체 카테고리에서 sub_id 찾기
      const { data: categories } = await supabase
        .from('categories_sub')
        .select('sub_id, category_sub_name');

      const category = categories?.find(c => c.category_sub_name === item);
      if (!category) return;

      // 선택 해제
      if (selected.includes(item)) {
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user.id)
          .eq('category_sub_id', category.sub_id);

        setSelected(prev => prev.filter(i => i !== item));
      }
      // 선택 추가
      else if (selected.length < 5) {
        await supabase
          .from('user_interests')
          .insert({ user_id: user.id, category_sub_id: category.sub_id });

        setSelected(prev => [...prev, item]);
      }
    } catch (err) {
      console.error('관심사 업데이트 실패:', err);
      alert('관심사 업데이트 중 오류가 발생했습니다.');
    }
  };

  // };

  // 로딩중..
  if (loading) return <div className="text-gray-400">불러오는 중...</div>;

  return (
    <div>
      <div className="text-brand font-bold text-xl mb-[21px]">기본정보</div>

      {/* 박스 부분 */}
      <div className="border border-gray-300 rounded-[5px] py-[60px] px-[80px] mb-[39px] w-[1024px]">
        <div className="flex justify-between">
          {/* 왼쪽 - 이름 프로필 */}
          <div className="text-lg text-gray-200 font-semibold mr-[63px]">
            <div className="flex gap-[38px]">
              <label className="w-[100px] text-gray-400">프로필 사진</label>

              {/* 프로필 이미지 영역 (클릭 시 교체 가능) */}
              <div className="w-[160px] h-[160px] relative">
                <img
                  src={profilePreview}
                  alt="프로필"
                  className="w-full h-full object-cover rounded-[5px]"
                  onError={() => console.log('이미지 로딩 실패:', profilePreview)}
                />

                {/* 우하단 수정 버튼 (클릭 시 파일 선택) */}
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute right-1 bottom-1"
                  aria-label="프로필 이미지 수정"
                >
                  <img src="/profilesave.svg" alt="수정" />
                </button>

                {/* 우상단 제거 버튼 */}
                {avatarUrl !== '/ham.png' && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-[5px] top-[5px]"
                    aria-label="프로필 이미지 제거"
                  >
                    <img src="/images/close_white.svg" alt="삭제" className="w-4 h-4" />
                  </button>
                )}

                {/* 숨겨진 파일 입력기 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple={false}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽 -  아이디, 닉네임, 비밀번호 */}
          <div className="text-lg text-gray-200 font-medium">
            <div className="flex mb-[23px]">
              <label className="w-[100px] text-gray-400 font-semibold">이름</label>
              <p>{name || '이름없음'}</p>
            </div>

            <div className="flex  mb-[23px]">
              <label className="w-[100px] text-gray-400 font-semibold">아이디</label>
              <p>{user?.email || '이름없음'}</p>
            </div>

            <div className="flex mb-[10px] items-center justify-between">
              <label className="w-[100px] text-gray-400 font-semibold">닉네임</label>
              <p className="w-[300px]">{nickname}</p>
              <button
                onClick={() => setIsNicknameEditModalOpen(true)}
                className="mr-[3px] font-semibold text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
              >
                변경
              </button>
              {isNicknameEditModalOpen && (
                <NicknameEditModal
                  currentNickname={nickname}
                  onClose={() => setIsNicknameEditModalOpen(false)}
                  onSave={handleNicknameSave}
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 관심사 */}
        <div className="flex items-center">
          <div className="text-lg text-gray-400 font-semibold mr-[70px]">관심사</div>
          <div className="flex gap-[13px]">
            {selected.map(item => (
              <div key={item} className="bg-brand text-white py-[5px] px-[8px] rounded-[5px]">
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
          >
            변경
          </button>

          <InterestModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selected={selected}
            toggleInterest={toggleInterest}
          />
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 경력사항 */}
        <div className="flex items-center">
          <div className="text-lg text-gray-400 font-semibold mr-[60px]">경력사항</div>
          <div className="flex flex-col gap-1">
            {careerList.length === 0 ? (
              <p className="text-gray-300">등록된 경력이 없습니다. 경력사항을 추가해주세요.</p>
            ) : (
              careerList.map(item => (
                <div key={item.id} className="text-gray-700 text-sm mb-[10px] ">
                  <div>
                    <span className="mr-[15px]">
                      <b>{item.period}</b>
                    </span>
                  </div>
                  <div className="text-md">
                    <span className="mr-[15px]">
                      <b>경력 : </b> {item.career}
                    </span>
                    <span>
                      <b> 첨부파일 : </b>
                      {item.file ? `${item.file.name}` : '없음'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setIsCareerModalOpen(true)}
            className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
          >
            경력사항 추가하기
          </button>

          <CareerModal
            open={isCareerModalOpen}
            onClose={() => setIsCareerModalOpen(false)}
            careerList={careerList}
            setCareerList={setCareerList}
          />
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 마케팅 수신동의 */}
        <div>
          <div className="text-lg text-gray-400 font-semibold mb-[16px]">마케팅 수신동의</div>
          <div className="text-md text-gray-200 mb-[22px]">
            수신 동의 시, 당사의 이벤트이벤트·프로모션·혜택 정보가 이메일, 알림 등을 통해
            발송됩니다.
          </div>
          <div className="flex gap-[32px] mb-[34px]">
            <div className="flex gap-[10px] text-md text-gray-200">
              <Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>
                이메일
              </Checkbox>
            </div>
            <div className="flex gap-[10px] text-md text-gray-200">
              <Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>
                카카오톡
              </Checkbox>
            </div>
          </div>
          <div className="flex gap-[27px] text-md text-gray-200">
            <div>개인정보 수집 및 이용동의</div>
            <Link to={'/privacy'} className="text-brand">
              전체보기
            </Link>
            <div className="flex gap-[10px] ml-auto">
              <div>전체 동의</div>
              <Switch checked={checked} onChange={value => setChecked(value)} />
            </div>
          </div>
        </div>
      </div>

      {/* 탈퇴하기 */}
      <Link
        to={'/deleteaccount'}
        className="flex justify-end font-normal text-[12px] text-gray-200 mr-[39px]"
      >
        회원 탈퇴 하기
      </Link>
    </div>
  );
}

export default PasswordEdit;
