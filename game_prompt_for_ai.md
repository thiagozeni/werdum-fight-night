# AI Game Development Prompt

You are a senior game developer specialized in 2D arcade games.

Your task is to generate the full code structure for a simple beat'em up game.

The game must prioritize simplicity, modular code and readability.

The developer using this code has basic programming knowledge but limited experience in game development.

The game must run on web browsers and mobile browsers.

Preferred technology:

HTML5 Canvas or Phaser.js.

---

# GAME CONCEPT

The game is a retro style 2D beat'em up set inside a fighting ring.

The main objective is to defend a knocked out fighter lying on the ground while waves of enemies attempt to attack him.

The player must defeat enemies before they reach the protected character.

The game uses pixel art and a 16-bit arcade aesthetic.

---

# GAME GENRE

Arena Beat'em Up Survival

Inspired by classic games like Streets of Rage and Final Fight.

---

# CORE GAMEPLAY LOOP

1. Player starts in the ring
2. Waves of enemies spawn
3. Player defeats enemies
4. Enemies attempt to reach the protected character
5. Waves increase in difficulty

Game ends when the protected character loses all health.

---

# PLAYER CHARACTERS

Three playable characters exist.

The player selects one at the start.

Characters:

- Fabricio Werdum
- Dida (trainer)
- Thor

The two characters not selected appear as AI allies.

---

# PROTECTED CHARACTER

Wanderlei Silva

Characteristics:

- knocked out
- lying on the ground
- cannot move
- has a health bar

If enemies reach him they attack and reduce his health.

Game over when health reaches zero.

---

# ALLY SYSTEM

Allies help the player but are weaker.

Characteristics:

- controlled by AI
- lower damage
- infinite life
- can be knocked down
- automatically recover

Allies attack nearby enemies.

---

# PLAYER CONTROLS

Movement:

X axis → left/right  
Y axis → depth (up/down)

Buttons:

Punch  
Kick  
Jump  
Block

---

# COMBAT RULES

Punch:

fast attack  
low damage

Kick:

slower attack  
higher damage

Jump Punch:

air attack

Jump Kick:

flying kick

---

# DEPTH COLLISION RULE

An attack only hits enemies within a vertical depth range.

Example rule:

abs(playerY - enemyY) < threshold

---

# ENEMY TYPES

Basic Enemy:

low health  
simple punches

Strong Enemy:

more health  
strong attacks

Chair Enemy:

uses chair as weapon  
high damage

Heavy Enemy:

large enemy  
slow but very resistant

---

# BOSSES

Boss enemies appear in specific waves.

Examples:

Popó  
Popó's son  
Trainer

Bosses have:

high health  
unique attacks

---

# WAVE SYSTEM

Enemies spawn in waves.

Example progression:

Wave 1
3 weak enemies

Wave 2
5 weak enemies

Wave 3
6 weak enemies
1 strong enemy

Wave 4
7 weak enemies
2 strong enemies

Wave 5
boss

Waves continue increasing difficulty.

---

# ARENA

Single arena.

A fighting ring.

Movement limits:

minX  
maxX  
minY  
maxY

Enemies spawn from corners.

---

# GRAPHICS

Pixel art.

Sprite size suggestion:

96px height

Animations needed:

Idle  
Walk  
Punch  
Kick  
Jump  
JumpPunch  
JumpKick  
Block  
Hit  
Knockdown  
GetUp

---

# UI

Display:

Player health bar  
Protected character health bar  
Current wave number

Game Over screen.

---

# CODE REQUIREMENTS

The code must be modular and easy to modify.

Recommended structure:

Game
Player
Enemy
EnemyAI
WaveManager
CollisionSystem
UIManager

---

# EXTRA FEATURES (OPTIONAL)

Local multiplayer:

up to 3 players.

If players join, AI allies are replaced by human players.

---

# PERFORMANCE

The game must support at least 8 enemies simultaneously.

Must run smoothly on mobile browsers.

---

# FINAL GOAL

Generate a fully playable prototype with:

player movement  
enemy spawning  
basic combat  
wave system  
basic AI
