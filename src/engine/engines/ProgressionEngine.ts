import { GameState, StatePatch } from '../types/state';
import { calculateXpToNextLevel } from '../formulas/progression';
import questsData from '../../data/quests.json';
import achievementsData from '../../data/achievements.json';
import balanceData from '../../data/balance.json';
import buildingsData from '../../data/buildings.json';
import { EventBus } from '../events/EventBus';

export class ProgressionEngine {
  public tick(_deltaMs: number, state: GameState): StatePatch | null {
    try {
      let playerLevel = state.playerLevel;
      let playerXp = state.playerXp;
      let bonusCoins = 0;
      let bonusSeals = 0;

      // Update Quests Progress
      const activeQuestIds = [...state.quests.activeQuestIds];
      const completedQuestIds = new Set(state.quests.completedQuestIds);
      const objProgress = { ...state.quests.objectivesProgress };

      // Ensure start quests active if none active
      if (activeQuestIds.length === 0 && completedQuestIds.size === 0) {
        activeQuestIds.push('qst.ch01.001');
      }

      for (const qId of activeQuestIds) {
        const quest = questsData.find((q) => q.questId === qId);
        if (!quest) continue;

        if (!objProgress[qId]) {
          objProgress[qId] = {};
        }

        let allObjectivesComplete = true;
        quest.objectives.forEach((obj: any, idx) => {
          let currentVal = objProgress[qId][idx] ?? 0;

          if (obj.type === 'click_collect') {
            currentVal = state.stats.clickCollectCount;
          } else if (obj.type === 'build_count') {
            currentVal = Object.keys(state.buildings).length;
          } else if (obj.type === 'build_def' && obj.targetId) {
            currentVal = Object.values(state.buildings).filter((b) => b.defId === obj.targetId).length;
          } else if (obj.type === 'own_building_count' && obj.targetId) {
            currentVal = Object.values(state.buildings).filter((b) => b.defId === obj.targetId).length;
          } else if (obj.type === 'produce_item' && obj.targetId) {
            currentVal = state.stats.itemsProduced[obj.targetId] ?? 0;
          } else if (obj.type === 'lifetime_coins') {
            currentVal = state.lifetimeCoins;
          } else if (obj.type === 'prestige_count') {
            currentVal = state.prestige.prestigeCount;
          } else if (obj.type === 'relic_fragments_count') {
            currentVal = state.stats.relicFragments;
          } else if (obj.type === 'active_routes_count') {
            currentVal = state.trade.routes.filter((r) => r.active).length;
          } else if (obj.type === 'legacy_max_rank') {
            const ranks = Object.values(state.prestige.legacyTree);
            currentVal = ranks.length > 0 ? Math.max(...ranks) : 0;
          } else if (obj.type === 'legacy_branches_rank3') {
            const rank3Branches = new Set(
              Object.entries(state.prestige.legacyTree)
                .filter(([_, rank]) => rank >= 3)
                .map(([nodeId]) => nodeId.split('.')[1])
            );
            currentVal = rank3Branches.size;
          }

          objProgress[qId][idx] = currentVal;
          if (currentVal < obj.count) {
            allObjectivesComplete = false;
          }
        });

        // If completed, move to completed and unlock dependents
        if (allObjectivesComplete) {
          completedQuestIds.add(qId);
          EventBus.emit('QUEST_COMPLETED', { questId: qId });

          for (const rew of quest.rewards) {
            if (rew.type === 'coins') {
              bonusCoins += rew.amount;
            } else if (rew.type === 'xp') {
              playerXp += rew.amount;
            } else if (rew.type === 'dynasty_seal') {
              bonusSeals += rew.amount;
            }
          }

          // Find newly unlocked quests
          for (const nextQ of questsData) {
            if (!completedQuestIds.has(nextQ.questId) && !activeQuestIds.includes(nextQ.questId)) {
              const prereqsMet = nextQ.prerequisites.every((p) => completedQuestIds.has(p));
              if (prereqsMet && nextQ.unlockTier <= state.realmTier) {
                activeQuestIds.push(nextQ.questId);
              }
            }
          }
        }
      }

      let neededXp = calculateXpToNextLevel(playerLevel);
      while (playerXp >= neededXp) {
        playerXp -= neededXp;
        playerLevel++;
        neededXp = calculateXpToNextLevel(playerLevel);
      }

      // Check Realm Tier
      let currentTier = state.realmTier;
      const updatedLifetime = state.lifetimeCoins + bonusCoins;
      for (const [tStr, threshold] of Object.entries(balanceData.tierThresholds)) {
        const tier = Number(tStr);
        if (updatedLifetime >= threshold && tier > currentTier) {
          currentTier = tier;
          EventBus.emit('TIER_UNLOCKED', {
            previousTier: state.realmTier,
            newTier: currentTier,
          });
        }
      }

      const remainingActiveQuestIds = activeQuestIds.filter((id) => !completedQuestIds.has(id));

      // Check achievements
      const unlockedAchievements = new Set(state.achievements.unlockedIds);
      for (const ach of achievementsData) {
        if (unlockedAchievements.has(ach.achievementId)) continue;

        let meetsCondition = false;
        const cond = ach.condition;

        if (cond.type === 'lifetime_coins') {
          meetsCondition = state.lifetimeCoins >= cond.threshold;
        } else if (cond.type === 'click_collect') {
          meetsCondition = state.stats.clickCollectCount >= cond.threshold;
        } else if (cond.type === 'realm_tier') {
          meetsCondition = currentTier >= cond.threshold;
        } else if (cond.type === 'produce_item' && cond.target) {
          meetsCondition = (state.stats.itemsProduced[cond.target as string] ?? 0) >= cond.threshold;
        } else if (cond.type === 'quest_completed' && cond.target) {
          meetsCondition = completedQuestIds.has(cond.target as string);
        } else if (cond.type === 'prestige_count') {
          meetsCondition = state.prestige.prestigeCount >= cond.threshold;
        } else if (cond.type === 'hire_worker') {
          meetsCondition = Object.keys(state.workers).length >= cond.threshold;
        } else if (cond.type === 'hire_manager') {
          meetsCondition = Object.keys(state.managers).length >= cond.threshold;
        } else if (cond.type === 'owned_plots') {
          meetsCondition = state.ownedPlots >= cond.threshold;
        } else if (cond.type === 'lifetime_tax_collected') {
          meetsCondition = state.treasury.lifetimeTaxCollected >= cond.threshold;
        } else if (cond.type === 'trade_revenue') {
          meetsCondition = state.trade.totalRevenue >= cond.threshold;
        } else if (cond.type === 'own_category' && cond.target) {
          meetsCondition = Object.values(state.buildings).some((b) => {
            const def = buildingsData.find((bd) => bd.id === b.defId);
            return def && def.category === cond.target;
          });
        }

        if (meetsCondition) {
          unlockedAchievements.add(ach.achievementId);
          EventBus.emit('ACHIEVEMENT_UNLOCKED', { achievementId: ach.achievementId });
        }
      }

      return {
        coins: state.coins + bonusCoins,
        lifetimeCoins: state.lifetimeCoins + bonusCoins,
        playerLevel,
        playerXp,
        realmTier: currentTier,
        prestige: {
          ...state.prestige,
          dynastySeals: state.prestige.dynastySeals + bonusSeals,
        },
        quests: {
          activeQuestIds: remainingActiveQuestIds,
          completedQuestIds: Array.from(completedQuestIds),
          objectivesProgress: objProgress,
          decisions: state.quests.decisions,
        },
        achievements: {
          unlockedIds: Array.from(unlockedAchievements),
          progress: state.achievements.progress,
        },
      };
    } catch (err) {
      console.error('[ProgressionEngine] Error during tick:', err);
      return null;
    }
  }
}
