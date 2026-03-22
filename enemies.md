# Enemies

Todos os inimigos básicos vestem camiseta verde **VULKANO + SPATEN** e calça preta.

---

## Inimigos Básicos

### Fraco (bad-guy-1, bad-guy-2, bad-guy-3)

Três variantes visuais com comportamento idêntico. Distribuídos aleatoriamente nas waves.

| Atributo | Valor |
|---|---|
| Vida | 40 |
| Velocidade | 75 px/s |
| Dano ao jogador (soco) | 8 |
| Dano ao jogador (chute) | 12 |
| Dano ao Wand (soco) | 10 |
| Dano ao Wand (chute) | 14 |
| Knockdown em 1 golpe forte | sim (≥ 18) |

Sprites: `bad-guy-1.png`, `bad-guy-2.png`, `bad-guy-3.png`

---

### Fortão — cabelo longo (bad-guy-strong)

| Atributo | Valor |
|---|---|
| Vida | 90 |
| Velocidade | 60 px/s |
| Dano ao jogador (soco) | 15 |
| Dano ao jogador (chute) | 20 |
| Dano ao Wand (soco) | 18 |
| Dano ao Wand (chute) | 24 |
| Knockdown em 1 golpe forte | não (precisa de 4 socos seguidos) |

Sprite: `bad-guy-strong.png`

---

### Gordão (bad-guy-fat)

| Atributo | Valor |
|---|---|
| Vida | 130 |
| Velocidade | 45 px/s |
| Dano ao jogador (soco) | 18 |
| Dano ao jogador (chute) | 22 |
| Dano ao Wand (soco) | 20 |
| Dano ao Wand (chute) | 26 |
| Knockdown em 1 golpe forte | não |

Obs.: imune a knockdown por soco isolado. Apenas chute aéreo (voadora) provoca knockdown.

Sprite: `bad-guy-fat.png`

---

### Cara da Cadeira (bad-guy-chair)

| Atributo | Valor |
|---|---|
| Vida | 50 |
| Velocidade | 65 px/s |
| Dano ao jogador (cadeira) | 28 |
| Dano ao Wand (cadeira) | 30 |
| Knockdown garantido | sim — toda cadeirada causa knockdown |
| Cooldown entre ataques | 2.5 s (ataque lento) |

Obs.: ao ser derrubado, solta a cadeira. Cadeira no chão pode ser usada pelo jogador (segurar botão de soco em cima do item): arremesso único causando 25 de dano.

Sprite: `bad-guy-chair.png`

---

## IA dos Inimigos

Estados de comportamento:

| Estado | Descrição |
|---|---|
| `Idle` | Aguardando entrada na arena |
| `Approach` | Caminhando em direção ao alvo atual |
| `Attack` | Executando golpe ao alcançar o alvo |
| `TargetProtectedCharacter` | Alvo definido como Wand, caminhando até ele |
| `Knockdown` | Animação de queda no chão |
| `Recover` | Levantando após knockdown |

**Regras de troca de alvo:**

1. Alvo inicial de todos os inimigos ao entrar na arena: **Wand**
2. Ao receber qualquer dano: alvo muda para o atacante
3. Após **3 segundos** sem receber dano: alvo volta para o Wand
4. Ao chegar a **60 px** do Wand: aguarda **1 segundo**, depois ataca

---

## Chefões

### Popó — Acelino Freitas

Aparece na Wave 5 (ou wave final configurada no JSON).

| Atributo | Valor |
|---|---|
| Vida | 300 |
| Velocidade | 70 px/s |
| Dano ao jogador (jab) | 15 |
| Dano ao jogador (cruzado) | 25 |
| Dano ao Wand | 30 por golpe |
| Comportamento especial | Alterna entre atacar o jogador e tentar chegar ao Wand |

Fase 2 (vida < 100): velocidade sobe para 95 px/s, ataques encadeados em dupla.

Sprite: `popo.png`

---

### Filho do Popó

Aparece como mini-boss em wave intermediária.

| Atributo | Valor |
|---|---|
| Vida | 180 |
| Velocidade | 100 px/s |
| Dano ao jogador | 18 |
| Dano ao Wand | 20 |
| Comportamento especial | Alta mobilidade — esquiva de volta ao ser atingido (recua 80 px) |

Sprite: `popo-son.png`

---

### Treinador (Popo-Coach)

Chefão tanque. Aparece na wave anterior ao Popó.

| Atributo | Valor |
|---|---|
| Vida | 350 |
| Velocidade | 40 px/s |
| Dano ao jogador (agarrão) | 30 |
| Dano ao Wand | 35 |
| Comportamento especial | Pode agarrar o jogador e imobilizá-lo por 1.5 s (QTE para escapar) |

Sprite: `popo-coach.png`
