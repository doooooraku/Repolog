import { create } from 'zustand';

import type { ProState } from '@/src/types/models';
import { proService, type PlanType } from '@/src/services/proService';

type ProStore = {
  state: ProState | null;
  isPro: boolean;
  initialized: boolean;
  busy: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  purchase: (plan: PlanType) => Promise<ProState>;
  restore: () => Promise<{ state: ProState; hasActive: boolean }>;
};

export const useProStore = create<ProStore>((set, get) => ({
  state: null,
  isPro: false,
  initialized: false,
  busy: false,
  init: async () => {
    if (get().initialized) return;
    const local = await proService.loadLocalState();
    if (local) {
      set({ state: local, isPro: local.isPro });
    }
    set({ initialized: true });
  },
  refresh: async () => {
    set({ busy: true });
    try {
      const state = await proService.refreshCustomerInfo();
      if (state) {
        set({ state, isPro: state.isPro, initialized: true });
      }
    } finally {
      set({ busy: false });
    }
  },
  purchase: async (plan) => {
    set({ busy: true });
    try {
      const state = await proService.purchase(plan);
      set({ state, isPro: state.isPro, initialized: true });
      return state;
    } finally {
      set({ busy: false });
    }
  },
  restore: async () => {
    set({ busy: true });
    try {
      const result = await proService.restore();
      set({ state: result.state, isPro: result.state.isPro, initialized: true });
      return result;
    } finally {
      set({ busy: false });
    }
  },
}));
