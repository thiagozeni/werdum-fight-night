# Characters

## Personagem Protegido

### Wanderlei Silva

Estado: nocauteado, não jogável, deve ser defendido.

Posição no ringue: fixo entre o centro e o corner superior direito (~65% da largura, ~40% da profundidade).

| Atributo | Valor |
|---|---|
| Vida | 200 |
| Dano recebido (soco) | conforme inimigo |
| Dano recebido (chute) | conforme inimigo |

Se a vida chegar a zero → Game Over.

Sprite: `wand.png`

---

## Personagens Jogáveis

### Fabricio Werdum

Estilo: lutador pesado, golpes lentos mas devastadores.

| Atributo | Valor |
|---|---|
| Vida | 150 |
| Velocidade | 85 px/s |
| Multiplicador de soco | 1.4× |
| Multiplicador de chute | 1.3× |
| Knockdown threshold | 30 (resiste mais) |

Diferencial: único personagem capaz de realizar agarrão (grab) — pressionar soco estando encostado no inimigo lança-o para longe (dano 28).

Sprite: `werdum.png`

---

### Dida

Estilo: técnico, rápido, combos mais longos.

| Atributo | Valor |
|---|---|
| Vida | 120 |
| Velocidade | 120 px/s |
| Multiplicador de soco | 1.0× |
| Multiplicador de chute | 1.0× |
| Knockdown threshold | 20 |

Diferencial: combo estendido — pode encadear até 5 socos (os demais personagens têm limite de 3). O 5º soco causa dano +50%.

Sprite: `dida.png`

---

### Thor

Estilo: ágil, jovem, alta mobilidade.

| Atributo | Valor |
|---|---|
| Vida | 100 |
| Velocidade | 140 px/s |
| Multiplicador de soco | 0.9× |
| Multiplicador de chute | 1.2× |
| Knockdown threshold | 18 |

Diferencial: chute aéreo com alcance horizontal maior (130 px em vez de 110 px) e cooldown reduzido.

Sprite: `thor.png`

---

## Sistema de Aliados

Os dois personagens não selecionados pelo jogador aparecem como aliados controlados por IA.

Comportamento:

- Atacam inimigos próximos autonomamente
- Priorizam inimigos que estão se aproximando do Wand
- Causam 40% do dano do jogador
- Têm vida infinita (podem ser derrubados, mas sempre levantam)
- Tempo de recuperação após knockdown: 3 s (mais lento que o jogador)

Os aliados não interferem na condição de vitória nem de derrota — servem apenas para criar pressão sobre os inimigos e aliviar o jogador.
