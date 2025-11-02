import { useParams } from "react-router-dom";
import CategoryMenuSidebar from "../components/CategoryMenuSidebar";
import GroupListLayout from "../components/layout/GroupListLayout";
import { slugToCategoryMap } from "../constants/categorySlugs";

function GroupListPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();

  // 한글 카테고리명 (메인/서브/전체)
  const activeCategory = slugToCategoryMap[slug ?? "all"] ?? "전체보기";

  // 메인 카테고리
  const mainCategories = [
    "운동/건강",
    "스터디/학습",
    "취미/여가",
    "봉사/사회참여",
    "전체보기",
  ];
  const mainCategory =
    mainCategories.find(
      (mc) =>
        activeCategory === mc ||
        {
          "운동/건강": ["구기활동", "실내활동", "힐링/건강관리", "실외활동"],
          "스터디/학습": ["학습/공부", "IT"],
          "취미/여가": [
            "예술/창작",
            "음악/공연/문화",
            "요리/제과·제빵",
            "게임/오락",
          ],
          "봉사/사회참여": ["복지/나눔", "캠페인"],
          전체보기: ["전체보기"],
        }[mc]?.includes(activeCategory),
    ) ?? "전체보기";

  return (
    <div className="mx-auto flex w-[1024px] gap-6 py-[56px] min-h-screen">
      <CategoryMenuSidebar />

      {/* mainCategory 추가로 전달 */}
      <GroupListLayout
        mainCategory={mainCategory}
        activeCategory={activeCategory}
        slug={slug ?? "all"}
      />
    </div>
  );
}

export default GroupListPage;
