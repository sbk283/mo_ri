// Node.js/Next.js 예시
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  const { groupId, userEmail } = req.body;
  if (userEmail !== 'wltjs6668@naver.com') {
    return res.status(403).json({ error: '관리자만 승인 가능합니다.' });
  }

  const { data, error } = await supabaseAdmin
    .from('groups')
    .update({ approved: true })
    .eq('group_id', groupId)
    .select();

  if (error) return res.status(500).json({ error });
  return res.status(200).json({ data });
}
