/**
 * Thin, null-safe accessors around the global Laravel Echo instance.
 *
 * `window.Echo` is only created in `bootstrap.js` when a broadcaster key is
 * present in the environment, so every helper here has to assume it may be
 * missing entirely (WebSockets completely unavailable). Each one degrades to a
 * no-op so callers never need their own guards.
 */

export const getEcho = () =>
    typeof window !== 'undefined' && window.Echo ? window.Echo : null;

export const userChannelName = userId => `App.Models.User.${userId}`;

/**
 * Pusher — and therefore Reverb — exposes a connection state machine. Only
 * `connected` means broadcasts can actually reach us; every other state
 * (`initialized`, `connecting`, `disconnected`, `unavailable`, `failed`) means
 * the realtime path is unusable and polling has to take over.
 */
export const echoIsConnected = () => {
    const state = getEcho()?.connector?.pusher?.connection?.state;

    return state === 'connected';
};

/**
 * Subscribes to a private-channel broadcast notification. Returns an
 * unsubscribe function, or a no-op when Echo is unavailable.
 */
export const listenForNotifications = (userId, handler) => {
    const echo = getEcho();

    if (!echo || !userId) {
        return () => {};
    }

    echo.private(userChannelName(userId)).notification(handler);

    return () => {
        // `notification()` exposes no per-listener removal, so leaving the
        // channel is the only way to drop the underlying binding. Callers are
        // responsible for making sure nothing else is on this channel.
        getEcho()?.leave(userChannelName(userId));
    };
};

/**
 * Watches the socket connection state so callers can start or stop their
 * polling fallback. `handler` receives `true` only while the socket is
 * connected. Returns an unsubscribe function.
 */
export const onEchoConnectionChange = handler => {
    const connection = getEcho()?.connector?.pusher?.connection;

    if (!connection?.bind) {
        return () => {};
    }

    const listener = state => handler(state === 'connected');

    connection.bind('state_change', listener);

    return () => connection.unbind('state_change', listener);
};
