export const INACTIVITY_TIMEOUT = 20 * 60 * 1000;

const activityEvents = ["mousemove", "pointerdown", "click", "keydown", "touchstart", "touchmove", "scroll"];
const listenerOptions = { capture: true, passive: true };

// One controller per app mount. Clock and auth boundaries are injectable for tests.
export function watchInactivity({
  getUser, subscribeToAuth, signOut, onTimeout,
  eventTarget = window, visibilityTarget = document,
  now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout,
  onError = error => console.error("Inactivity sign-out failed:", error),
}) {
  let session = null;
  let timer = null;
  let pendingLogout = null;
  let listening = false;
  let disposed = false;

  const authenticated = () => !disposed && session && getUser()?.uid === session.uid;
  const clear = () => {
    if (timer !== null) clearTimer(timer);
    timer = null;
  };
  const detach = () => {
    if (!listening) return;
    activityEvents.forEach(event => eventTarget.removeEventListener(event, activity, listenerOptions));
    eventTarget.removeEventListener("focus", checkDeadline);
    visibilityTarget.removeEventListener("visibilitychange", checkVisibility);
    listening = false;
  };
  const arm = () => {
    clear();
    if (authenticated()) timer = setTimer(checkDeadline, Math.max(0, session.deadline - now()));
  };
  const attach = () => {
    if (listening) return;
    activityEvents.forEach(event => eventTarget.addEventListener(event, activity, listenerOptions));
    eventTarget.addEventListener("focus", checkDeadline);
    visibilityTarget.addEventListener("visibilitychange", checkVisibility);
    listening = true;
  };

  async function expire() {
    if (!authenticated() || (pendingLogout && !pendingLogout.cancelled)) return;
    const attempt = { cancelled: false };
    pendingLogout = attempt;
    clear();
    detach();
    try {
      await signOut();
      if (!disposed && !attempt.cancelled && !getUser()) onTimeout();
    } catch (error) {
      if (!disposed && !attempt.cancelled && authenticated()) {
        // Keep monitoring if Firebase rejects the operation; never pretend it succeeded.
        session.deadline = now() + INACTIVITY_TIMEOUT;
        attach();
        arm();
        onError(error);
      }
    } finally {
      if (pendingLogout === attempt) pendingLogout = null;
    }
  }

  function checkDeadline() {
    if (!authenticated() || (pendingLogout && !pendingLogout.cancelled)) return;
    if (now() >= session.deadline) void expire();
    else arm();
  }
  function checkVisibility() {
    if (!visibilityTarget.hidden) checkDeadline();
  }
  function activity() {
    if (!authenticated() || (pendingLogout && !pendingLogout.cancelled)) return;
    // An event after a suspended tab's deadline cannot revive an expired session.
    if (now() >= session.deadline) { void expire(); return; }
    session.deadline = now() + INACTIVITY_TIMEOUT;
    arm();
  }

  const unsubscribe = subscribeToAuth(user => {
    if (disposed || (user?.uid || null) === (session?.uid || null)) return;
    clear();
    detach();
    if (user && pendingLogout) pendingLogout.cancelled = true;
    session = user ? { uid: user.uid, deadline: now() + INACTIVITY_TIMEOUT } : null;
    if (session) { attach(); arm(); }
  });

  return {
    activity,
    dispose() {
      disposed = true;
      clear();
      detach();
      unsubscribe();
    },
  };
}
