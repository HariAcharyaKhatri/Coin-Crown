export type GameAction =
  | { type: 'CLICK_COLLECT' }
  | { type: 'BUILD'; defId: string; plotId?: string }
  | { type: 'UPGRADE'; instanceId: string }
  | { type: 'DEMOLISH'; instanceId: string }
  | { type: 'REPAIR_BUILDING'; instanceId: string }
  | { type: 'SELL_ITEM'; itemId: string; quantity: number }
  | { type: 'BUY_ITEM'; itemId: string; quantity: number }
  | { type: 'HIRE_WORKER'; profession: string; name?: string }
  | { type: 'ASSIGN_WORKER'; workerId: string; buildingInstanceId: string }
  | { type: 'UNASSIGN_WORKER'; workerId: string }
  | { type: 'HIRE_MANAGER'; specialty: string; name?: string }
  | { type: 'ASSIGN_MANAGER'; managerId: string; buildingInstanceId: string }
  | { type: 'UNASSIGN_MANAGER'; managerId: string }
  | { type: 'UPGRADE_MANAGER'; managerId: string }
  | { type: 'SET_TAX_RATE'; rate: number }
  | { type: 'COLLECT_TAX' }
  | { type: 'ESTABLISH_ROUTE'; route: { originRegionId: string; destinationRegionId: string; itemId: string; quantity: number } }
  | { type: 'CANCEL_ROUTE'; routeId: string }
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'MAKE_DECISION'; questId: string; decisionId: string }
  | { type: 'PRESTIGE' }
  | { type: 'UPGRADE_LEGACY'; nodeId: string }
  | { type: 'BUY_PLOT'; plotId: string }
  | { type: 'SWITCH_REGION'; regionId: string }
  | { type: 'CLAIM_ACHIEVEMENT'; achievementId: string }
  | { type: 'EMPTY_VAULT' };
