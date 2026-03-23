import { supabase } from './supabase'

export interface ScoreEntry {
  id?: string
  player_name: string
  character: string
  continues: number
  time_ms: number
  score: number
  created_at?: string
}

export async function saveScore(entry: ScoreEntry): Promise<void> {
  const { error } = await supabase.from('scores').insert(entry)
  if (error) throw new Error(error.message)
}

export async function getTopTen(): Promise<ScoreEntry[]> {
  const { data } = await supabase
    .from('scores')
    .select('*')
    .order('continues', { ascending: true })
    .order('time_ms',   { ascending: true })
    .order('score',     { ascending: false })
    .limit(10)
  return (data ?? []) as ScoreEntry[]
}
