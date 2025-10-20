import { useEffect, useState } from 'react';
import CareerModal, { type CareerItem } from '../../common/modal/CareerModal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Tables } from '../../../types/careerType';

// 경력사항 수정
function ProfileCareerEdit() {
  const { user } = useAuth();
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerList, setCareerList] = useState<CareerItem[]>([]);

  // 경력 불러오기
  useEffect(() => {
    if (!user) return;

    const fetchCareers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_careers')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = data.map((item: Tables<'user_careers'>) => ({
          id: item.career_id,
          period: `${item.start_date} ~ ${item.end_date}`,
          career: item.company_name,
          file: item.career_image_url
            ? ({ name: item.original_file_name || item.career_image_url.split('/').pop() } as File)
            : null,
        }));

        setCareerList(formatted);
      } catch (error) {
        console.error('경력 불러오기 실패:', error);
      }
    };
    fetchCareers();
  }, [user]);

  const handleSaveCareer = async (updatedList: CareerItem[], originalList: CareerItem[]) => {
    if (!user) return alert('로그인이 필요합니다.');

    try {
      // 1. 삭제된 항목 찾기 (originalList에는 있지만 updatedList에는 없는 항목)
      const deletedItems = originalList.filter(
        orig => !updatedList.some(updated => updated.id === orig.id),
      );

      // 추가된 항목 찾기
      const addedItems = updatedList.filter(
        updated => !originalList.some(orig => orig.id === updated.id),
      );
      // 삭제 처리
      for (const item of deletedItems) {
        try {
          // DB에서 실제 경로 먼저 조회
          const { data: careerData } = await supabase
            .from('user_careers')
            .select('career_image_url')
            .eq('career_id', item.id)
            .single();

          // db 삭제
          const { error } = await supabase.from('user_careers').delete().eq('career_id', item.id);
          if (error) throw error;

          // Storage 삭제 (DB에 저장된 실제 경로 사용)
          if (careerData?.career_image_url) {
            const { error: storageError } = await supabase.storage
              .from('career-images')
              .remove([careerData.career_image_url]);
            if (storageError) console.error('파일 삭제 실패:', storageError);
          }
        } catch (err) {
          console.error('삭제 처리 중 오류:', err);
        }
      }
      // 추가 작업 수행
      for (const item of addedItems) {
        const start = item.period.split('~')[0].trim();
        const end = item.period.split('~')[1].trim();

        let fileUrl: string | null = null;
        let originalFileName: string | null = null;

        if (item.file) {
          originalFileName = item.file.name; // 원본 파일명 저장
          // Storage 업로드 한글/특수문자 처리
          const ext = item.file.name.split('.').pop();
          // 랜덤 8자리 문자열 생성
          const randomStr = Math.random().toString(36).substring(2, 10);
          const safeFileName = `${randomStr}.${ext}`;
          const path = `${user.id}/${safeFileName}`;

          const { data: storageData, error: storageError } = await supabase.storage
            .from('career-images')
            .upload(path, item.file, {
              cacheControl: '3600',
              upsert: true,
            });
          if (storageError) throw storageError;
          fileUrl = path;
        }

        // DB 삽입
        const { error } = await supabase.from('user_careers').insert({
          profile_id: user.id,
          company_name: item.career,
          start_date: start,
          end_date: end,
          career_image_url: fileUrl,
          original_file_name: originalFileName, // 원본 파일명 저장
        });
        if (error) throw error;
      }
      // 화면 갱신
      const { data, error } = await supabase
        .from('user_careers')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const formatted = data.map((item: Tables<'user_careers'>) => ({
        id: item.career_id,
        period: `${item.start_date} ~ ${item.end_date}`,
        career: item.company_name,
        file: item.career_image_url
          ? ({ name: item.original_file_name || item.career_image_url.split('/').pop() } as File)
          : null,
      }));

      setCareerList(formatted);
    } catch (error) {
      console.error(error);
      alert('경력 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="text-lg text-gray-400 font-semibold mr-[60px]">경력사항</div>
        <div className="flex flex-col gap-1">
          {careerList.length === 0 ? (
            <p className="text-gray-300">등록된 경력이 없습니다. 경력사항을 추가해주세요.</p>
          ) : (
            careerList.map((item, index) => (
              <div key={item.id} className="text-gray-700 text-sm mb-[10px]">
                <div className="flex items-center">
                  <div className="p-5 text-lg font-semibold">{index + 1}</div>
                  <div>
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
                        {item.file ? item.file.name : '없음'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => setIsCareerModalOpen(true)}
          className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
        >
          경력사항 추가/변경 하기
        </button>

        <CareerModal
          open={isCareerModalOpen}
          onClose={() => setIsCareerModalOpen(false)}
          careerList={careerList}
          onSave={handleSaveCareer}
        />
      </div>
    </div>
  );
}

export default ProfileCareerEdit;
