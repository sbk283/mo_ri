import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function usePDFPrintHandler() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('user_id', user.id)
        .single();

      if (!error && data) setProfile({ name: data.name, email: data.email });
    };
    fetchProfile();
  }, []);

  const printSelectedItems = useCallback(
    async (allMeetings: any[], selectedIds: string[]) => {
      if (!selectedIds || selectedIds.length === 0) {
        alert('출력할 항목을 선택해주세요.');
        return;
      }

      let container: HTMLDivElement | null = null;

      try {
        setIsPrinting(true);

        const selectedMeetings = allMeetings
          .filter(m => selectedIds.includes(m.id))
          .map(m => ({
            ...m,
            curriculum:
              typeof m.curriculum === 'string'
                ? m.curriculum
                    .split(',')
                    .map((c: string) => c.trim())
                    .filter(Boolean)
                : Array.isArray(m.curriculum)
                  ? m.curriculum
                  : [],
          }));

        if (selectedMeetings.length === 0) {
          alert('선택된 모임이 없습니다.');
          setIsPrinting(false);
          return;
        }

        // PDF용 임시 컨테이너 생성
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '210mm';
        container.style.maxWidth = '210mm';
        container.style.overflow = 'visible';
        container.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(container);

        // 완전한 HTML 구조로 변경
        const generateHTML = () => {
          const currentDate = new Date().toLocaleDateString();

          return `
            <div style="padding: 2.5rem; background-color: #ffffff; width: 100%; max-width: 210mm; box-sizing: border-box; font-family: Arial, sans-serif;">
              <!-- 첫 페이지 - 기본 정보 -->
              <div style="page-break-inside: avoid;">
                <div style="margin-bottom: 30px;">
                  <h1 style="font-size: 22px; font-weight: 600; color: #000;">모임 참여 이력 증명서</h1>
                  <p style="font-size: 0.875rem; line-height: 1.25rem; color: #000;">출력일: ${currentDate}</p>
                </div>

                <!-- 프로필 정보 -->
                <div style="padding: 1rem;">
                  <div style="font-size: 1.125rem; font-weight: 600; margin-bottom: 20px; margin-left: 20px; color: #000;">프로필 정보</div>
                  <div style="border-bottom: 2px solid #e5e7eb; margin-bottom: 7px;"></div>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; margin-left: 20px; padding-left: 20px; color: #000;">성 명</div>
                      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; margin-left: 60px; color: #000;">
                        ${profile?.name ?? '-'}
                      </div>
                    </div>
                    <div style="display: flex; align-items: center;">
                      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; color: #000;">이메일</div>
                      <div style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; margin-left: 40px; padding-right: 150px; color: #000;">
                        ${profile?.email ?? '-'}
                      </div>
                    </div>
                  </div>
                  <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 20px;"></div>
                </div>

                <!-- 모임 참여 이력 -->
                <div style="padding: 1rem; width: 100%;">
                  <div style="font-size: 1.125rem; font-weight: 600; margin-bottom: 20px; margin-left: 20px; color: #000;">모임 참여 이력</div>
                  <div style="border-bottom: 2px solid #e5e7eb; margin-bottom: 7px;"></div>
                  <div style="display: grid; grid-template-columns: 25% 50% 25%; width: 100%; margin-bottom: 20px;">
                    <div style="font-size: 1rem; font-weight: 600; text-align: center; color: #000;">모임 기간</div>
                    <div style="font-size: 1rem; font-weight: 600; text-align: center; color: #000;">모임 이름</div>
                    <div style="font-size: 1rem; font-weight: 600; text-align: center; color: #000;">모임 분류</div>
                  </div>
                  <div style="border-bottom: 1px solid #e5e7eb;"></div>

                  <div style="display: flex; flex-direction: column;">
                    ${selectedMeetings
                      .map(
                        item => `
                      <div style="display: flex; width: 100%; align-items: center; border-bottom: 1px solid #e5e7eb; padding-top: 0.5rem; padding-bottom: 0.5rem;">
                        <div style="width: 25%; font-size: 0.875rem; font-weight: 400; text-align: center; color: #000;">
                          ${item.group_start_day} ~ ${item.group_end_day}
                        </div>
                        <div style="width: 50%; font-size: 1rem; font-weight: 600; text-align: center; color: #000;">${item.group_title}</div>
                        <div style="width: 25%; font-size: 1rem; font-weight: 600; text-align: center; word-wrap: break-word; overflow-wrap: break-word; color: #000;">
                          ${item.categories_major?.category_major_name ?? '-'} > ${item.categories_sub?.category_sub_name ?? '-'}
                        </div>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>
                </div>
              </div>

              <!-- 페이지 넘김 -->
              <div style="page-break-after: always;"></div>

              <!-- 모임 세부 정보 -->
              <div style="padding: 1rem; width: 100%;">
                <div style="font-size: 1.125rem; font-weight: 600; margin-bottom: 20px; margin-left: 20px; color: #000;">모임 세부 정보</div>
                ${selectedMeetings
                  .map(
                    item => `
                  <div style="border: 1px solid #e5e7eb; padding: 0.75rem; border-radius: 0.125rem; margin-bottom: 20px; page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; padding-bottom: 20px;">
                      <div style="display: flex;">
                        <div style="font-size: 1rem; font-weight: 600; margin-left: 20px; padding-left: 20px; color: #000;">모임기간</div>
                        <div style="font-size: 1rem; font-weight: 600; margin-left: 60px; color: #000;">
                          ${item.group_start_day} ~ ${item.group_end_day}
                        </div>
                      </div>
                      <div style="display: flex;">
                        <div style="font-size: 1rem; font-weight: 600; color: #000;">모임 분류</div>
                        <div style="font-size: 1rem; font-weight: 600; margin-left: 40px; padding-right: 150px; color: #000;">
                          ${item.categories_major?.category_major_name ?? '-'} > ${item.categories_sub?.category_sub_name ?? '-'}
                        </div>
                      </div>
                    </div>

                    <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 10px;"></div>
                    <div style="display: flex; padding-bottom: 20px;">
                      <div style="font-size: 1rem; font-weight: 600; margin-left: 20px; padding-left: 20px; color: #000;">모임 이름</div>
                      <div style="font-size: 1rem; font-weight: 600; margin-left: 56px; color: #000;">${item.group_title}</div>
                    </div>

                    <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 10px;"></div>
                    <div style="display: flex; padding-bottom: 20px;">
                      <div style="font-size: 1rem; font-weight: 600; margin-left: 20px; padding-left: 20px; color: #000;">커리큘럼</div>
                      <div>
                        ${(() => {
                          if (!item.curriculum) {
                            return '<div style="font-size: 1rem; font-weight: 400; margin-left: 56px; color: #9ca3af;">커리큘럼 없음</div>';
                          }

                          let curriculumArray: { title?: string; detail?: string }[] = [];

                          try {
                            let parsed = item.curriculum;
                            if (typeof item.curriculum === 'string') {
                              parsed = JSON.parse(item.curriculum);
                            }
                            if (Array.isArray(parsed)) {
                              curriculumArray = parsed
                                .filter(c => typeof c === 'object' && c !== null)
                                .map(c => ({
                                  title: c.title ?? '-',
                                  detail: c.detail ?? '-',
                                }));
                            }
                          } catch (e) {
                            console.error('커리큘럼 파싱 에러:', e);
                            return '<div style="font-size: 1rem; font-weight: 400; margin-left: 56px; color: #9ca3af;">커리큘럼 없음</div>';
                          }

                          if (curriculumArray.length === 0) {
                            return '<div style="font-size: 1rem; font-weight: 400; margin-left: 56px; color: #9ca3af;">커리큘럼 없음</div>';
                          }

                          curriculumArray.sort((a, b) => a.title!.localeCompare(b.title!));

                          return curriculumArray
                            .map(
                              (c, idx) => `
                              <div style="font-size: 1rem; font-weight: 400; margin-left: 56px; margin-bottom: 0.5rem; color: #000;">
                                ${idx + 1}. ${c.title}
                                <div style="color: #4b5563; margin-left: 10px;">${c.detail}</div>
                              </div>
                            `,
                            )
                            .join('');
                        })()}
                      </div>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `;
        };

        // HTML 직접 삽입
        container.innerHTML = generateHTML();

        // 렌더 안정화
        await new Promise(res => setTimeout(res, 500));

        // 인쇄 미리보기용 스타일 설정
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.zIndex = '9999';
        container.style.backgroundColor = 'white';
        container.style.border = 'none';
        container.style.width = '100%';
        container.style.maxWidth = 'none';
        container.style.overflow = 'visible';
        container.style.padding = '20px';
        container.style.fontSize = '14px';
        container.style.lineHeight = '1.6';

        // 인쇄용 CSS 추가
        const printStyles = document.createElement('style');
        printStyles.id = 'print-styles';
        printStyles.textContent = `
          @media print {
            @page { 
              margin: 10mm; 
              size: A4;
              @bottom-center { 
                content: "페이지 " counter(page) " / " counter(pages); 
                font-size: 10px;
                color: #666;
              }
              @top-center { content: ""; }
            }
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
            }
          }
        `;
        document.head.appendChild(printStyles);

        // 컨테이너에 클래스 추가
        container.classList.add('print-content');

        // 인쇄 실행
        window.print();

        // 스타일 정리
        document.head.removeChild(printStyles);
        container.classList.remove('print-content');

        // 정리 작업
        if (container && container.parentNode) document.body.removeChild(container);
      } catch (err) {
        console.error('PDF 생성 오류:', err);
        alert('PDF 출력 중 문제가 발생했습니다.');

        // 에러 발생 시 정리 작업
        try {
          if (container && container.parentNode) document.body.removeChild(container);
        } catch (cleanupErr) {
          console.error('정리 작업 중 오류:', cleanupErr);
        }
      } finally {
        setIsPrinting(false);
      }
    },
    [profile],
  );

  return { printSelectedItems, isPrinting };
}
