import React from 'react';
import { Button } from './Button';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Button
            key={tab.id}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                {tab.badge}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
