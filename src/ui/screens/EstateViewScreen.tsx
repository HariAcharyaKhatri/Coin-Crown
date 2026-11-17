import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { EstateScene } from '../pixi/EstateScene';
import { Panel } from '../components/Panel';
import { Button } from '../components/Button';

export const EstateViewScreen: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const setSelectedBuilding = useUIStore((s) => s.setSelectedBuilding);
  const setActiveScreen = useUIStore((s) => s.setActiveScreen);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<EstateScene | null>(null);

  useEffect(() => {
    let scene: EstateScene | null = null;
    if (canvasRef.current) {
      scene = new EstateScene();
      sceneRef.current = scene;
      scene.init(canvasRef.current).then(() => {
        scene?.renderState(gameState, (instId) => {
          setSelectedBuilding(instId);
          setActiveScreen('building_detail');
        });
      });
    }

    return () => {
      scene?.destroy();
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.renderState(gameState, (instId) => {
        setSelectedBuilding(instId);
        setActiveScreen('building_detail');
      });
    }
  }, [gameState.buildings]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <Panel
        title="Estate Sovereign Realm"
        subtitle="Visual map of constructed holdings"
        headerAction={
          <Button variant="secondary" size="sm" onClick={() => setActiveScreen('buildings')}>
            + Build Holding
          </Button>
        }
      >
        <div style={{ width: '100%', height: '550px', background: '#120e0c', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      </Panel>
    </div>
  );
};
