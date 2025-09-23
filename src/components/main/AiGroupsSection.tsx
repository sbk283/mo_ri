import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { GroupCard, type Duration, type GroupItem } from '../common/GroupCard';

const FILTERS: { key: Duration; label: string }[] = [
  { key: 'oneday', label: '원데이 모임' },
  { key: 'short', label: '단기 모임' },
  { key: 'long', label: '장기 모임' },
];

export default function AiGroupsSection() {
  const [active, setActive] = useState<Duration>('oneday');

  const data: GroupItem[] = [
    // ===== 원데이 (4) =====
    {
      id: 1,
      status: '모집중',
      category: '요리/베이킹',
      region: '서울',
      title: '핸드드립 커피 원데이 클래스',
      desc: '싱글 오리진으로 핸드드립 처음부터 같이 배워요',
      dday: 'D-2',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: false,
    },
    {
      id: 2,
      status: '모집예정',
      category: '사진/영상',
      region: '부산',
      title: '해운대 노을 출사 원데이',
      desc: '구도/노출 기본 잡고 인생사진 남기자',
      dday: 'D-5',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: true,
    },
    {
      id: 3,
      status: '모집중',
      category: '공예/DIY',
      region: '인천',
      title: '도자기 머그컵 만들기',
      desc: '나만의 컵을 빚어보는 하루 체험',
      dday: 'D-1',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: false,
    },
    {
      id: 4,
      status: '모집중',
      category: '취미/여가',
      region: '온라인',
      title: '보드게임 번개 모임(원데이)',
      desc: '룰 설명부터 바로 실전! 라운드 돌려봐요',
      dday: 'D-3',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: true,
    },

    // ===== 단기 (4) =====
    {
      id: 5,
      status: '모집중',
      category: '운동/건강',
      region: '서울',
      title: '4주 러닝 기초반',
      desc: '호흡/폼 교정으로 5km 완주 도전',
      dday: 'D-6',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: true,
    },
    {
      id: 6,
      status: '모집예정',
      category: '스터디/자기개발',
      region: '온라인',
      title: '타입스크립트 스터디(2주 과정)',
      desc: '기본 타입부터 제네릭까지 핵심만 쫙',
      dday: 'D-9',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: false,
    },
    {
      id: 7,
      status: '모집중',
      category: '운동/건강',
      region: '대전',
      title: '3주 아침 요가 루틴',
      desc: '굿모닝 스트레칭으로 하루 시작',
      dday: 'D-4',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: true,
    },
    {
      id: 8,
      status: '모집중',
      category: '요리/베이킹',
      region: '대구',
      title: '4주 홈베이킹 클래스',
      desc: '스콘→쿠키→타르트→파운드까지',
      dday: 'D-8',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: false,
    },

    // ===== 장기 (4) =====
    {
      id: 9,
      status: '모집중',
      category: '스포츠',
      region: '부산',
      title: '3개월 자전거 라이딩 크루',
      desc: '주 2회 코스 탐방 & 기록 공유',
      dday: 'D-10',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: true,
    },
    {
      id: 10,
      status: '모집예정',
      category: '스터디/자기개발',
      region: '온라인',
      title: '12주 영어 회화 챌린지',
      desc: '롤플레이 & 발음 교정으로 자신감 업',
      dday: 'D-12',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: false,
    },
    {
      id: 11,
      status: '모집중',
      category: '봉사/사회참여',
      region: '광주',
      title: '10주 반려동물 보호소 봉사',
      desc: '산책/청소/기록 프로젝트로 꾸준 봉사',
      dday: 'D-14',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: true,
    },
    {
      id: 12,
      status: '모집중',
      category: '운동/건강',
      region: '제주',
      title: '12주 클라이밍 중급반',
      desc: '볼더링 테크닉 & 코어 강화 프로그램',
      dday: 'D-11',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: false,
    },
    {
      id: 13,
      status: '모집중',
      category: '요리/베이킹',
      region: '서울',
      title: '핸드드립 커피 원데이 클래스',
      desc: '싱글 오리진으로 핸드드립 처음부터 같이 배워요',
      dday: 'D-2',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: true,
    },
    {
      id: 14,
      status: '모집예정',
      category: '사진/영상',
      region: '부산',
      title: '해운대 노을 출사 원데이',
      desc: '구도/노출 기본 잡고 인생사진 남기자',
      dday: 'D-5',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: false,
    },
    {
      id: 15,
      status: '모집중',
      category: '공예/DIY',
      region: '인천',
      title: '도자기 머그컵 만들기',
      desc: '나만의 컵을 빚어보는 하루 체험',
      dday: 'D-1',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: true,
    },
    {
      id: 16,
      status: '모집중',
      category: '취미/여가',
      region: '온라인',
      title: '보드게임 번개 모임(원데이)',
      desc: '룰 설명부터 바로 실전! 라운드 돌려봐요',
      dday: 'D-3',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'oneday',
      favorite: false,
    },

    // ===== 단기 (4) =====
    {
      id: 17,
      status: '모집중',
      category: '운동/건강',
      region: '서울',
      title: '4주 러닝 기초반',
      desc: '호흡/폼 교정으로 5km 완주 도전',
      dday: 'D-6',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: true,
    },
    {
      id: 18,
      status: '모집예정',
      category: '스터디/자기개발',
      region: '온라인',
      title: '타입스크립트 스터디(2주 과정)',
      desc: '기본 타입부터 제네릭까지 핵심만 쫙',
      dday: 'D-9',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: false,
    },
    {
      id: 19,
      status: '모집중',
      category: '운동/건강',
      region: '대전',
      title: '3주 아침 요가 루틴',
      desc: '굿모닝 스트레칭으로 하루 시작',
      dday: 'D-4',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: true,
    },
    {
      id: 20,
      status: '모집중',
      category: '요리/베이킹',
      region: '대구',
      title: '4주 홈베이킹 클래스',
      desc: '스콘→쿠키→타르트→파운드까지',
      dday: 'D-8',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'short',
      favorite: false,
    },

    // ===== 장기 (4) =====
    {
      id: 21,
      status: '모집중',
      category: '스포츠',
      region: '부산',
      title: '3개월 자전거 라이딩 크루',
      desc: '주 2회 코스 탐방 & 기록 공유',
      dday: 'D-10',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: true,
    },
    {
      id: 22,
      status: '모집예정',
      category: '스터디/자기개발',
      region: '온라인',
      title: '12주 영어 회화 챌린지',
      desc: '롤플레이 & 발음 교정으로 자신감 업',
      dday: 'D-12',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: false,
    },
    {
      id: 23,
      status: '모집중',
      category: '봉사/사회참여',
      region: '광주',
      title: '10주 반려동물 보호소 봉사',
      desc: '산책/청소/기록 프로젝트로 꾸준 봉사',
      dday: 'D-14',
      ad: true,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: true,
    },
    {
      id: 24,
      status: '모집중',
      category: '운동/건강',
      region: '제주',
      title: '12주 클라이밍 중급반',
      desc: '볼더링 테크닉 & 코어 강화 프로그램',
      dday: 'D-11',
      ad: false,
      thumbnail: '/images/group_img.png',
      duration: 'long',
      favorite: false,
    },
  ];

  const filtered = useMemo(() => data.filter(d => d.duration === active), [active, data]);

  return (
    <section className="mx-auto w-[1024px]" aria-labelledby="ai-groups-heading">
      <div className="mx-auto">
        <header className="pt-[40px] pb-[18px]">
          <h2 id="ai-groups-heading" className="font-semibold text-lg mb-2">
            AI가 선별한
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">나만의 취향 맞춤 모임!</p>
              <Link to="/grouplist" className="flex items-center text-sm gap-1 pb-1">
                <img src={Plus} alt="" aria-hidden="true" />
                더보기
              </Link>
            </div>

            <div className="flex gap-2" role="tablist" aria-label="모임 기간 필터">
              {FILTERS.map(f => {
                const isActive = active === f.key;
                return (
                  <button
                    key={f.key}
                    aria-selected={isActive}
                    aria-pressed={isActive}
                    onClick={() => setActive(f.key)}
                    className={[
                      'py-1 rounded-[5px] text-[16px] border w-[128px]',
                      isActive
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-blue-600 border-blue-400 hover:bg-blue-50',
                    ].join(' ')}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <ul
          className="
            grid gap-[12px] mb-[80px]
            grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
            place-items-stretch overflow-x-auto pb-2 w-[1024px]
          "
        >
          {filtered.length ? (
            filtered.slice(0, 8).map(item => <GroupCard key={item.id} item={item} />)
          ) : (
            <li className="text-sm text-gray-500 py-8 col-span-full">조건에 맞는 모임이 없어요.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
