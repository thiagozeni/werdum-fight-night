# Gameplay Mechanics

## Movimentação

Estilo beat-em-up com profundidade (pseudo-3D).

Eixos de movimento:

- X → esquerda e direita
- Y → profundidade do ringue (cima/baixo na tela)

O jogador se move livremente dentro dos limites do ringue.

Velocidades de referência (pixels/segundo):

| Personagem | Velocidade |
|---|---|
| Werdum | 85 |
| Dida | 120 |
| Thor | 140 |
| Inimigos (média) | 65–90 |

---

## Controles

### Desktop

| Ação | Tecla |
|---|---|
| Mover | WASD ou setas direcionais |
| Soco | J |
| Chute | K |
| Pular | Espaço |
| Bloquear | L (segurar) |

### Mobile

Virtual joystick na região inferior esquerda da tela.

Botões de ação na região inferior direita:

- Soco
- Chute
- Pular
- Bloquear

---

## Ataques

| Ataque | Dano base | Alcance H | Custo |
|---|---|---|---|
| Soco | 10 | 80 px | — |
| Chute | 16 | 100 px | — |
| Soco aéreo | 12 | 80 px | — |
| Chute aéreo (voadora) | 22 | 110 px | — |

Dano base é modificado pelo atributo de cada personagem (ver `characters.md`).

---

## Combos

Sequência de socos rápidos encadeados:

- 1º soco → dano normal
- 2º soco (dentro de 0.5s) → dano normal
- 3º soco → dano +30% (finalizador de combo)

Combo é resetado se o jogador parar de atacar por mais de 0.5 segundos.

---

## Hit Detection

Golpe acerta um alvo se:

```
abs(attacker.x - target.x) < rangeH
abs(attacker.y - target.y) < 40
```

O threshold de profundidade (40 px) é fixo para todos os ataques.

---

## Knockdown

Um personagem (jogador ou inimigo) vai ao chão se:

- Receber um único golpe com dano ≥ 25, **ou**
- Receber 3 golpes consecutivos sem defesa ativa

Comportamento após knockdown:

1. Animação de queda (0.3 s)
2. Personagem fica no chão por **1.5 s**
3. Animação de levantar (0.5 s)
4. Retorna ao estado normal

Inimigos podem ser atacados enquanto estão no chão (dano reduzido a 50%).

---

## Defesa (Block)

Segurar o botão de bloquear reduz o dano recebido em **60%**.

Bloquear não cancela knockdown causado por golpe ≥ 25 de dano.

O jogador não pode se mover enquanto bloqueia.

---

## Proteção do Wand

Wanderlei Silva está posicionado em uma área fixa do ringue (entre o centro e o corner superior direito).

Comportamento dos inimigos em relação ao Wand:

1. Alvo padrão de todos os inimigos é o Wand
2. Ao receber dano, o inimigo muda de alvo para o agressor
3. Se ficar **3 segundos** sem receber dano, volta a mirar no Wand
4. Ao entrar no raio de **60 px** do Wand, o inimigo aguarda **1 segundo** antes de atacar
5. O ataque ao Wand é sempre soco ou chute agachado (animação específica)

Se a barra de vida do Wand chegar a zero → **Game Over**.
