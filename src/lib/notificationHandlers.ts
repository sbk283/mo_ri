// 좋아요, 공감, 문의, 그룹승인 등 알림 트리거 함수 모음

import { insertNotification } from './notify';

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
  await insertNotification({
    userId: reviewAuthorId,
    type: 'review_like',
    title: '리뷰 공감 알림',
    message: `${reviewerNickname}님이 당신의 리뷰에 공감했습니다.`,
    groupId,
    targetId: reviewId,
  });
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
  await insertNotification({
    userId: postAuthorId,
    type: 'post_like',
    title: '게시글 좋아요 알림',
    message: `${likerNickname}님이 당신의 게시글을 좋아합니다.`,
    groupId,
    targetId: postId,
  });
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
    type: 'inquiry',
    title: '새로운 문의 등록',
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
    type: 'inquiry_reply',
    title: '문의 답변 완료',
    message: `문의 "${inquiryDetail}"의 답변이 등록되었습니다.`,
  });
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
  await insertNotification({
    userId: creatorId,
    type: 'group_approved',
    title: '그룹 승인 완료',
    message: `당신의 그룹 "${groupTitle}"이 승인되었습니다.`,
    groupId,
    targetId: groupId,
  });
}
