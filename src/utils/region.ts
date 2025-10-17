// "서울특별시 강남구" → { sido: "서울특별시", sigungu: "강남구" }
export function parseRegion(region: string | undefined | null) {
  if (!region) return { sido: '', sigungu: '' };
  const [sido, sigungu] = region.split(' ');
  return { sido: sido || '', sigungu: sigungu || '' };
}

// 시/도 + 시군구 → "서울특별시 강남구"
export function combineRegion(sido: string, sigungu: string) {
  if (!sido) return '';
  return sigungu ? `${sido} ${sigungu}` : sido;
}
