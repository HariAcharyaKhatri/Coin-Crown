import React from 'react';
import { useUIStore, ScreenId } from '../../store/uiStore';
import styles from './MobileTabBar.module.css';

export const MobileTabBar: React.FC = () => {
  const activeScreen = useUIStore((s) => s.activeScreen);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);

  const tabs: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: '🏰' },
    { id: 'estate_view', label: 'Estate', icon: '🎨' },
    { id: 'market', label: 'Market', icon: '⚖️' },
    { id: 'quests', label: 'Quests', icon: '🛡️' },
  ];

  return (
    <nav className={styles.tabBar} role="navigation" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.id && !isMobileMenuOpen;
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => {
              setActiveScreen(tab.id);
              setMobileMenuOpen(false);
            }}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
      <button
        className={`${styles.tab} ${isMobileMenuOpen ? styles.active : ''}`}
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle All Screens Menu"
      >
        <span className={styles.icon}>☰</span>
        <span className={styles.label}>Menu</span>
      </button>
    </nav>
  );
};
