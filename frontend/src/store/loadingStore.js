import { create } from 'zustand'

const useLoadingStore = create((set) => ({
  isLoading: false,
  message: '',
  showLoader: (message = 'Memproses...') => set({ isLoading: true, message }),
  hideLoader: () => set({ isLoading: false, message: '' }),
}))

export default useLoadingStore
