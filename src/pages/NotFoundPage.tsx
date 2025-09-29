// 이야 AI 쥑이네 404 not Found

import { HomeOutlined, LeftOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import NotFoundFloatingBits from '../components/NotFoundloatingBits';

export default function NotFoundPage() {
  const navigate = useNavigate();

  // keyboard shortcut: B = 백키 (뒤로가기) 아.. 별로라 지움
  //   useEffect(() => {
  //     const onKey = (e: KeyboardEvent) => {
  //       if (e.key.toLowerCase() === 'b') navigate(-1);
  //     };
  //     window.addEventListener('keydown', onKey);
  //     return () => window.removeEventListener('keydown', onKey);
  //   }, [navigate]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-b from-white via-[#f7fbff] to-[#eef6ff] dark:from-[#0b1020] dark:via-[#0a0f1c] dark:to-[#070b14]">
      {/* soft glow backdrop */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl bg-brand/30 dark:bg-brand/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-32 h-[560px] w-[560px] rounded-full opacity-40 blur-3xl bg-sky-300/40 dark:bg-sky-600/30"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />

      {/* floating deco shapes */}
      <NotFoundFloatingBits />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-[980px] flex-col items-center justify-center px-6">
        {/* 404 위에 헤드라인? */}
        <motion.h1
          className="select-none text-[100px] leading-none font-extrabold tracking-tight sm:text-[140px] bg-clip-text text-transparent 
          bg-[linear-gradient(135deg,#121826,30%,#2563eb,70%,#06b6d4)] dark:bg-[linear-gradient(135deg,#5eead4,20%,#60a5fa,70%,#f472b6)] drop-shadow-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative inline-block">
            {/* 배경 이미지 */}
            <img src="404.png" alt="이미지" className="block" />

            {/* 이미지, 텍스트 */}
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-[200px] left-[325px] z-40 font-extrabold text-transparent bg-clip-text bg-gradient-to-t 
              from-brand to-sky-400 text-[100px] leading-none drop-shadow-2xl"
            >
              404
            </motion.span>
          </div>
        </motion.h1>

        {/* subtitle */}
        <motion.p
          className="mt-3 text-center text-balance text-gray-600 dark:text-gray-300 sm:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="text-brand font-bold text-4xl">페이지를 찾을 수 없습니다.</h2>
          <p className="mt-4 text-lg">
            현재 입력하신 주소의 페이지는 삭제되었거나, 다른 페이지로 변경되었습니다.
          </p>
          <p className="text-lg">주소를 다시 확인하신 후 시도해주세요.</p>
        </motion.p>

        {/* 검색 / 액션들 */}
        <motion.div
          className="mt-8 flex w-full flex-col justify-center items-center gap-3 sm:flex-row"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="w-full sm:max-w-[520px]">
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="모임, 주제, 닉네임으로 검색해보기"
              onPressEnter={e => {
                const q = (e.target as HTMLInputElement).value?.trim();
                if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title="이전 페이지(B)">
              <Button size="large" icon={<LeftOutlined />} onClick={() => navigate(-1)}>
                뒤로가기
              </Button>
            </Tooltip>
            <Tooltip title="홈으로">
              <Button
                size="large"
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                className="!bg-brand hover:!bg-brand/90"
              >
                홈 가기
              </Button>
            </Tooltip>
          </div>
        </motion.div>

        {/* helper links */}
        <motion.div
          className="mt-6 text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          문제가 지속되면{' '}
          <Link
            to="/inquiry"
            className="underline underline-offset-4 hover:no-underline text-brand"
          >
            문의하기
          </Link>{' '}
          또는{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
            aria-label="새로고침"
          >
            새로고침 <ReloadOutlined />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
