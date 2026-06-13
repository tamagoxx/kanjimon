/**
 * Pure damage calculation for battle system.
 *
 * Single source of truth for "attacker hits defender" damage math.
 * Replaces ad-hoc `Math.max(5, X - defense)` calls scattered across
 * /battle/page.tsx so defense is consistently applied everywhere
 * (including AoE, which previously bypassed it).
 *
 * Contract:
 * - baseDamage is the attacker's pre-multiplier damage
 * - defense is the defender's pre-multiplier defense stat
 * - atkMultiplier scales baseDamage (boss atkMult, charged=2.0, etc.)
 * - defMultiplier scales defense (defending status = 1.5)
 * - minDamage is the floor — even max defense can't reduce below this
 *   (default 5 matches existing /battle behavior)
 *
 * Both atkDmg and effectiveDef are floored to int (multipliers may
 * produce non-integer results); final result is NOT floored — caller
 * decides whether to round for display.
 */
export interface DamageOptions {
  minDamage?: number;
  atkMultiplier?: number;
  defMultiplier?: number;
}

export function calculateDamage(
  baseDamage: number,
  defense: number,
  options: DamageOptions = {}
): number {
  const minDamage = options.minDamage ?? 5;
  const atkMult = options.atkMultiplier ?? 1.0;
  const defMult = options.defMultiplier ?? 1.0;
  const atkDmg = Math.floor(baseDamage * atkMult);
  const effectiveDef = Math.floor(defense * defMult);
  return Math.max(minDamage, atkDmg - effectiveDef);
}
