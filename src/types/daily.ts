export type Daily = {
  id: number;
  writer?: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  views?: number;
  isRead: boolean;
  likedCount?: number;
  imageUrl?: string | null;
};
