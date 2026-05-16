import { create } from 'zustand';

interface InboxUIState {
  editingItemId: string | null;
  convertingItemId: string | null;
  setEditingItem: (id: string | null) => void;
  setConvertingItem: (id: string | null) => void;
  reset: () => void;
}

export const useInboxUIStore = create<InboxUIState>((set) => ({
  editingItemId: null,
  convertingItemId: null,

  setEditingItem: (id) => set({ editingItemId: id }),
  setConvertingItem: (id) => set({ convertingItemId: id }),
  reset: () => set({ editingItemId: null, convertingItemId: null }),
}));
