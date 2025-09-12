/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      // 다른 사이즈 는 직접 설정해주세요..
      fontSize: {
        xxl: '25px', // 대제목
        xl: '20px', // 중제목
        lg: '17px', // 소제목
        md: '15px', // 내용
        sm: '13px', // 작은 글씨
      },
      // 등록 안된 나머지 색상들은 피그마에서 찍어서 사용해주세요..
      // 비슷한 색상이면 brand,gray 색상 사용 권장합니다~
      colors: {
        brand: {
          DEFAULT: '#0689E8', //  기본 파랑 (채도 컬러 높은 색)
          light: '#4294CF', // 연한 파랑(모임생성 버튼 색)
          red: '#FF5252', // 레드 (모임리스트 색, 모집중 색)
          orange: '#FBAB17', // 오렌지(원데이, 장기, 단기 표시 색)
        },
        gray: {
          50: '#ffffff', //  화이트
          300: '#a3a3a3', //  (박스 테두리)
          400: '#3c3c3c', // 진한 회색 (title색)
          200: '#6c6c6c', // 진한 회색 (sub title)
          500: '#55555', //카테고리 메뉴 글씨 색상
        },
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.15)',
        cardInset: 'inset 0 2px 4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        sm: '5px',
      },
    },
  },
  plugins: [],
};
