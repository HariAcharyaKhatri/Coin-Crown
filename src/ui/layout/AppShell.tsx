import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore, ScreenId } from '../../store/uiStore';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileTabBar } from './MobileTabBar';
import { ToastContainer } from '../components/Toast';
import { formatCoins, formatNumber } from '../../utils/formatters';
import { calculateXpToNextLevel } from '../../engine/formulas/progression';
import { SaveService, SaveCorruptionError } from '../../persistence/SaveService';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const gameState = useGameStore((s) => s.gameState);
  const engine = useGameStore((s) => s.engine);
  const setGameState = useGameStore((s) => s.setGameState);
  const resetGame = useGameStore((s) => s.resetGame);
  const dispatch = useGameStore((s) => s.dispatch);

  const { isDesktop } = useResponsive();
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);
  const addToast = useUIStore((s) => s.addToast);

  const [corruptionModalOpen, setCorruptionModalOpen] = useState(false);
  const [exportData, setExportData] = useState('');

  // Start engine loop & attempt initial load from Dexie
  useEffect(() => {
    async function initLoad() {
      try {
        const loaded = await SaveService.load();
        if (loaded) {
          setGameState(loaded.state);
          addToast(`Game loaded from ${loaded.loadedFromSlot}`, 'info');
        }
      } catch (err) {
        if (err instanceof SaveCorruptionError) {
          setCorruptionModalOpen(true);
        } else {
          console.error('[AppShell] Load error:', err);
        }
      }

      engine.start(
        () => useGameStore.getState().gameState,
        (updated) => useGameStore.getState().setGameState(updated)
      );
    }

    initLoad();

    return () => {
      engine.stop();
    };
  }, []);

  const xpNeeded = calculateXpToNextLevel(gameState.playerLevel);
  const xpPct = Math.min(100, (gameState.playerXp / xpNeeded) * 100);

  const ALL_SCREENS: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏰' },
    { id: 'estate_view', label: 'Estate Canvas', icon: '🎨' },
    { id: 'region_map', label: 'Eldoria Map', icon: '🗺️' },
    { id: 'land', label: 'Land & Plots', icon: '🌾' },
    { id: 'buildings', label: 'Buildings Catalogue', icon: '🔨' },
    { id: 'agriculture', label: 'Agriculture', icon: '🌱' },
    { id: 'mining', label: 'Mining & Smelting', icon: '⛏️' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'market', label: 'Market & Trading', icon: '⚖️' },
    { id: 'routes', label: 'Trade Routes', icon: '⛵' },
    { id: 'properties', label: 'Properties & Rent', icon: '🏡' },
    { id: 'workers', label: 'Workers', icon: '👷' },
    { id: 'managers', label: 'Managers', icon: '👔' },
    { id: 'population', label: 'Demographics', icon: '👥' },
    { id: 'tax', label: 'Taxation & Unrest', icon: '📜' },
    { id: 'treasury', label: 'Royal Treasury', icon: '💰' },
    { id: 'university', label: 'University', icon: '🎓' },
    { id: 'quests', label: 'Quest Journal', icon: '🛡️' },
    { id: 'story', label: 'Story Chronicles', icon: '📖' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'dynasty', label: 'Dynasty & Legacy', icon: '👑' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className={styles.container}>
      {isDesktop && <DesktopSidebar />}

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.currencyBlock}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Coins</span>
              <span className={styles.statValueGold}>{formatCoins(gameState.coins)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Vault ({formatNumber(gameState.vault)}/{formatNumber(gameState.vaultCapacity)})</span>
              <button
                className={styles.vaultButton}
                onClick={() => dispatch({ type: 'EMPTY_VAULT' })}
                disabled={gameState.vault === 0}
                aria-label="Collect all vault coins"
              >
                Claim
              </button>
            </div>
          </div>

          <div className={styles.progressBlock}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Tier {gameState.realmTier} | Level {gameState.playerLevel}</span>
              <div className={styles.xpBarContainer}>
                <div className={styles.xpBarFill} style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Season</span>
              <span className={styles.statValue}>{gameState.season.currentSeason.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>

        {!isDesktop && <MobileTabBar />}

        {/* Mobile Full Screen Menu Modal */}
        {!isDesktop && isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)}>
            <div className={styles.mobileMenuDrawer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.mobileMenuHeader}>
                <h3 style={{ color: 'var(--color-gold)' }}>All Realms & Screens</h3>
                <Button size="sm" onClick={() => setMobileMenuOpen(false)}>✕</Button>
              </div>
              <div className={styles.mobileMenuList}>
                {ALL_SCREENS.map((sc) => (
                  <button
                    key={sc.id}
                    className={styles.mobileMenuItem}
                    onClick={() => setActiveScreen(sc.id)}
                  >
                    <span>{sc.icon}</span>
                    <span>{sc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Corruption Recovery Modal */}
        <Modal
          isOpen={corruptionModalOpen}
          onClose={() => setCorruptionModalOpen(false)}
          title="Save File Alert"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p>A corrupted save state was detected. You can export the damaged data for inspection or reset to start fresh.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="primary"
                onClick={async () => {
                  const raw = await SaveService.exportSave().catch(() => '{}');
                  setExportData(raw);
                }}
              >
                Inspect Raw Save
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetGame();
                  setCorruptionModalOpen(false);
                  addToast('Reset to clean initial state', 'info');
                }}
              >
                Reset Save
              </Button>
            </div>
            {exportData && (
              <textarea
                readOnly
                value={exportData}
                style={{ width: '100%', height: '150px', background: '#000', color: '#0f0', padding: '8px', fontSize: '12px' }}
              />
            )}
          </div>
        </Modal>

        <ToastContainer />
      </div>
    </div>
  );
};
