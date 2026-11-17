import React from 'react';
import { useUIStore } from './store/uiStore';
import { AppShell } from './ui/layout/AppShell';
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
} from './ui/screens';

export const App: React.FC = () => {
  const activeScreen = useUIStore((s) => s.activeScreen);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'estate_view':
        return <EstateViewScreen />;
      case 'region_map':
        return <RegionMapScreen />;
      case 'land':
        return <LandScreen />;
      case 'buildings':
        return <BuildingsScreen />;
      case 'building_detail':
        return <BuildingDetailScreen />;
      case 'agriculture':
        return <AgricultureScreen />;
      case 'mining':
        return <MiningScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'market':
        return <MarketScreen />;
      case 'routes':
        return <RoutesScreen />;
      case 'workers':
        return <WorkersScreen />;
      case 'managers':
        return <ManagersScreen />;
      case 'properties':
        return <PropertiesScreen />;
      case 'treasury':
        return <TreasuryScreen />;
      case 'tax':
        return <TaxScreen />;
      case 'population':
        return <PopulationScreen />;
      case 'university':
        return <UniversityScreen />;
      case 'quests':
        return <QuestsScreen />;
      case 'story':
        return <StoryScreen />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'dynasty':
        return <DynastyScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return <AppShell>{renderActiveScreen()}</AppShell>;
};

export default App;
