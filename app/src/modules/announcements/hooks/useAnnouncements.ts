import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { Announcement } from '../../../core/types/database';
import { listActive, listAll, listMine } from '../services/announcements.service';

export type ListScope = 'active' | 'mine' | 'all';

type State = {
  items: Announcement[];
  loading: boolean;
  error: boolean;
  reload: () => void;
};

// Loads listings for the given scope and refreshes whenever the screen regains
// focus (so a newly created listing appears without a manual refresh).
export function useAnnouncements(scope: ListScope, userId?: string): State {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let data: Announcement[];
      if (scope === 'mine') data = userId ? await listMine(userId) : [];
      else if (scope === 'all') data = await listAll();
      else data = await listActive();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [scope, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { items, loading, error, reload: load };
}
