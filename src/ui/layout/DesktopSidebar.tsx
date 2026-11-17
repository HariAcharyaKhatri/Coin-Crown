import React from 'react';
import { useUIStore, ScreenId } from '../../store/uiStore';
import styles from './DesktopSidebar.module.css';

interface NavSection {
  title: string;
  items: { id: ScreenId; label: string; icon: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏰' },
      { id: 'estate_view', label: 'Estate Canvas', icon: '🎨' },
      { id: 'region_map', label: 'Eldoria Map', icon: '🗺️' },
      { id: 'land', label: 'Land & Plots', icon: '🌾' },
    ],
  },
  {
    title: 'Industry & Wealth',
    items: [
      { id: 'buildings', label: 'Buildings Catalogue', icon: '🔨' },
      { id: 'agriculture', label: 'Agriculture', icon: '🌱' },
      { id: 'mining', label: 'Mining & Smelting', icon: '⛏️' },
      { id: 'inventory', label: 'Inventory', icon: '📦' },
      { id: 'market', label: 'Market & Trading', icon: '⚖️' },
      { id: 'routes', label: 'Trade Routes', icon: '⛵' },
      { id: 'properties', label: 'Properties & Rent', icon: '🏡' },
    ],
  },
  {
    title: 'Governance & People',
    items: [
      { id: 'workers', label: 'Workers', icon: '👷' },
      { id: 'managers', label: 'Managers', icon: '👔' },
      { id: 'population', label: 'Demographics', icon: '👥' },
      { id: 'tax', label: 'Taxation & Unrest', icon: '📜' },
      { id: 'treasury', label: 'Royal Treasury', icon: '💰' },
      { id: 'university', label: 'University', icon: '🎓' },
    ],
  },
  {
    title: 'Chronicles & Dynasty',
    items: [
      { id: 'quests', label: 'Quest Journal', icon: '🛡️' },
      { id: 'story', label: 'Story Chronicles', icon: '📖' },
      { id: 'achievements', label: 'Achievements', icon: '🏆' },
      { id: 'dynasty', label: 'Dynasty & Legacy', icon: '👑' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ],
  },
];

export const DesktopSidebar: React.FC = () => {
  const activeScreen = useUIStore((s) => s.activeScreen);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>👑</span>
        <div>
          <h1 className={styles.brandTitle}>CROWN & COIN</h1>
          <p className={styles.brandSubtitle}>Dynasty of Eldoria</p>
        </div>
      </div>
      <nav className={styles.nav}>
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.title} className={styles.section}>
            <div className={styles.sectionTitle}>{sec.title}</div>
            <div className={styles.sectionItems}>
              {sec.items.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={() => setActiveScreen(item.id)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
