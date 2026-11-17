export class AnimationController {
  private running = false;
  private callbacks: ((delta: number) => void)[] = [];

  public add(cb: (delta: number) => void): () => void {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  public update(delta: number): void {
    if (!this.running) return;
    for (const cb of this.callbacks) {
      cb(delta);
    }
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
  }
}
