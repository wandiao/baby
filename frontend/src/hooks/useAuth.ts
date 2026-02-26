import { useUserStore } from '@/stores/user';

export function useAuth() {
  const userStore = useUserStore();

  const checkAuth = () => {
    if (!userStore.token) {
      uni.redirectTo({
        url: '/pages/login/index',
      });

      return false;
    }

    return true;
  };

  return {
    checkAuth,
  };
}
