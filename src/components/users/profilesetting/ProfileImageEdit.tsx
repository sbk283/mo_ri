// 프로필 이미지 수정 컴포넌트

import type { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface ProfileImageEditProps {
  user: User | null;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
}

function ProfileImageEdit({ user, avatarUrl, setAvatarUrl }: ProfileImageEditProps) {
  // 프로필 이미지 업로드 상태
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>(avatarUrl || '/ham.png'); // 초기 이미지
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 파일 업로드 처리
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

  return (
    <div>
      {' '}
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
  );
}

export default ProfileImageEdit;
