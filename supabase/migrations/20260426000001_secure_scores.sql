-- Secure leaderboard: bloqueia INSERT/UPDATE/DELETE direto via anon key
-- e força submissões através da RPC submit_score, que valida payload.
--
-- Antes desta migration: cliente fazia INSERT direto na tabela scores.
-- Qualquer pessoa com a publishable key (que é pública por design) podia
-- gravar scores arbitrários via DevTools. Cheat trivial.
--
-- Depois: SELECT continua público (leaderboard mostra ranking pra todos),
-- mas escrita só via submit_score, que aplica:
--   - sanitização de nome (trim, max 20 chars, sem control chars)
--   - whitelist de personagens
--   - ranges plausíveis (continues 0-99, tempo 60s-1h, score 0-999999)
--
-- Não é anti-cheat completo (cliente ainda calcula score), mas eleva o
-- custo de cheat de "abrir DevTools" para "engenharia reversa do build".

-- 1. Habilita RLS na tabela scores
alter table public.scores enable row level security;

-- 2. Remove políticas anteriores (defensivo — schema atual desconhecido localmente)
drop policy if exists "scores_anon_insert"   on public.scores;
drop policy if exists "scores_anon_all"      on public.scores;
drop policy if exists "scores_public_insert" on public.scores;
drop policy if exists "scores_public_write"  on public.scores;
drop policy if exists "Allow insert for all" on public.scores;
-- Políticas custom encontradas em produção no deploy de 2026-04-26.
-- "public insert" tinha with_check=true (qualquer um podia inserir — o bug original).
-- "public select" era redundante com scores_public_read.
drop policy if exists "public insert"        on public.scores;
drop policy if exists "public select"        on public.scores;

-- 3. Política de leitura pública (leaderboard é público)
drop policy if exists "scores_public_read" on public.scores;
create policy "scores_public_read"
  on public.scores
  for select
  to anon, authenticated
  using (true);

-- Sem políticas de INSERT/UPDATE/DELETE = negado com RLS habilitado.
-- Escrita só via RPC abaixo, que roda como SECURITY DEFINER.

-- 4. Revoga permissões diretas de escrita
revoke insert, update, delete on public.scores from anon, authenticated;

-- 5. RPC submit_score com validações
create or replace function public.submit_score(
  p_player_name text,
  p_character   text,
  p_continues   int,
  p_time_ms     int,
  p_score       int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id         uuid;
  v_clean_name text;
begin
  -- Nome: remove caracteres de controle, trim, limita a 20 chars
  v_clean_name := substring(
    regexp_replace(coalesce(p_player_name, ''), '[[:cntrl:]]', '', 'g')
    from 1 for 20
  );
  v_clean_name := trim(v_clean_name);
  if length(v_clean_name) = 0 then
    raise exception 'invalid_name';
  end if;

  -- Personagem: whitelist
  if p_character not in ('werdum', 'dida', 'thor') then
    raise exception 'invalid_character';
  end if;

  -- Continues: 0..99
  if p_continues is null or p_continues < 0 or p_continues > 99 then
    raise exception 'invalid_continues';
  end if;

  -- Tempo: entre 60s (speedrun floor plausível) e 1h
  if p_time_ms is null or p_time_ms < 60000 or p_time_ms > 3600000 then
    raise exception 'invalid_time';
  end if;

  -- Score: 0..999999
  if p_score is null or p_score < 0 or p_score > 999999 then
    raise exception 'invalid_score';
  end if;

  insert into public.scores (player_name, "character", continues, time_ms, score)
  values (v_clean_name, p_character, p_continues, p_time_ms, p_score)
  returning id into v_id;

  return v_id;
end;
$$;

-- 6. Permite que anon e authenticated chamem a RPC
grant execute on function public.submit_score(text, text, int, int, int)
  to anon, authenticated;
