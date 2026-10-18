'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Bootstrap } from '@/lib/types';

type State = {
  data: Bootstrap | null; loading: boolean; error: string | null; refresh: () => Promise<void>;
  updateLearner: (changes: Record<string, string>) => Promise<void>;
};
const Context = createContext<State | null>(null);
export function DataProvider({children}: {children: ReactNode}) {
  const [data, setData] = useState<Bootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const fresh = await api<Bootstrap>('bootstrap/');
      setData(fresh); setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API unavailable');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const updateLearner = async (changes: Record<string, string>) => {
    await api('learner/', {method: 'PATCH', body: JSON.stringify(changes)});
    await refresh();
  };
  return <Context.Provider value={{data, loading, error, refresh, updateLearner}}>{children}</Context.Provider>;
}
export function useData() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useData needs DataProvider');
  return ctx;
}
