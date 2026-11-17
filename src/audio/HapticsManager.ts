class HapticsManagerClass {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public tap() {
    if (this.enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore
      }
    }
  }

  public success() {
    if (this.enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 40, 20]);
      } catch {
        // Ignore
      }
    }
  }
}

export const HapticsManager = new HapticsManagerClass();
