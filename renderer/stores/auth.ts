import { GithubUser } from '../types/github';
import { create } from 'zustand';

interface AuthData {
  user: GithubUser;
  token: string;
}

interface AuthStare {
  data: AuthData | null
  setData: (data: AuthData | null) => void;
}

export const useAuthStore = create<AuthStare>((set) => ({
  data: null,
  setData: (data) => set({ data })
}));
