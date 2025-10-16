import { supabase } from './supabase';

export async function saveUserInterests(user_id: string, category_sub_ids: string[]) {
  if (category_sub_ids.length === 0) {
    console.log('No category_sub_ids to save.');
    return { data: null, error: null };
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('user_interests')
    .select('category_sub_id')
    .eq('user_id', user_id);

  if (fetchErr) {
    console.error('Fetch existing interests error', fetchErr);
    return { data: null, error: fetchErr };
  }

  const existingIds = existing?.map(i => i.category_sub_id) ?? [];
  const toInsert = category_sub_ids.filter(id => !existingIds.includes(id));

  if (toInsert.length === 0) {
    console.log('All interests already exist.');
    return { data: null, error: null };
  }

  const inserts = toInsert.map(category_sub_id => ({ user_id, category_sub_id }));
  const { data, error } = await supabase.from('user_interests').insert(inserts);

  if (error) {
    console.error('Insert interests error:', error);
  } else {
    console.log('Inserted interests:', data);
  }

  return { data, error };
}
