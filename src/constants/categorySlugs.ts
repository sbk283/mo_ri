export const categorySlugMap: Record<string, string> = {
  // 메인 카테고리
  "운동/건강": "health",
  "스터디/학습": "study",
  "취미/여가": "hobby",
  "봉사/사회참여": "volunteer",

  // 서브 카테고리
  "구기활동": "sports",
  "실내활동": "indoor-fitness",
  "힐링/건강관리": "wellness",
  "실외활동": "outdoor-activity",
  "학습/공부": "academics",
  "IT": "tech",
  "예술/창작": "creative-arts",
  "음악/공연/문화": "culture",
  "요리/제과·제빵": "culinary",
  "게임/오락": "gaming",
  "복지/나눔": "community-service",
  "캠페인": "advocacy",

  // 전체보기
  "전체보기": "all",
};

// 역매핑 (슬러그 → 한글)
export const slugToCategoryMap: Record<string, string> = Object.entries(
  categorySlugMap,
).reduce(
  (acc, [k, v]) => {
    acc[v] = k;
    return acc;
  },
  {} as Record<string, string>,
);
