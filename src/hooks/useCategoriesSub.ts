import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { categorySub } from '../types/loginType';

export function useCategorySubs() {
  const [subCategories, setSubCategories] = useState<categorySub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from<'categories_sub', categorySub>('categories_sub')
          .select('sub_id, category_sub_name, major_id, category_sub_slug')
          .order('category_sub_name', { ascending: true });

        if (error) {
          setError(error);
          return;
        }
        if (data) setSubCategories(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  return { subCategories, loading, error };
}
