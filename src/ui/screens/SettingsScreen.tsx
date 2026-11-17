import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';
import { SaveService } from '../../persistence/SaveService';
import { AudioManager } from '../../audio/AudioManager';
import { HapticsManager } from '../../audio/HapticsManager';

export const SettingsScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const resetGame = useGameStore((s) => s.resetGame);

  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);
  const hapticsEnabled = useUIStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useUIStore((s) => s.setHapticsEnabled);
  const addToast = useUIStore((s) => s.addToast);

  const [jsonText, setJsonText] = useState('');

  const handleSaveNow = async () => {
    try {
      await SaveService.save(gameState);
      addToast('Game state saved to IndexedDB successfully!', 'success');
    } catch (err) {
      addToast('Failed to save game state', 'warning');
    }
  };

  const handleExport = async () => {
    try {
      const data = await SaveService.exportSave();
      setJsonText(data);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data);
        addToast('Save JSON copied to clipboard!', 'success');
      }
    } catch (err) {
      addToast('Export failed', 'warning');
    }
  };

  const handleImport = async () => {
    if (!jsonText) return;
    try {
      const imported = await SaveService.importSave(jsonText);
      setGameState(imported);
      addToast('Save file imported successfully!', 'success');
    } catch (err: any) {
      addToast(`Import failed: ${err.message}`, 'warning');
    }
  };

  const handleHardReset = async () => {
    if (window.confirm('Are you certain? This will wipe all saved progress!')) {
      await SaveService.clearAll();
      resetGame();
      addToast('All game data cleared. Starting fresh.', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Panel title="Settings & Kingdom Chronicles" subtitle="Audio, tactile feedback, and offline database persistence">
        {/* Audio & Haptics */}
        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Sound & Sensory</h4>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button
              variant={soundEnabled ? 'primary' : 'secondary'}
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                AudioManager.setEnabled(next);
              }}
            >
              Sound Effects: {soundEnabled ? 'Enabled 🔊' : 'Muted 🔇'}
            </Button>

            <Button
              variant={hapticsEnabled ? 'primary' : 'secondary'}
              onClick={() => {
                const next = !hapticsEnabled;
                setHapticsEnabled(next);
                HapticsManager.setEnabled(next);
              }}
            >
              Haptic Vibration: {hapticsEnabled ? 'Active 📳' : 'Disabled 📴'}
            </Button>
          </div>
        </div>

        {/* Save & Data Management */}
        <div style={{ background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Database & Save Management</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Button variant="primary" onClick={handleSaveNow}>
              Manual Save
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              Export JSON
            </Button>
            <Button variant="secondary" disabled={!jsonText} onClick={handleImport}>
              Import JSON
            </Button>
            <Button variant="danger" onClick={handleHardReset} style={{ marginLeft: 'auto' }}>
              Hard Reset
            </Button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste raw save JSON string here to import..."
            style={{
              width: '100%',
              height: '140px',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: '#0a0807',
              color: 'var(--color-gold-light)',
            }}
          />
        </div>
      </Panel>
    </div>
  );
};
