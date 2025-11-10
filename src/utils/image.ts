// 이미지 최적화 유틸 함수

export function optimizeImageUrl(
  url: string | undefined | null,
  width = 320,
  quality = 70
) {
  if (!url) return "/nullbg.jpg";

  // Supabase Transformation 파라미터
  return `${url}?width=${width}&quality=${quality}&format=webp`;
}