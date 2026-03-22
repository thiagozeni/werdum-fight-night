# Art Direction

## Estilo Visual

Pixel art retrô com influência 16-bit. Os sprites dos personagens têm nível de detalhe acima da média dos jogos da era — mais próximo de Street Fighter III ou Streets of Rage 4 do que do SNES clássico.

O cenário de fundo usa uma abordagem mista: fotorrealista na sua base (arena SHATEN real), com elementos em pixel art sobrepostos (público, personagens, UI).

---

## Assets Disponíveis

### Cenários

| Arquivo | Descrição | Uso |
|---|---|---|
| `cenario/16bit.png` | Ringue pixel art sem público | Background principal do jogo |
| `cenario/16bit-crowd.png` | Ringue pixel art com público | Background durante waves |
| `cenario/16bit-family.png` | Ringue com família no corner | Tela de abertura / intro |
| `cenario/real.png` | Ringue fotorrealista | Referência / tela de loading |

### Vídeos

| Arquivo | Descrição | Uso sugerido |
|---|---|---|
| `videos/Back-intro-1080.mp4` | Animação de abertura (1080p) | Tela de título / intro |
| `videos/Back-loop-1080.mp4` | Background animado em loop (1080p) | Background durante o jogo (desktop) |
| `videos/Back-loop-720.mp4` | Background animado em loop (720p) | Background durante o jogo (mobile) |

### Personagens

| Arquivo | Personagem | Tipo |
|---|---|---|
| `personagens/werdum.png` | Fabricio Werdum | Jogável |
| `personagens/dida.png` | Dida | Jogável |
| `personagens/thor.png` | Thor | Jogável |
| `personagens/wand.png` | Wanderlei Silva | Protegido |
| `personagens/popo.png` | Popó | Boss final |
| `personagens/popo-son.png` | Filho do Popó | Mini-boss |
| `personagens/popo-coach.png` | Treinador do Popó | Boss intermediário |
| `personagens/judge.png` | Árbitro | NPC / Game Over |
| `personagens/family.png` | Família (3 pessoas) | NPC / tela de intro |
| `personagens/bad-guy-1.png` | Capanga variante 1 | Inimigo |
| `personagens/bad-guy-2.png` | Capanga variante 2 | Inimigo |
| `personagens/bad-guy-3.png` | Capanga variante 3 | Inimigo |
| `personagens/bad-guy-fat.png` | Capanga gordão | Inimigo |
| `personagens/bad-guy-strong.png` | Capanga fortão | Inimigo |
| `personagens/bad-guy-chair.png` | Capanga com cadeira | Inimigo |

---

## Especificações de Sprites

Altura recomendada para os sprites em jogo: **96 px**

Canvas de referência por sprite: **128 × 128 px**

---

## Animações Necessárias por Personagem

### Personagens Jogáveis (Werdum, Dida, Thor)

| Animação | Frames (estimado) |
|---|---|
| Idle | 4 |
| Walk | 6 |
| Punch | 4 |
| Kick | 5 |
| Jump | 4 |
| Jump Punch | 4 |
| Jump Kick (voadora) | 5 |
| Block (início + loop) | 3 |
| Hit (receber golpe) | 3 |
| Knockdown | 5 |
| Get Up | 4 |
| Victory (pose de vitória) | 6 |

### Inimigos Básicos

| Animação | Frames (estimado) |
|---|---|
| Walk | 6 |
| Punch | 4 |
| Kick | 4 |
| Hit | 3 |
| Knockdown | 5 |
| Get Up | 4 |

### Chefões (Popó, Filho, Treinador)

Mesmas animações dos jogáveis, com adição de:

| Animação | Frames (estimado) |
|---|---|
| Grab (agarrão) | 6 |
| Rage (fase 2) | 4 |

---

## Paleta de Cores de Referência

Extraída dos sprites existentes:

- **Verde VULKANO/SPATEN**: `#2D6A2D` (cor dos inimigos)
- **Shorts SILVA**: `#1A6B1A` / dourado `#C9A84C`
- **Ringue**: cordas brancas sobre fundo escuro da arena
- **Fundo arena**: tons de cinza escuro / azul noturno com iluminação spot

---

## Telas Ainda Sem Arte

As seguintes telas precisarão de assets criados:

- Tela de título
- Seleção de personagem
- HUD em jogo (barras de vida, número da wave)
- Tela de Game Over (árbitro contando)
- Tela de vitória
