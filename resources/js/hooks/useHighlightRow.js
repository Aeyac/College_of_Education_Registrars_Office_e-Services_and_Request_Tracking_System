import { usePage } from '@inertiajs/react';

import { useEffect } from 'react';

export default function useHighlightRow(prefix) {
    const { url } = usePage();

    useEffect(() => {
        const id = new URL(url, window.location.origin).searchParams.get(
            'highlight',
        );
        const row = id && document.getElementById(`${prefix}-${id}`);

        if (!row) {
            return;
        }

        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('row-blink');
        const timer = setTimeout(() => row.classList.remove('row-blink'), 3000);

        return () => {
            clearTimeout(timer);
            row.classList.remove('row-blink');
        };
    }, [url, prefix]);
}
