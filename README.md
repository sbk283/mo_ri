# project (Mo:ri🎇)

# README 를 잘 읽으시고 작업 진행 부탁드립니다.

계획* ( 2025-08-25 ~ 2025-11-13*최종 발표일)

Mo:ri 은 자기계발 모임 서비스 앱 입니다.
이미 시중에는 많은 모임서비스가 활성화 되어있지만, 친목성의 모임이 너무 많아 생각하게 된 서비스입니다.
자기계발 유형의 스터디 모임을 참여하고, 기록을 남겨서 후에 자기성장과 더 나아가 취업 이력에 도움이 되도록 하는것이 서비스의 목표입니다.

## 목표

취미, 스터디, 운동, 봉사, 원데이클래스 등 다양한 모임을 생성·참여·관리할 수 있는 소셜 플랫폼 구현

## 주요 타깃

취미·네트워킹·자기계발에 관심 있는 20~30대, 스터디 모임을 원하는 대학생, 직장인, 프리랜서 누구나

## 핵심 경험

- 모임 정보 탐색·생성·참여
- 일정/인증/후기 등 실제 활동에 적합한 기능
- 내 참여 이력, 랭킹·포인트 등 동기부여 시스템

---

# npm 설치 항목

- 🎈각자 작업시 필요한 npm 자유롭게 설치 하시고, 항목 추가 부탁드립니다!

```bash
npm i moment
npm i dayjs
npm i react-calendar
npm install antd --save
npm i -D tailwindcss@3.4.10 postcss@8.4.38 autoprefixer@10.4.20
npm i swiper

npm i @fullcalendar/react @fullcalendar/core \
      @fullcalendar/daygrid @fullcalendar/timegrid \
      @fullcalendar/interaction @fullcalendar/list


npm i react-router-dom@6.30.1
npm install axios

npm install motion
npm i framer-motion

npm i react-icons

npm i react-quill
npm i quill
npm i dompurify

# 사용시에 꼭 추가해주세요
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(칼럼) }}


npm i react-infinite-scroll-component
npm install swiper

npm install react-hook-form --force

```

# 작업 진행시

- 꼭! 브랜치 생성후 pr 부탁드립니다.(main 에서 작업 하시면 안되요.)

# supabase

```bash
npm install @supabase/supabase-js
```

- supabase 로그인 -> 유비님
- `scripts` 에 항목 작성 (`npm run generate-types`)

- package.json

```json
 "scripts": {
     ...
    "generate-types": "npx supabase gen types typescript --project-id 아이디 --schema public > types_db.ts"
  },
```

- scripts 추가는 해두었는데 데이터베이스 누구 계정으로 할건지? 얘기해 보고 id 입력하는걸로!

# 편하신대로 작업하되, 폴더 분류 확실하게 해주세요.

- 컴포넌트 분리 잘 해주세요.!!!
- console.log(방어코드 제외) 확인후 삭제 해주세요.
- 작업 순서는 기획 → 피그마 → DB 테이블 → UI 구현 → 기능 구현 순서로 진행 할 예정입니다..
