import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hdoqkfoyqcdjicfbsftu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Gbf9S1DFT-lFhZnBzVsoHw_v6XHjCu8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
