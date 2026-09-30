import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

// 🔥 SAFETY CHECK: WebSockets are opt-in. If no broadcaster key is present the
// global is simply never created, every realtime helper in the app falls back to
// polling, and this never turns into a blank white screen.
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;

// The backend is the source of truth: `BROADCAST_CONNECTION` is `reverb` here,
// so Reverb is tried first. Pusher is kept as a secondary option for setups
// still pointed at Pusher Cloud. Both use pusher-js as the transport.
if (reverbKey) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else if (pusherKey) {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
        wsHost: import.meta.env.VITE_PUSHER_HOST
            ? import.meta.env.VITE_PUSHER_HOST
            : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
        wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
        wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
        forceTLS:
            (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else {
    console.warn(
        'No broadcaster key found in .env (VITE_REVERB_APP_KEY / VITE_PUSHER_APP_KEY). Echo is safely disabled; the app will poll for updates instead.',
    );
}
