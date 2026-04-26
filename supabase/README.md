# Supabase — leaderboard

Tabela `scores` armazena entradas do ranking. Schema mínimo esperado:

```
scores (
  id          uuid    primary key default gen_random_uuid(),
  player_name text    not null,
  character   text    not null,
  continues   int     not null,
  time_ms     int     not null,
  score       int     not null,
  created_at  timestamptz default now()
)
```

## Migrations

`migrations/` contém SQL versionado. Aplicar em ordem cronológica.

### `20260426000001_secure_scores.sql`

Habilita RLS na tabela, bloqueia INSERT direto via anon e cria a RPC
`submit_score(p_player_name, p_character, p_continues, p_time_ms, p_score)`
com validação de payload. Resolve cheat trivial via DevTools.

## Como aplicar

### Opção 1 — SQL Editor do dashboard (mais simples)

1. Abrir https://supabase.com/dashboard/project/hdoqkfoyqcdjicfbsftu/sql/new
2. Colar conteúdo de `migrations/20260426000001_secure_scores.sql`
3. Run
4. Verificar:
   - `Authentication → Policies` → tabela `scores` deve mostrar só
     `scores_public_read` (SELECT).
   - `Database → Functions` → `submit_score` deve aparecer.

### Opção 2 — Supabase CLI (preferido a longo prazo)

```bash
brew install supabase/tap/supabase
cd /Users/pro15/Claude/3-contra-todos/game
supabase link --project-ref hdoqkfoyqcdjicfbsftu
supabase db push
```

Pré-requisito: ter access token do Supabase (gerar em
https://supabase.com/dashboard/account/tokens, exportar como
`SUPABASE_ACCESS_TOKEN`).

## Smoke test pós-deploy

No DevTools do jogo (em `localhost:5173` ou no `/demo`):

```js
// Deve falhar com 'permission denied' ou 'invalid_*'
await window.supabase.from('scores').insert({
  player_name: 'cheat',
  character: 'werdum',
  continues: 0,
  time_ms: 100,
  score: 999999
})

// Deve falhar (tempo abaixo do mínimo)
await window.supabase.rpc('submit_score', {
  p_player_name: 'cheat',
  p_character:   'werdum',
  p_continues:   0,
  p_time_ms:     1000,
  p_score:       999
})

// Deve passar
await window.supabase.rpc('submit_score', {
  p_player_name: 'teste',
  p_character:   'werdum',
  p_continues:   2,
  p_time_ms:     900000,
  p_score:       12345
})
```

(O cliente Supabase está exposto no jogo via `import { supabase } from
'./lib/supabase'`, mas no console o módulo fica em `window` só se você
expuser explicitamente. Alternativa: usar a aba **API** do dashboard pra
testar a RPC com os mesmos parâmetros.)

## Limitações conhecidas

Esta migration **não** impede:

- Engenharia reversa do build pra extrair a publishable key e chamar a
  RPC com payload válido (mas inflado dentro dos ranges).
- Replay attack: chamar `submit_score` repetidas vezes com o mesmo payload.

Mitigações futuras (P1+):

- Rate limit por IP via edge function.
- `run_token` HMAC: token gerado no início da partida, validado no servidor
  como não-reutilizável.
- Migrar leaderboard custom pra Game Center + Google Play Games Services
  e desligar Supabase para scores (anti-cheat de plataforma é melhor).
