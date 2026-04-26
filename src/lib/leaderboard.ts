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
  const { error } = await supabase.rpc('submit_score', {
    p_player_name: entry.player_name,
    p_character:   entry.character,
    p_continues:   entry.continues,
    p_time_ms:     entry.time_ms,
    p_score:       entry.score,
  })
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
