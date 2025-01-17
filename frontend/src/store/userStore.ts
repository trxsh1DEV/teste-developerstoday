import { create } from 'zustand';

export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
