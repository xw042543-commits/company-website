import { setAccessTokenReader, setUnauthorizedHandler } from './services/http';
import { sessionStore } from './stores/session';

App<AppOptions>({
  globalData: {
    sessionStatus: 'unknown',
  },

  onLaunch() {
    setAccessTokenReader(() => sessionStore.getAccessToken());
    setUnauthorizedHandler(async () => (await sessionStore.refresh()).ok);
    sessionStore.subscribe((snapshot) => {
      this.globalData.sessionStatus = snapshot.status;
    });
    void sessionStore.restore();
  },
});
