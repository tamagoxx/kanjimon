/**
 * Pure decision logic for boss turn actions.
 *
 * Why this exists: doBossTurn in /battle/page.tsx was ~150 lines of inline
 * conditionals. Special abilities (DEBUFF, HEAL, BURN) REPLACED the boss's
 * base attack, so during those phases the boss dealt zero damage. ENRAGE
 * had no handler at all and fell through to default.
 *
 * The fix: extract a pure function that returns a list of action descriptors
 * for one boss turn. The boss ALWAYS attacks unless charging — specials
 * add effects on top of (or instead of) the base attack. The page.tsx caller
 * turns these descriptors into React state mutations + setTimeout chains.
 *
 * Contract:
 * - Returned actions are in execution order
 * - "attack" is the canonical damage action — used for base, BERSERK, AOE,
 *   and releaseCharge (all compute damage via calculateDamage)
 * - "charge" is the only action that SKIPS the attack for that turn
 * - "enrage" is a stat-buff log (no direct damage; base attack fires after)
 */
import { calculateDamage } from './battleDamage';

export type PhaseAbility =
  | 'BERSERK'
  | 'AOE'
  | 'CHARGE'
  | 'HEAL'
  | 'DEBUFF'
  | 'BURN'
  | 'ENRAGE'
  | 'FREEZE'
  | 'NORMAL'
  | null;

export type BossAction =
  | { type: 'attack'; atk: number; def: number; atkMult: number; label: string; isCharged?: boolean; incrementsBerserkCount?: boolean }
  | { type: 'charge' }
  | { type: 'heal'; amount: number }
  | { type: 'debuff' }
  | { type: 'burn'; stacks: number }
  | { type: 'enrage' };

export interface BossTurnContext {
  isCharging: boolean;
  bossBerserkCount: number;
  baseAtk: number;
  playerDef: number;
  bossAtkMultiplier: number;
  phaseAbility: PhaseAbility;
  phaseName: string;
  bossMaxHp: number;
  bossHp: number;
}

/** AoE damage lookup by phase name. Matches existing /battle behavior. */
function aoeBaseDamage(phaseName: string): number {
  if (phaseName === 'Avalanche') return 40;
  if (phaseName === 'Collapse') return 60;
  return 25;
}

/**
 * Decide what a boss should do this turn.
 *
 * Returns an ORDERED list of actions. Caller executes them in order.
 * Most turns return exactly one 'attack' action. CHARGE returns one
 * 'charge' action and skips the attack. DEBUFF/HEAL/BURN/ENRAGE return
 * an effect action followed by the default 'attack' (so the boss still
 * damages the player).
 */
export function getBossActions(ctx: BossTurnContext): BossAction[] {
  // 1. Release charged attack — REPLACES everything else
  if (ctx.isCharging) {
    return [{
      type: 'attack',
      atk: ctx.baseAtk,
      def: ctx.playerDef,
      atkMult: 2 * ctx.bossAtkMultiplier,
      label: 'CHARGED ATTACK!',
      isCharged: true,
    }];
  }

  // 2. CHARGE — skip this turn's attack, boss charges for 200% next turn
  if (ctx.phaseAbility === 'CHARGE') {
    return [{ type: 'charge' }];
  }

  // 3. AOE — replaces base attack with AoE damage (big hit, no base)
  if (ctx.phaseAbility === 'AOE') {
    return [{
      type: 'attack',
      atk: aoeBaseDamage(ctx.phaseName),
      def: ctx.playerDef,
      atkMult: ctx.bossAtkMultiplier,
      label: 'AoE ATTACK!',
    }];
  }

  // 4. BERSERK — for first 3 turns, replaces base with 150% attack
  if (ctx.phaseAbility === 'BERSERK' && ctx.bossBerserkCount < 3) {
    return [{
      type: 'attack',
      atk: ctx.baseAtk,
      def: ctx.playerDef,
      atkMult: 1.5 * ctx.bossAtkMultiplier,
      label: 'BERSERK!',
      incrementsBerserkCount: true,
    }];
  }

  // 5. Effect specials add an effect, then fire the base attack
  const actions: BossAction[] = [];
  if (ctx.phaseAbility === 'HEAL') {
    actions.push({ type: 'heal', amount: Math.floor(ctx.bossMaxHp * 0.15) });
  }
  if (ctx.phaseAbility === 'DEBUFF') {
    actions.push({ type: 'debuff' });
  }
  if (ctx.phaseAbility === 'BURN') {
    actions.push({ type: 'burn', stacks: 3 });
  }
  if (ctx.phaseAbility === 'ENRAGE') {
    actions.push({ type: 'enrage' });
  }

  // 6. Base attack (catches NORMAL + all effect specials)
  actions.push({
    type: 'attack',
    atk: ctx.baseAtk,
    def: ctx.playerDef,
    atkMult: ctx.bossAtkMultiplier,
    label: 'attacks!',
  });

  return actions;
}

/** Helper: extract damage value from an attack action. Returns 0 for non-attacks. */
export function damageFromAction(action: BossAction): number {
  if (action.type !== 'attack') return 0;
  return calculateDamage(action.atk, action.def, { atkMultiplier: action.atkMult });
}
