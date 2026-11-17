import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../components/Panel';
import { Tabs } from '../components/Tabs';
import { ProgressBar } from '../components/ProgressBar';
import questsData from '../../data/quests.json';

export const QuestsScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  const tabs = [
    { id: 'active', label: 'Active Quests', badge: gameState.quests.activeQuestIds.length },
    { id: 'all', label: 'All 36 Quests', badge: `${gameState.quests.completedQuestIds.length} / 36` },
  ];

  const displayedQuests = activeTab === 'active'
    ? questsData.filter((q) => gameState.quests.activeQuestIds.includes(q.questId))
    : questsData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Panel title="The Royal Chronicle & Quests" subtitle="36 epic quests across the 10 chapters of the dynasty">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {displayedQuests.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
              No active quests in this ledger.
            </p>
          ) : (
            displayedQuests.map((quest) => {
              const isCompleted = gameState.quests.completedQuestIds.includes(quest.questId);
              const isActive = gameState.quests.activeQuestIds.includes(quest.questId);
              const progressMap = gameState.quests.objectivesProgress[quest.questId] ?? {};

              return (
                <div
                  key={quest.questId}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: isCompleted
                      ? '1px solid var(--color-accent-green)'
                      : isActive
                      ? '1px solid var(--color-gold)'
                      : '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Chapter {quest.chapter} • {quest.questId}
                      </span>
                      <h3 style={{ color: 'var(--color-text-main)' }}>{quest.title}</h3>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: isCompleted ? 'var(--color-accent-green)' : isActive ? 'var(--color-gold-dark)' : 'var(--color-bg-base)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                    {quest.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quest.objectives.map((obj, idx) => {
                      const cur = progressMap[idx] ?? (isCompleted ? obj.count : 0);
                      return (
                        <ProgressBar
                          key={idx}
                          value={cur}
                          max={obj.count}
                          label={`${obj.description}: ${cur} / ${obj.count}`}
                          color={isCompleted ? 'var(--color-accent-green)' : 'var(--color-gold)'}
                        />
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--color-gold-light)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <span>Rewards:</span>
                    {quest.rewards.map((r: any, i) => (
                      <span key={i}>
                        {r.amount} {r.type} {r.id ? `(${r.id})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>
    </div>
  );
};
