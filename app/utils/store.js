import { create } from "zustand"

export const useStore = create((set) => ({
  loggedInUser: null,
  setLoggedInUser: (userData) => set({ loggedInUser: userData }),
  setLoggedOut: () => set({ loggedInUser: null }),
}))
