// src/pages/GroupReviewsPage.tsx
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import GroupManagerLayout from "../components/layout/GroupManagerLayout";
import ReviewBar from "../components/common/ReviewBar";
import type { ReviewItem } from "../components/common/ReviewCard";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "../components/common/LoadingSpinner";

const fmt = (d?: string | null) => (d ? d.replace(/-/g, ".") : "");
const NO_IMAGE = "/images/no_image.jpg";

type ReviewRow = {
  review_id: string;
  group_id: string;
  author_id: string;
  rating: number;
  pros_text: string | null;
  created_at: string;
  groups: {
    group_title: string | null;
    image_urls: string[] | null;
    status: string | null;
    group_start_day: string | null;
    group_end_day: string | null;
    sub_id: string | null;
    categories_sub: {
      categories_major: { category_major_name: string | null } | null;
    } | null;
  } | null;
};

type TagDict = { tag_code: string; label: string };
type TagRow = { review_id: string; tag_code: string };

export default function GroupReviewsPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [numToReviewId, setNumToReviewId] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);

      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {
        if (!ignore) {
          setItems([]);
          setNumToReviewId({});
          setLoading(false);
        }
        return;
      }

      const selectSQL = `
        review_id, group_id, author_id, rating, pros_text, created_at,
        groups:group_id (
          group_title, image_urls, status, group_start_day, group_end_day, sub_id,
          categories_sub:sub_id (
            categories_major:major_id ( category_major_name )
          )
        )
      ` as const;

      const { data: rows, error } = await supabase
        .from("group_reviews")
        .select(selectSQL)
        .eq("author_id", uid)
        .order("created_at", { ascending: false })
        .returns<ReviewRow[]>();

      if (error) {
        console.error("[GroupReviewsPage] load error", error);
        if (!ignore) setLoading(false);
        return;
      }

      if (!rows?.length) {
        if (!ignore) {
          setItems([]);
          setNumToReviewId({});
          setLoading(false);
        }
        return;
      }

      const { data: dict } = await supabase
        .from("review_tag_dict")
        .select("tag_code,label")
        .returns<TagDict[]>();
      const labelByCode = Object.fromEntries(
        (dict ?? []).map((d) => [d.tag_code, d.label]),
      );

      const reviewIds = rows.map((r) => r.review_id);
      const { data: tagRows } = await supabase
        .from("group_review_tags")
        .select("review_id, tag_code")
        .in("review_id", reviewIds)
        .order("tag_code", { ascending: true })
        .returns<TagRow[]>();

      const tagsByReview: Record<string, string[]> = {};
      (tagRows ?? []).forEach((tr) => {
        const label = labelByCode[tr.tag_code] ?? tr.tag_code;
        (tagsByReview[tr.review_id] ??= []).push(label);
      });

      const numMap: Record<number, string> = {};
      const mapped: ReviewItem[] = rows.map((r, idx) => {
        const g = r.groups;
        const major =
          g?.categories_sub?.categories_major?.category_major_name?.trim() ??
          "기타";

        const n = idx + 1;
        numMap[n] = r.review_id;

        const start = fmt(g?.group_start_day);
        const end = fmt(g?.group_end_day);

        return {
          id: n,
          title: g?.group_title ?? "(제목 없음)",
          category: major,
          status:
            (g?.status ?? "").toLowerCase() === "closed" ? "종료" : "진행중",
          src: g?.image_urls?.[0] || NO_IMAGE,
          rating: Math.min(5, Math.max(1, r.rating ?? 5)) as 1 | 2 | 3 | 4 | 5,
          period: start && end ? `${start} ~ ${end}` : "",
          content: r.pros_text ?? "",
          tags: [...new Set(tagsByReview[r.review_id] ?? [])],
          created_at: r.created_at,
          created_id: "",
        };
      });

      if (!ignore) {
        setItems(mapped);
        setNumToReviewId(numMap);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEdit = async (id: number, updated: Partial<ReviewItem>) => {
    const reviewId = numToReviewId[id];
    if (!reviewId) return;

    const payload: { rating?: number; pros_text?: string } = {};
    if (typeof updated.rating === "number") payload.rating = updated.rating;
    if (typeof updated.content === "string")
      payload.pros_text = updated.content;

    if (Object.keys(payload).length) {
      const { error } = await supabase
        .from("group_reviews")
        .update(payload)
        .eq("review_id", reviewId);
      if (error) {
        console.error("[GroupReviewsPage] update error", error);
        alert("수정 중 오류가 발생했습니다.");
        return;
      }
    }

    if (Array.isArray(updated.tags)) {
      const { data: dict } = await supabase
        .from("review_tag_dict")
        .select("tag_code,label")
        .returns<TagDict[]>();
      const codeByLabel = new Map<string, string>(
        (dict ?? []).map((d) => [d.label.trim(), d.tag_code]),
      );

      const codes = updated.tags
        .map((lbl) => codeByLabel.get(String(lbl).trim()))
        .filter((v): v is string => !!v);

      const { error: delErr } = await supabase
        .from("group_review_tags")
        .delete()
        .eq("review_id", reviewId);
      if (delErr) {
        console.error("tags delete error", delErr);
      } else if (codes.length) {
        const rows = codes.map((c) => ({ review_id: reviewId, tag_code: c }));
        const { error: insErr } = await supabase
          .from("group_review_tags")
          .insert(rows);
        if (insErr) console.error("tags insert error", insErr);
      }
    }

    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updated } : it)),
    );
  };

  const handleDelete = async (id: number) => {
    const reviewId = numToReviewId[id];
    if (!reviewId) return;
    const { error } = await supabase
      .from("group_reviews")
      .delete()
      .eq("review_id", reviewId);
    if (error) {
      console.error("[GroupReviewsPage] delete error", error);
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const list = useMemo(() => {
    if (loading)
      return (
        <div className="mb-20">
          <LoadingSpinner />
        </div>
      );

    if (!items.length)
      return (
        <div className="text-center text-gray-400 text-lg py-20 mb-20">
          <div>
            리뷰할 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을
            시작해보세요!
          </div>
          <a
            href="/grouplist"
            className="text-brand font-md mt-[19px] inline-block"
          >
            모임 참여하러 가기 {">"}
          </a>
        </div>
      );

    return (
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <motion.ul
            key={item.id}
            layout
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ReviewBar
              review={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </motion.ul>
        ))}
      </ul>
    );
  }, [items, loading]);

  return (
    <GroupManagerLayout>
      <div className="text-xl font-bold text-gray-400 mb-[21px]">
        모임관리 {">"} 후기/리뷰 관리
      </div>

      <div className="flex gap-[12px] mb-6">
        <div className="border-r border-brand border-[3px]" />
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            내가 남긴 모든 후기와 리뷰를 한눈에 모아볼 수 있습니다.
          </div>
          <div className="text-md">
            작성한 후기들을 확인하며 소중한 경험을 관리해보세요.
          </div>
        </div>
      </div>

      <section className="space-y-4 mb-10">{list}</section>
    </GroupManagerLayout>
  );
}
