import { Application, Container, Graphics, Text } from 'pixi.js';
import regionsData from '../../data/regions.json';

export class RegionScene {
  private app: Application | null = null;
  private container: Container | null = null;

  public async init(canvas: HTMLCanvasElement): Promise<void> {
    try {
      this.app = new Application();
      await this.app.init({
        canvas,
        resizeTo: canvas.parentElement || undefined,
        backgroundColor: 0x120e0c,
        antialias: true,
      });

      this.container = new Container();
      this.app.stage.addChild(this.container);
    } catch (err) {
      console.warn('[RegionScene] Fallback:', err);
    }
  }

  public render(currentRegionId: string, unlockedRegions: string[], onSelect: (id: string) => void): void {
    if (!this.app || !this.container) return;
    this.container.removeChildren();

    // Continent map backdrop
    const bg = new Graphics();
    bg.rect(0, 0, 800, 500);
    bg.fill({ color: 0x1a242f, alpha: 0.5 });
    this.container.addChild(bg);

    // Region pins
    regionsData.forEach((region, idx) => {
      const x = 100 + (idx % 4) * 180;
      const y = 80 + Math.floor(idx / 4) * 140;

      const isUnlocked = unlockedRegions.includes(region.id);
      const isCurrent = currentRegionId === region.id;

      const pin = new Graphics();
      pin.circle(0, 0, isCurrent ? 24 : 18);
      pin.fill({ color: isCurrent ? 0xe5b24c : isUnlocked ? 0x48a356 : 0x423429 });
      pin.stroke({ width: 2, color: 0xffffff });

      const pinContainer = new Container();
      pinContainer.x = x;
      pinContainer.y = y;
      pinContainer.eventMode = 'static';
      pinContainer.cursor = isUnlocked ? 'pointer' : 'not-allowed';
      pinContainer.on('pointerdown', () => {
        if (isUnlocked) onSelect(region.id);
      });

      pinContainer.addChild(pin);

      const label = new Text({
        text: region.name,
        style: {
          fontSize: 12,
          fill: isCurrent ? 0xe5b24c : 0xffffff,
          fontWeight: isCurrent ? 'bold' : 'normal',
        },
      });
      label.x = -label.width / 2;
      label.y = 28;
      pinContainer.addChild(label);

      this.container!.addChild(pinContainer);
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
