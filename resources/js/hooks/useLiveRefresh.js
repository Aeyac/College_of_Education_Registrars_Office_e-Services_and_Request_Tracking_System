import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef } from 'react';
import {
    echoIsConnected,
    listenForNotifications,
    onEchoConnectionChange,
} from '@/lib/echo';

const DEFAULT_INTERVAL = 30000;

/**
 * Keeps a set of Inertia props fresh.
 *
 * Echo is the primary mechanism: with `realtime: true` the user's private
 * channel is subscribed and a broadcast notification triggers the same refresh.
 * Polling is only the fallback, and it runs whenever the socket cannot be
 * trusted — Echo was never configured, or the connection is not `connected`.
 *
 * Pages that have no dedicated broadcast event pass `realtime: false` and get
 * polling only, so they never open a second subscription on the shared channel.
 *
 * @param {object}   options
 * @param {string[]} [options.only]     Props to request, for a targeted partial reload.
 * @param {number}   [options.interval] Poll interval in ms. Defaults to 30s.
 * @param {boolean}  [options.realtime] Subscribe to the user channel and let
 *                                       polling stand down while it is healthy.
 * @param {boolean}  [options.enabled]  Suspend everything, e.g. while a modal is
 *                                       open or a mutation is in flight.
 */
export default function useLiveRefresh({
    only,
    interval = DEFAULT_INTERVAL,
    realtime = false,
    enabled = true,
} = {}) {
    const auth = usePage().props?.auth;
    const userId = auth?.user?.id ?? null;

    // `only` is often a literal built inside a component, so the callback keeps a
    // stable identity and reads the current prop list through a ref instead.
    const onlyRef = useRef(only);

    useEffect(() => {
        onlyRef.current = only;
    }, [only]);

    const refresh = useCallback(() => {
        router.reload({
            ...(onlyRef.current?.length ? { only: onlyRef.current } : {}),
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let intervalId = null;
        let wasPolling = false;

        const stopPolling = () => {
            if (intervalId === null) {
                return;
            }

            clearInterval(intervalId);
            intervalId = null;
        };

        const startPolling = () => {
            // One interval per hook instance, and never alongside a healthy
            // socket in realtime mode.
            if (intervalId !== null) {
                return;
            }

            if (realtime && echoIsConnected()) {
                return;
            }

            if (document.hidden) {
                return;
            }

            intervalId = setInterval(refresh, interval);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                wasPolling = intervalId !== null;
                stopPolling();

                return;
            }

            // The tab was backgrounded while polling, so catch up on anything
            // that changed before resuming.
            if (wasPolling) {
                wasPolling = false;
                refresh();
            }

            startPolling();
        };

        const handleConnectionChange = connected => {
            if (connected) {
                stopPolling();

                return;
            }

            startPolling();
        };

        const unsubscribeNotifications =
            realtime && userId
                ? listenForNotifications(userId, refresh)
                : () => {};
        const unsubscribeConnection = realtime
            ? onEchoConnectionChange(handleConnectionChange)
            : () => {};

        document.addEventListener('visibilitychange', handleVisibilityChange);
        startPolling();

        return () => {
            stopPolling();
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            unsubscribeNotifications();
            unsubscribeConnection();
        };
    }, [enabled, interval, realtime, userId, refresh]);
}
