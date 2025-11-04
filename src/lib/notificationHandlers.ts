// 좋아요, 공감, 문의, 그룹승인 등 알림 트리거 함수 모음

import { insertNotification } from "./notify";
import { supabase } from "./supabase";

/**
 * 리뷰 공감 알림 (리뷰 작성자에게)
 */
export async function notifyReviewLike({
  reviewAuthorId,
  reviewerNickname,
  groupId,
  reviewId,
}: {
  reviewAuthorId: string;
  reviewerNickname: string;
  groupId: string;
  reviewId: string;
}) {
  try {
    const { error } = await supabase.rpc("create_notification", {
      p_user_id: reviewAuthorId,
      p_type: "review_like",
      p_title: "리뷰 공감 알림",
      p_message: `${reviewerNickname}님이 당신의 리뷰에 공감했습니다.`,
      p_group_id: groupId,
      p_target_id: reviewId,
    });
    if (error) throw error;
    console.log("[notifyReviewLike] 알림 insert 완료");
  } catch (err) {
    console.error("[notifyReviewLike] 오류:", err);
  }
}

/**
 * 게시글 좋아요 알림 (게시글 작성자에게)
 */
export async function notifyPostLike({
  postAuthorId,
  likerNickname,
  groupId,
  postId,
}: {
  postAuthorId: string;
  likerNickname: string;
  groupId: string;
  postId: string;
}) {
  try {
    const { error } = await supabase.rpc("create_notification", {
      p_user_id: postAuthorId,
      p_type: "post_like",
      p_title: "게시글 좋아요 알림",
      p_message: `${likerNickname}님이 당신의 게시글을 좋아합니다.`,
      p_group_id: groupId,
      p_target_id: postId,
    });
    if (error) throw error;
    console.log("[notifyPostLike] 알림 insert 완료");
  } catch (err) {
    console.error("[notifyPostLike] 오류:", err);
  }
}

/**
 * 문의 등록 알림 (관리자에게)
 */
export async function notifyInquiryCreated({
  adminUserId,
  userNickname,
  inquiryId,
}: {
  adminUserId: string;
  userNickname: string;
  inquiryId: string;
}) {
  await insertNotification({
    userId: adminUserId,
    type: "inquiry_new",
    title: "새로운 문의 등록",
    message: `${userNickname}님이 새로운 문의를 등록했습니다.`,
    targetId: inquiryId,
  });
}

/**
 * 문의 답변 완료 알림 (문의 작성자에게)
 */
export async function notifyInquiryReply({
  inquiryWriterId,
  inquiryDetail,
}: {
  inquiryWriterId: string;
  inquiryDetail: string;
}) {
  await insertNotification({
    userId: inquiryWriterId,
    type: "inquiry_reply",
    title: "문의 답변 완료",
    message: `문의 "${inquiryDetail}"의 답변이 등록되었습니다.`,
  });

  console.log("[notifyInquiryReply] 알림 insert 완료", inquiryWriterId);
}

/**
 * 그룹 생성 승인 알림 (그룹 생성자에게)
 */
export async function notifyGroupApproved({
  creatorId,
  groupId,
  groupTitle,
}: {
  creatorId: string;
  groupId: string;
  groupTitle: string;
}) {
  try {
    const { error } = await supabase.rpc("create_notification", {
      p_user_id: creatorId,
      p_type: "group_approved",
      p_title: "그룹 승인 완료",
      p_message: `당신의 모임 "${groupTitle}"이 승인되었습니다.`,
      p_group_id: groupId,
      p_target_id: groupId,
    });
    if (error) throw error;
    console.log("[notifyGroupApproved] 알림 insert 완료");
  } catch (err) {
    console.error("[notifyGroupApproved] 오류:", err);
  }
}
