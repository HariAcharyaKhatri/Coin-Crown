import {
  CLICK_BASE,
  CLICK_LEVEL_BONUS,
  UPGRADE_COST_MULT,
  UPGRADE_OUTPUT_MULT,
  SEASON_MULTIPLIERS,
  Season,
  DEMOLITION_REFUND_PURCHASE,
} from '../constants';

export function calculateClickPower(playerLevel: number, prestigeClickMult: number = 1.0): number {
  return CLICK_BASE * (1 + CLICK_LEVEL_BONUS * playerLevel) * prestigeClickMult;
}

export function calculateWorkerSkillBonus(avgSkill: number): number {
  if (avgSkill <= 1) return 0;
  return Math.min(0.16, 0.04 * (avgSkill - 1));
}

export function calculateBuildingOutputPerMinute(
  baseQty: number,
  level: number,
  workerSkillBonus: number = 0,
  managerBonus: number = 0,
  season: Season = 'spring',
  prestigeMultiplier: number = 1.0,
  unrestPenalty: number = 0
): number {
  const levelMult = Math.pow(UPGRADE_OUTPUT_MULT, level - 1);
  const seasonMult = SEASON_MULTIPLIERS[season] ?? 1.0;
  return (
    baseQty *
    levelMult *
    (1 + workerSkillBonus) *
    (1 + managerBonus) *
    seasonMult *
    prestigeMultiplier *
    (1 - unrestPenalty)
  );
}

export function calculateUpgradeCost(purchaseCost: number, targetLevel: number): number {
  return Math.round(purchaseCost * Math.pow(UPGRADE_COST_MULT, targetLevel - 1));
}

export function calculateMaintenancePerMinute(baseMaint: number, level: number): number {
  return baseMaint * (1 + level * 0.04);
}

export function calculateDemolitionRefund(purchaseCost: number): number {
  return Math.round(purchaseCost * DEMOLITION_REFUND_PURCHASE);
}
