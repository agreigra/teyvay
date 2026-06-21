import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import type { Profile } from '../../../core/types/database';
import { listProfiles } from '../services/admin.service';

type State = {
  items: Profile[];
  loading: boolean;
  error: boolean;
  reload: () => void;
};

// Loads all user profiles for the admin user-management view and refreshes on
// focus.
export function useProfiles(): State {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setItems(await listProfiles());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { items, loading, error, reload: load };
}
