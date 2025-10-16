export type Notice = {
  id: number;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  views?: number;
  isRead: boolean;
};
