# Technical Architecture

## Engine

**Phaser 3** (JavaScript / TypeScript)

Motivos da escolha:
- Roda nativamente no browser sem build pesado
- Suporte nativo a vídeo como background (`Phaser.GameObjects.Video`)
- Plugin oficial de virtual joystick para mobile (`rex-plugins` ou `@rexrainbow/phaser3-rex-plugins`)
- Sprites PNG sem conversão
- Toda a lógica de IA customizada implementada em TypeScript puro
- Exporta diretamente para web e mobile browser

---

## Estrutura de Pastas

```
/
├── src/
│   ├── scenes/
│   │   ├── BootScene.ts         — Pré-carregamento de assets
│   │   ├── TitleScene.ts        — Tela de título (vídeo de fundo)
│   │   ├── SelectScene.ts       — Seleção de personagem
│   │   ├── GameScene.ts         — Cena principal do jogo
│   │   └── GameOverScene.ts     — Tela de game over / vitória
│   ├── entities/
│   │   ├── Player.ts            — Personagem controlado pelo jogador
│   │   ├── Ally.ts              — Aliados controlados por IA
│   │   ├── ProtectedChar.ts     — Wanderlei (alvo a defender)
│   │   ├── Enemy.ts             — Classe base dos inimigos
│   │   └── Boss.ts              — Extensão para chefões
│   ├── systems/
│   │   ├── WaveManager.ts       — Leitura do JSON e spawn das waves
│   │   ├── CombatSystem.ts      — Hit detection e aplicação de dano
│   │   ├── InputHandler.ts      — Abstração de teclado + virtual joystick
│   │   └── DepthSorter.ts       — Ordena sprites por eixo Y (pseudo-3D)
│   ├── ai/
│   │   ├── EnemyAI.ts           — Máquina de estados dos inimigos
│   │   └── AllyAI.ts            — Máquina de estados dos aliados
│   ├── ui/
│   │   ├── HUD.ts               — Barras de vida, número da wave
│   │   └── VirtualJoystick.ts   — Controles mobile
│   └── data/
│       ├── waves.json           — Configuração de todas as waves
│       └── characters.json      — Atributos dos personagens e inimigos
├── public/
│   ├── imgs/                    — Assets de imagem (sprites, cenários)
│   └── videos/                  — Vídeos de background
├── index.html
└── package.json
```

---

## Cena Principal (GameScene)

Hierarquia de objetos na cena:

```
GameScene
├── VideoBackground          — Back-loop.mp4 rodando em loop
├── ArenaBackground          — 16bit-crowd.png (sprite estático)
├── ProtectedChar            — Wanderlei, posição fixa
├── EnemyGroup               — Pool de inimigos ativos
├── AllyGroup                — Aliados com IA
├── Player                   — Personagem do jogador
├── WaveManager              — Controla spawn e progressão
├── CombatSystem             — Resolve colisões e dano
├── DepthSorter              — Reordena z-index por Y a cada frame
└── HUD                      — Overlay de interface
```

---

## Sistema de Ondas

`WaveManager` lê `waves.json` e gerencia o ciclo:

```
loadWave(id)
  → spawnEnemies() com intervalo entre cada spawn
  → monitorar grupo de inimigos ativos
  → ao zerar: aguarda 3s → healPlayer(15%) → loadWave(id + 1)
```

---

## IA dos Inimigos (EnemyAI)

Máquina de estados finita:

```
Idle → Approach → Attack
             ↓
     TargetProtectedCharacter
             ↓
        (chegou perto)
             ↓
      WaitBeforeAttack (1s)
             ↓
       AttackWand
```

Troca de alvo:

```typescript
onHit(attacker) {
  this.target = attacker
  this.noHitTimer = 0
}

update(delta) {
  this.noHitTimer += delta
  if (this.noHitTimer > 3000) {
    this.target = protectedChar
  }
}
```

---

## IA dos Aliados (AllyAI)

Estados:

```
AssistPlayer → AttackNearestEnemy → Recover (após knockdown)
```

Lógica de prioridade:

1. Se existe inimigo dentro de 200 px → atacar
2. Se inimigo está se movendo em direção ao Wand e está mais próximo do Wand do que o jogador → interceptar esse inimigo

---

## Sistema de Profundidade (Pseudo-3D)

A cada frame, `DepthSorter` percorre todos os sprites ativos e define o `depth` (z-index) baseado na posição Y:

```typescript
entities.forEach(e => {
  e.sprite.setDepth(e.y)
})
```

Isso garante que personagens "na frente" (Y maior) apareçam sobre os que estão "atrás".

---

## Plataformas

| Plataforma | Resolução base | Input |
|---|---|---|
| Desktop browser | 1280 × 720 | Teclado |
| Mobile browser | 720 × 405 (escalonado) | Virtual joystick |

O canvas é redimensionado com `Phaser.Scale.FIT` para adaptar a qualquer tela mantendo proporção 16:9.

---

## Dependências Previstas

```json
{
  "phaser": "^3.70.0",
  "typescript": "^5.0.0",
  "@rexrainbow/phaser3-rex-plugins": "^1.0.0"
}
```
