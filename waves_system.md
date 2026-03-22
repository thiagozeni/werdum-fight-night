# Wave System

Sistema de progressão configurado via JSON. Cada wave é uma entrada independente no arquivo de configuração, permitindo balancear sem alterar código.

---

## Formato de Configuração

```json
{
  "waves": [
    {
      "id": 1,
      "enemies": [
        { "type": "weak", "count": 3, "entry": "left" }
      ],
      "spawnInterval": 2.0
    }
  ]
}
```

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | number | Número da wave (exibido na HUD) |
| `enemies` | array | Lista de grupos de inimigos |
| `type` | string | `weak`, `strong`, `fat`, `chair`, `boss_son`, `boss_coach`, `boss_popo` |
| `count` | number | Quantidade desse tipo |
| `entry` | string | `left`, `right`, `both` — lado de entrada na arena |
| `spawnInterval` | number | Segundos entre cada inimigo entrar (evita spawn em massa) |

---

## Sequência de Waves

| Wave | Inimigos | Observação |
|---|---|---|
| 1 | 3 fracos | Introdução, ritmo lento |
| 2 | 5 fracos | Aumenta pressão |
| 3 | 5 fracos + 1 fortão | Apresenta inimigo mais resistente |
| 4 | 6 fracos + 1 gordão | Apresenta inimigo imune a knockdown |
| 5 | 4 fracos + 1 cara da cadeira | Apresenta arma |
| 6 | 6 fracos + 2 fortões | Dificuldade aumenta |
| 7 | 5 fracos + 1 gordão + 1 fortão | Combinação de tipos |
| 8 | 4 fracos + 2 cadeiras + 1 gordão | Alta pressão |
| 9 | **Mini-boss**: Filho do Popó + 3 fracos | Primeiro chefão |
| 10 | 6 fracos + 2 fortões + 1 gordão | Wave de transição intensa |
| 11 | **Boss**: Treinador + 2 fracos | Penúltima fase |
| 12 | **Boss final**: Popó | Enfrentamento principal |

Total: 12 waves.

---

## Regras de Progressão

- Uma nova wave começa **3 segundos** após o último inimigo da wave anterior ser derrotado
- Uma wave só termina quando todos os inimigos daquela wave estiverem nocauteados
- Entre waves, o jogador recupera **15% da vida máxima**
- O Wand **não recupera vida** entre waves

---

## Escalada de Dificuldade (modos futuros)

Para modos de dificuldade ou endless, aplicar multiplicadores sobre os atributos base:

| Modo | HP inimigos | Dano inimigos | Velocidade |
|---|---|---|---|
| Fácil | 0.7× | 0.7× | 0.85× |
| Normal | 1.0× | 1.0× | 1.0× |
| Difícil | 1.3× | 1.3× | 1.1× |
| Endless | +5% por wave | +5% por wave | +2% por wave |
