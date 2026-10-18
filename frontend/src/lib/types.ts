export type Item = {
  id: number; slug: string; title: string; summary: string;
  kind: 'course' | 'mission'; stage_id: number; minutes: number; xp: number;
  difficulty: string; icon: string; tags: string[]; completed: boolean;
  created_by_instructor: boolean;
};
export type Stage = {
  id: number; title: string; description: string; position: number; icon: string;
  accent: string; path: string | null; completed: number; total: number; items: Item[];
};
export type CareerPath = {
  slug: string; title: string; subtitle: string; description: string; icon: string; accent: string;
};
export type Learner = { name: string; initials: string; background: 'non_cs' | 'cs'; path: string | null;
  xp: number; streak: number; completed: number; total: number; progress: number; };
export type Student = { name: string; initials: string; completed: number; path: string; progress: number };
export type Assignment = { id: number; item: string; item_slug: string; kind: string; audience: string; due_date: string | null };
export type Bootstrap = {
  paths: CareerPath[]; learner: Learner; active_path: string;
  stages: Stage[]; items: Item[];
  instructor: { students: Student[]; assignments: Assignment[]; total_students: number;
    total_completions: number; average_progress: number; };
};
export type Lesson = { title: string; text: string };
export type MissionTask = { id: string; title: string; category: string; points: number };
export type ItemBody = {
  type?: 'sprint' | 'quiz'; lessons?: Lesson[]; scenario?: string;
  tasks?: MissionTask[]; question?: string; options?: string[]; correct?: number;
  explanation?: string; objectives?: string;
};
export type ItemDetail = { item: Item; stage_title: string; body: ItemBody };
export type SubmitResponse = { passed: boolean; score: number; feedback: string; xp_awarded: number; already_completed?: boolean };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result as T;
}
