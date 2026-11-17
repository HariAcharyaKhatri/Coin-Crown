import { create } from 'zustand';

export type ScreenId =
  | 'dashboard'
  | 'estate_view'
  | 'region_map'
  | 'land'
  | 'buildings'
  | 'building_detail'
  | 'agriculture'
  | 'mining'
  | 'inventory'
  | 'market'
  | 'routes'
  | 'workers'
  | 'managers'
  | 'properties'
  | 'treasury'
  | 'tax'
  | 'population'
  | 'university'
  | 'quests'
  | 'story'
  | 'achievements'
  | 'dynasty'
  | 'settings';

export interface Toast {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
}

export interface UIState {
  activeScreen: ScreenId;
  selectedBuildingInstanceId: string | null;
  selectedRegionId: string | null;
  activeModal: string | null;
  toasts: Toast[];
  isMobileMenuOpen: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  setActiveScreen: (screen: ScreenId) => void;
  setSelectedBuilding: (id: string | null) => void;
  setSelectedRegion: (id: string | null) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeScreen: 'dashboard',
  selectedBuildingInstanceId: null,
  selectedRegionId: null,
  activeModal: null,
  toasts: [],
  isMobileMenuOpen: false,
  soundEnabled: true,
  hapticsEnabled: true,

  setActiveScreen: (screen) => set({ activeScreen: screen, isMobileMenuOpen: false }),
  setSelectedBuilding: (id) => set({ selectedBuildingInstanceId: id }),
  setSelectedRegion: (id) => set({ selectedRegionId: id }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  addToast: (text, type = 'info') => {
    const id = `toast.${Date.now()}.${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
}));
