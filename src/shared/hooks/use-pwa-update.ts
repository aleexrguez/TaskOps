import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS);
      }
    },
  });

  function dismissUpdate() {
    setNeedRefresh(false);
  }

  return { needRefresh, updateServiceWorker, dismissUpdate };
}
