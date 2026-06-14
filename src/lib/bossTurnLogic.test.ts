/**
 * Tests for boss turn decision logic.
 *
 * Why these tests matter: prior to this refactor, boss turns in
 * /battle/page.tsx had ~150 lines of inline conditionals where:
 *  - DEBUFF/HEAL/BURN specials REPLACED the base attack (boss dealt 0 dmg)
 *  - ENRAGE had no handler (silently fell through to default)
 *  - The "boss doesn't attack" bug was invisible because there were no tests
 *
 * These tests lock in the new contract: boss ALWAYS attacks unless charging.
 */
import { describe, it, expect } from 'vitest';
import { getBossActions, damageFromAction, type BossTurnContext, type PhaseAbility } from './bossTurnLogic';

const baseCtx: BossTurnContext = {
  isCharging: false,
  bossBerserkCount: 0,
  baseAtk: 100,
  playerDef: 10,
  bossAtkMultiplier: 1.0,
  phaseAbility: 'NORMAL',
  phaseName: 'Phase 1',
  bossMaxHp: 400,
  bossHp: 400,
};

describe('getBossActions', () => {
  describe('default (NORMAL phase)', () => {
    it('returns exactly one base attack', () => {
      const actions = getBossActions(baseCtx);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 1.0,
        label: 'attacks!',
      });
    });
  });

  describe('charged attack release', () => {
    it('fires 200% attack when isCharging is true, ignoring phase ability', () => {
      const ctx: BossTurnContext = { ...baseCtx, isCharging: true, phaseAbility: 'DEBUFF' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 2.0, // 2x bossAtkMultiplier
        label: 'CHARGED ATTACK!',
        isCharged: true,
      });
    });

    it('releases charge even in CHARGE phase (defensive — should not happen but safe)', () => {
      const ctx: BossTurnContext = { ...baseCtx, isCharging: true, phaseAbility: 'CHARGE' };
      const actions = getBossActions(ctx);
      const first = actions[0];
      if (first.type !== 'attack') throw new Error('expected attack action');
      expect(first.isCharged).toBe(true);
    });
  });

  describe('DEBUFF phase (was the original bug)', () => {
    it('applies debuff AND still attacks (previously: replaced attack)', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'DEBUFF' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(2);
      expect(actions[0]).toEqual({ type: 'debuff' });
      expect(actions[1]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 1.0,
        label: 'attacks!',
      });
    });
  });

  describe('HEAL phase', () => {
    it('heals 15% of maxHp AND still attacks', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'HEAL', bossMaxHp: 400 };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(2);
      expect(actions[0]).toEqual({ type: 'heal', amount: 60 }); // 15% of 400
      expect(actions[1].type).toBe('attack');
    });

    it('heal amount floors to integer (0.15 * 100 = 15)', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'HEAL', bossMaxHp: 100 };
      const actions = getBossActions(ctx);
      expect(actions[0]).toEqual({ type: 'heal', amount: 15 });
    });
  });

  describe('BURN phase', () => {
    it('applies 3 burn stacks AND still attacks', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'BURN' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(2);
      expect(actions[0]).toEqual({ type: 'burn', stacks: 3 });
      expect(actions[1].type).toBe('attack');
    });
  });

  describe('ENRAGE phase (was missing handler entirely)', () => {
    it('emits enrage marker AND still attacks', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'ENRAGE' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(2);
      expect(actions[0]).toEqual({ type: 'enrage' });
      expect(actions[1]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 1.0,
        label: 'attacks!',
      });
    });
  });

  describe('CHARGE phase', () => {
    it('returns charge action only (skips attack this turn)', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'CHARGE' };
      const actions = getBossActions(ctx);
      expect(actions).toEqual([{ type: 'charge' }]);
    });
  });

  describe('AOE phase', () => {
    it('Avalanche phase name → 40 base damage AoE', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'AOE', phaseName: 'Avalanche' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(1);
      const a = actions[0];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a).toEqual({
        type: 'attack',
        atk: 40,
        def: 10,
        atkMult: 1.0,
        label: 'AoE ATTACK!',
      });
    });

    it('Collapse phase name → 60 base damage AoE', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'AOE', phaseName: 'Collapse' };
      const actions = getBossActions(ctx);
      const a = actions[0];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a.atk).toBe(60);
    });

    it('default AoE phase name → 25 base damage', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'AOE', phaseName: 'Earthquake' };
      const actions = getBossActions(ctx);
      const a = actions[0];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a.atk).toBe(25);
    });

    it('does NOT add a base attack on top (AOE is the only damage)', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'AOE', phaseName: 'Avalanche' };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(1);
    });
  });

  describe('BERSERK phase', () => {
    it('first 3 turns: 150% attack replaces base', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'BERSERK', bossBerserkCount: 0 };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 1.5,
        label: 'BERSERK!',
        incrementsBerserkCount: true,
      });
    });

    it('after 3 turns (berserk exhausted): falls back to base attack', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'BERSERK', bossBerserkCount: 3 };
      const actions = getBossActions(ctx);
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual({
        type: 'attack',
        atk: 100,
        def: 10,
        atkMult: 1.0,
        label: 'attacks!',
      });
    });
  });

  describe('multipliers', () => {
    it('bossAtkMultiplier scales all attack actions', () => {
      const ctx: BossTurnContext = { ...baseCtx, bossAtkMultiplier: 1.8 };
      const actions = getBossActions(ctx);
      const a = actions[0];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a.atkMult).toBe(1.8);
    });

    it('ENRAGE phase honors bossAtkMultiplier on its base attack', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'ENRAGE', bossAtkMultiplier: 1.8 };
      const actions = getBossActions(ctx);
      const a = actions[1];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a.atkMult).toBe(1.8);
    });

    it('AOE honors bossAtkMultiplier', () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'AOE', phaseName: 'Avalanche', bossAtkMultiplier: 1.5 };
      const actions = getBossActions(ctx);
      const a = actions[0];
      if (a.type !== 'attack') throw new Error('expected attack action');
      expect(a.atkMult).toBe(1.5);
    });
  });
});

