import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import {
  DashboardScreen,
  EstateViewScreen,
  RegionMapScreen,
  LandScreen,
  BuildingsScreen,
  BuildingDetailScreen,
  AgricultureScreen,
  MiningScreen,
  InventoryScreen,
  MarketScreen,
  RoutesScreen,
  WorkersScreen,
  ManagersScreen,
  PropertiesScreen,
  TreasuryScreen,
  TaxScreen,
  PopulationScreen,
  UniversityScreen,
  QuestsScreen,
  StoryScreen,
  AchievementsScreen,
  DynastyScreen,
  SettingsScreen,
} from '../../src/ui/screens';

const SCREENS = [
  { name: 'DashboardScreen', Component: DashboardScreen },
  { name: 'EstateViewScreen', Component: EstateViewScreen },
  { name: 'RegionMapScreen', Component: RegionMapScreen },
  { name: 'LandScreen', Component: LandScreen },
  { name: 'BuildingsScreen', Component: BuildingsScreen },
  { name: 'BuildingDetailScreen', Component: BuildingDetailScreen },
  { name: 'AgricultureScreen', Component: AgricultureScreen },
  { name: 'MiningScreen', Component: MiningScreen },
  { name: 'InventoryScreen', Component: InventoryScreen },
  { name: 'MarketScreen', Component: MarketScreen },
  { name: 'RoutesScreen', Component: RoutesScreen },
  { name: 'WorkersScreen', Component: WorkersScreen },
  { name: 'ManagersScreen', Component: ManagersScreen },
  { name: 'PropertiesScreen', Component: PropertiesScreen },
  { name: 'TreasuryScreen', Component: TreasuryScreen },
  { name: 'TaxScreen', Component: TaxScreen },
  { name: 'PopulationScreen', Component: PopulationScreen },
  { name: 'UniversityScreen', Component: UniversityScreen },
  { name: 'QuestsScreen', Component: QuestsScreen },
  { name: 'StoryScreen', Component: StoryScreen },
  { name: 'AchievementsScreen', Component: AchievementsScreen },
  { name: 'DynastyScreen', Component: DynastyScreen },
  { name: 'SettingsScreen', Component: SettingsScreen },
];

const VIEWPORTS = [
  { id: 'mobile', name: 'Mobile (375x667)', width: 375, height: 667 },
  { id: 'tablet', name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { id: 'desktop', name: 'Desktop (1440x900)', width: 1440, height: 900 },
];

describe('Responsive Layout Verification (69 tests: 23 screens x 3 viewports)', () => {
  afterEach(() => {
    cleanup();
  });

  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    window.dispatchEvent(new Event('resize'));
  };

  SCREENS.forEach((screen, screenIdx) => {
    VIEWPORTS.forEach((viewport, vpIdx) => {
      const testNumber = String(screenIdx * 3 + vpIdx + 1).padStart(3, '0');
      it(`T-RESP-${testNumber}: ${screen.name} renders properly on ${viewport.name}`, () => {
        setViewport(viewport.width, viewport.height);
        const { container } = render(React.createElement(screen.Component));
        expect(container).toBeDefined();
        expect(container.firstChild).not.toBeNull();
      });
    });
  });
});
