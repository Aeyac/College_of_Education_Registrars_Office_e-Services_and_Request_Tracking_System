import { router } from '@inertiajs/react';

export default function openNotification(notif, { onNavigate } = {}) {
    onNavigate?.();
    router.post(`/user/notifications/${notif.id}/mark-as-read`);
}