describe('damageFromAction', () => {
  it('returns 0 for non-attack actions', () => {
    expect(damageFromAction({ type: 'charge' })).toBe(0);
    expect(damageFromAction({ type: 'heal', amount: 50 })).toBe(0);
    expect(damageFromAction({ type: 'debuff' })).toBe(0);
    expect(damageFromAction({ type: 'burn', stacks: 3 })).toBe(0);
    expect(damageFromAction({ type: 'enrage' })).toBe(0);
  });

  it('computes damage for base attack', () => {
    const action = {
      type: 'attack' as const,
      atk: 100,
      def: 10,
      atkMult: 1.0,
      label: 'attacks!',
    };
    // 100 * 1.0 = 100, def 10, min 5 → 90
    expect(damageFromAction(action)).toBe(90);
  });

  it('computes damage for charged attack (2x multiplier)', () => {
    const action = {
      type: 'attack' as const,
      atk: 100,
      def: 10,
      atkMult: 2.0,
      label: 'CHARGED ATTACK!',
      isCharged: true,
    };
    // 100 * 2 = 200, def 10 → 190
    expect(damageFromAction(action)).toBe(190);
  });

  it('respects minimum damage floor of 5', () => {
    const action = {
      type: 'attack' as const,
      atk: 5,
      def: 1000, // huge defense
      atkMult: 1.0,
      label: 'attacks!',
    };
    expect(damageFromAction(action)).toBe(5);
  });
});

describe('regression: boss MUST attack on every non-charge turn', () => {
  const phases: PhaseAbility[] = ['NORMAL', 'BERSERK', 'AOE', 'HEAL', 'DEBUFF', 'BURN', 'ENRAGE'];
  for (const phase of phases) {
    it(`${phase} phase produces at least one attack action`, () => {
      const ctx: BossTurnContext = { ...baseCtx, phaseAbility: phase };
      const actions = getBossActions(ctx);
      const attacks = actions.filter(a => a.type === 'attack');
      expect(attacks.length).toBeGreaterThanOrEqual(1);
    });
  }

  it('only CHARGE phase produces zero attack actions (and only when not releasing a charge)', () => {
    const ctx: BossTurnContext = { ...baseCtx, phaseAbility: 'CHARGE' };
    const actions = getBossActions(ctx);
    const attacks = actions.filter(a => a.type === 'attack');
    expect(attacks).toHaveLength(0);
  });
});
