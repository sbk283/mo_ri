import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { GroupCard, type GroupItem } from './GroupCard';

function BannerCardSwiper() {
  const groupList: GroupItem[] = [
    {
      id: 1,
      status: '모집중',
      statusColor: 'red',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 던전 공파 모집',
      desc: '혼자서 글렘 베르나 돌기 힘드네요. 같이 던전 도실 분 구해요.',
      dday: 'D-3',
      ad: true,
      thumbnail: 'https://picsum.photos/seed/1/300/160',
    },
    {
      id: 2,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 3,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 4,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 5,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 6,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 7,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
    {
      id: 8,
      status: '모집예정',
      statusColor: 'blue',
      category: '스포츠',
      region: '서울',
      title: '강남 클라이밍 모임',
      desc: '강남에서 클라이밍 함께할 분 찾습니다.',
      dday: 'D-5',
      ad: false,
      thumbnail: 'https://picsum.photos/seed/2/300/160',
    },
  ];

  return (
    <div className="relative w-[1024px] mx-auto">
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        spaceBetween={16}
        slidesPerView={4}
      >
        {groupList.map(item => (
          <SwiperSlide key={item.id}>
            <GroupCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
      {/* 화살표 버튼 */}
      <button className="swiper-button-next absolute top-1/2 -right-6 z-10">
        <img src="/images/arrow_down.svg" className="-rotate-90 w-4 h-4" />
      </button>
    </div>
  );
}

export default BannerCardSwiper;
