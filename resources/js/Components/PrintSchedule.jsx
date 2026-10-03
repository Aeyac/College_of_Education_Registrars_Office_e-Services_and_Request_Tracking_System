import { createPortal } from 'react-dom';

// PrintSchedule.jsx (print-dialog version)
// Hidden on screen, shown only when printing. Trigger it with window.print().

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_ALIASES = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4 };
const START_MIN = 7 * 60;   // 07:00 AM
const SLOT_MIN = 30;        // 30-minute rows
const SLOT_COUNT = 25;      // 07:00 AM to 07:30 PM

const GREEN_TEXT = '#4c9a1f', GREEN_CELL = '#b8e994', GRAY_CELL = '#a3a3a3', BORDER = '#d4d4d4';

const thStyle = { border: `1px solid ${BORDER}`, color: GREEN_TEXT, fontSize: 9.5, fontWeight: 700, padding: '6px 4px', textAlign: 'center', background: '#fff' };
const tdStyle = { border: `1px solid ${BORDER}`, padding: 0 };

const toMinutes = t => { const [h, m] = String(t || '0:0').split(':'); return parseInt(h, 10) * 60 + parseInt(m || '0', 10); };
const pad = n => String(n).padStart(2, '0');
const slotLabel = mins => `${pad(Math.floor(mins / 60) % 12 || 12)}:${pad(mins % 60)}`;                 // "07:00"
const clock12 = mins => `${slotLabel(mins)} ${Math.floor(mins / 60) >= 12 ? 'PM' : 'AM'}`;              // "07:00 AM"
const dayIndex = day => DAY_ALIASES[String(day || '').slice(0, 3).toLowerCase()];

// grid[dayIdx][slotIdx] = { block, span, start, end } for the first slot, 'covered' for the rest
function buildGrid(blocks) {
    const grid = DAYS.map(() => Array(SLOT_COUNT).fill(null));

    blocks.forEach(block => {
        const d = dayIndex(block.day);
        if (d === undefined) return;

        const start = toMinutes(block.start_time), end = toMinutes(block.end_time);
        const first = Math.max(0, Math.floor((start - START_MIN) / SLOT_MIN));
        const last = Math.min(SLOT_COUNT, Math.ceil((end - START_MIN) / SLOT_MIN));
        if (last - first <= 0) return;

        // skip if it would overlap an existing block
        for (let i = first; i < last; i++) if (grid[d][i]) return;

        grid[d][first] = { block, span: last - first, start, end };
        for (let i = first + 1; i < last; i++) grid[d][i] = 'covered';
    });

    return grid;
}

// Semester from today's date: mid June to mid Nov = 1st sem, late Nov to Apr = 2nd sem, May to mid June = midyear
const getSemesterLabel = (date = new Date()) => {
    const y = date.getFullYear(), md = (date.getMonth() + 1) * 100 + date.getDate(); // June 15 -> 615

    if (md >= 615 && md <= 1115) return `1st Semester SY ${y}-${y + 1}`;
    if (md >= 1116) return `2nd Semester SY ${y}-${y + 1}`;
    if (md <= 430) return `2nd Semester SY ${y - 1}-${y}`;
    return `Midyear SY ${y - 1}-${y}`;
};

// "07-06-2026 02:08 PM" (MM-DD-YYYY)
const getGeneratedStamp = (date = new Date()) => {
    const h = date.getHours();
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${date.getFullYear()} ${pad(h % 12 || 12)}:${pad(date.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function PrintSchedule({ prof, logoSrc = '/images/cedlogo.png' }) {
    const semester = getSemesterLabel(), generatedAt = getGeneratedStamp();
    const grid = buildGrid(prof.weekly_schedule || []);
    const facultyName = prof.name || 'Not specified';

    const sheet = (
        <div id="print-section" className="hidden print:block bg-white text-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', padding: '28px 28px 40px' }}>
            {/* margin: 0 hides the browser's own header/footer stamps (title, date, URL) */}
            <style>{`@page { size: A4 portrait; margin: 0; } @media print { body > :not(#print-section) { display: none !important; } html, body { height: auto !important; overflow: visible !important; background: #fff !important; } }`}</style>

            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    <img src={logoSrc} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: GREEN_TEXT, margin: 0 }}>Central Luzon State University</h1>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 6px' }}>Official Class Schedule</h2>
                {semester && <p style={{ fontSize: 11, fontStyle: 'italic', margin: '0 0 12px' }}>{semester}</p>}

                {/* Faculty bar */}
                <div style={{ display: 'flex', justifyContent: 'center', fontSize: 12, marginBottom: 18 }}>
                    <span style={{ background: GREEN_TEXT, color: '#fff', fontWeight: 700, padding: '3px 28px' }}>FACULTY</span>
                    <span style={{ background: GRAY_CELL, color: '#fff', padding: '3px 28px', minWidth: 240, textAlign: 'center' }}>{facultyName}</span>
                </div>
            </div>

            {/* Schedule grid */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: `1px solid ${BORDER}` }}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '12%' }}>TIME</th>
                        {DAYS.map(d => <th key={d} style={thStyle}>{d.toUpperCase()}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: SLOT_COUNT }, (_, s) => {
                        const slotStart = START_MIN + s * SLOT_MIN;
                        return (
                            <tr key={s} style={{ height: 28 }}>
                                <td style={{ ...tdStyle, fontSize: 9, textAlign: 'center' }}>{slotLabel(slotStart)} - {slotLabel(slotStart + SLOT_MIN)}</td>
                                {DAYS.map((_, d) => {
                                    const cell = grid[d][s];
                                    if (cell === 'covered') return null;
                                    if (!cell) return <td key={d} style={{ ...tdStyle, textAlign: 'center', color: '#888', fontSize: 9 }}>- -</td>;

                                    const { block, span, start, end } = cell;
                                    const isConsult = block.type === 'consultation';
                                    return (
                                        <td key={d} rowSpan={span} style={{ ...tdStyle, background: GREEN_CELL, textAlign: 'center', verticalAlign: 'middle', fontSize: 8.5, lineHeight: 1.25, padding: '2px 4px' }}>
                                            <div style={{ fontWeight: 700, fontStyle: 'italic' }}>{clock12(start)} - {clock12(end)}</div>
                                            <div style={{ fontWeight: 700, fontSize: 9.5, margin: '2px 0' }}>{isConsult ? 'Consultation' : block.course_code || '-'}</div>
                                            <div>{block.room || 'TBA'}</div>
                                            <div>{facultyName}</div>
                                            {!isConsult && block.section_code && <div>{block.section_code}</div>}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Generated timestamp, bottom left */}
            <p style={{ position: 'fixed', left: 28, bottom: 14, margin: 0, fontSize: 10, fontStyle: 'italic', color: '#8a8a8a' }}>
                Date and Time Generated: {generatedAt}
            </p>
        </div>
    );

    // Portal to <body> so the layout (navbar, sidebar, scroll container) never prints
    return typeof document === 'undefined' ? null : createPortal(sheet, document.body);
}