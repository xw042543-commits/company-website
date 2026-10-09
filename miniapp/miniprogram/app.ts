import { setAccessTokenReader, setUnauthorizedHandler } from './services/http';
import { sessionStore } from './stores/session';
import { inboxStore } from './stores/inbox';

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
    inboxStore.start();
    void sessionStore.restore();
  },
  onShow() { void inboxStore.refreshCount(); },
});
