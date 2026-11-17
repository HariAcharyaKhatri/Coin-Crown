import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Tabs } from '../components/Tabs';
import achievementsData from '../../data/achievements.json';

export const AchievementsScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const [activeTab, setActiveTab] = useState<'all' | 'lifetime' | 'story' | 'daily' | 'weekly'>('all');

  const tabs = [
    { id: 'all', label: 'All 60 Achievements', badge: `${gameState.achievements.unlockedIds.length} / 60` },
    { id: 'lifetime', label: 'Lifetime (42)' },
    { id: 'story', label: 'Story (10)' },
    { id: 'daily', label: 'Daily (5)' },
    { id: 'weekly', label: 'Weekly (3)' },
  ];

  const filteredAchievements = achievementsData.filter((a) => {
    if (activeTab === 'all') return true;
    return a.scope === activeTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <Panel title="Hall of Royal Achievements" subtitle="60 milestones celebrating dynastic prowess and economic supremacy">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {filteredAchievements.map((ach) => {
            const isUnlocked = gameState.achievements.unlockedIds.includes(ach.achievementId);

            return (
              <div
                key={ach.achievementId}
                style={{
                  background: isUnlocked ? 'rgba(229, 178, 76, 0.08)' : 'var(--color-bg-elevated)',
                  border: isUnlocked ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  opacity: isUnlocked ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: isUnlocked ? 'var(--color-gold)' : 'var(--color-text-main)' }}>
                    {ach.title}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: isUnlocked ? 'var(--color-accent-green)' : 'var(--color-bg-base)',
                      color: '#fff',
                    }}
                  >
                    {isUnlocked ? 'Completed' : 'Locked'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {ach.description}
                </p>

                <div style={{ fontSize: '11px', color: 'var(--color-gold-light)', marginTop: 'auto' }}>
                  Reward: {ach.reward.map((r) => `${r.amount} ${r.type}`).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
