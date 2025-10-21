import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import PDFPreview from './PDFPreview';

export function usePDFPrintHandler() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printSelectedItems = useCallback(async (allMeetings: any[], selectedIds: string[]) => {
    if (!selectedIds || selectedIds.length === 0) {
      alert('출력할 항목을 선택해주세요.');
      return;
    }

    try {
      setIsPrinting(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // 선택된 모임만 필터링
      const selectedMeetings = allMeetings.filter(m => selectedIds.includes(m.id));
      if (selectedMeetings.length === 0) {
        alert('선택된 모임이 없습니다.');
        setIsPrinting(false);
        return;
      }

      // PDF용 임시 컨테이너 생성
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // React 컴포넌트를 HTML 문자열로 변환
      container.innerHTML = ReactDOMServer.renderToStaticMarkup(
        <PDFPreview items={selectedMeetings} />,
      );

      // 렌더 안정화
      await new Promise(res => setTimeout(res, 100));

      // 각 항목 단위(.pdf-card)로 처리
      const cards = Array.from(container.querySelectorAll('.pdf-card')) as HTMLElement[];
      if (cards.length === 0) {
        // fallback: 전체 container 캡처
        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#fff',
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        if (imgHeight <= pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        } else {
          // 여러 페이지로 나누기
          let remainingHeight = imgHeight;
          let position = 0;
          while (remainingHeight > 0) {
            const heightOnPage = Math.min(remainingHeight, pdfHeight);
            pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, imgHeight);
            remainingHeight -= pdfHeight;
            position += pdfHeight;
            if (remainingHeight > 0) pdf.addPage();
          }
        }
      } else {
        // 카드 단위로 페이지 추가
        for (let i = 0; i < cards.length; i++) {
          const canvas = await html2canvas(cards[i], {
            scale: 2,
            backgroundColor: '#fff',
            useCORS: true,
          });
          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;

          if (imgHeight <= pdfHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          } else {
            // 카드가 한 페이지보다 크면 분할
            let remainingHeight = imgHeight;
            let position = 0;
            while (remainingHeight > 0) {
              const heightOnPage = Math.min(remainingHeight, pdfHeight);
              pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, imgHeight);
              remainingHeight -= pdfHeight;
              position += pdfHeight;
              if (remainingHeight > 0) pdf.addPage();
            }
          }

          if (i < cards.length - 1) pdf.addPage();
        }
      }

      pdf.save('참여이력.pdf');
      document.body.removeChild(container);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert('PDF 출력 중 문제가 발생했습니다.');
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return { printSelectedItems, isPrinting };
}
