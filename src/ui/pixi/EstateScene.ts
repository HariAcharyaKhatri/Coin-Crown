import { Application, Container, Graphics, Text } from 'pixi.js';
import { GameState } from '../../engine/types/state';
import buildingsData from '../../data/buildings.json';

export class EstateScene {
  private app: Application | null = null;
  private rootContainer: Container | null = null;
  private buildingContainer: Container | null = null;

  public async init(canvas: HTMLCanvasElement): Promise<void> {
    try {
      this.app = new Application();
      await this.app.init({
        canvas,
        resizeTo: canvas.parentElement || undefined,
        backgroundColor: 0x1a1412,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      this.rootContainer = new Container();
      this.buildingContainer = new Container();
      this.rootContainer.addChild(this.buildingContainer);
      this.app.stage.addChild(this.rootContainer);
    } catch (err) {
      console.warn('[EstateScene] WebGL initialization fallback:', err);
    }
  }

  public renderState(state: GameState, onSelectBuilding?: (instanceId: string) => void): void {
    if (!this.app || !this.buildingContainer) return;

    this.buildingContainer.removeChildren();

    const buildings = Object.values(state.buildings);
    const cols = 5;
    const tileWidth = 100;
    const tileHeight = 80;
    const offsetX = 60;
    const offsetY = 60;

    buildings.forEach((inst, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = offsetX + col * (tileWidth + 20);
      const y = offsetY + row * (tileHeight + 20);

      const def = buildingsData.find((b) => b.id === inst.defId);
      const g = new Graphics();

      // Building tile
      let color = 0x7a9a3b; // agri
      if (def?.category === 'residential') color = 0xb36b3b;
      if (def?.category === 'industrial') color = 0x8c857b;
      if (def?.category === 'mining') color = 0x5c5c5c;
      if (def?.category === 'commercial') color = 0xd49a37;
      if (def?.category === 'royal') color = 0x8f447d;

      g.roundRect(0, 0, tileWidth, tileHeight, 8);
      g.fill({ color, alpha: 0.85 });
      g.stroke({ width: 2, color: 0xe5b24c });

      const nodeContainer = new Container();
      nodeContainer.x = x;
      nodeContainer.y = y;
      nodeContainer.eventMode = 'static';
      nodeContainer.cursor = 'pointer';
      nodeContainer.on('pointerdown', () => {
        if (onSelectBuilding) onSelectBuilding(inst.instanceId);
      });

      nodeContainer.addChild(g);

      // Building label
      const nameText = new Text({
        text: def ? def.name.slice(0, 12) : 'Holding',
        style: {
          fontSize: 11,
          fill: 0xffffff,
          fontWeight: 'bold',
        },
      });
      nameText.x = 8;
      nameText.y = 8;
      nodeContainer.addChild(nameText);

      // Level badge
      const lvlText = new Text({
        text: `Lvl ${inst.level}`,
        style: {
          fontSize: 10,
          fill: 0xe5b24c,
        },
      });
      lvlText.x = 8;
      lvlText.y = tileHeight - 20;
      nodeContainer.addChild(lvlText);

      this.buildingContainer!.addChild(nodeContainer);
    });
  }

  public destroy(): void {
    if (this.app) {
      try {
        this.app.destroy(true, { children: true });
      } catch {
        // Fallback for headless test environments
      }
      this.app = null;
    }
  }
}
