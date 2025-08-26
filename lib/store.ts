import { create } from 'zustand';
import { Scenario } from './types';

interface AppState {
  scenario: Scenario | null;
  setScenario: (scenario: Scenario) => void;
}

export const useStore = create<AppState>((set) => ({
  scenario: null,
  setScenario: (scenario) => set({ scenario }),
}));
