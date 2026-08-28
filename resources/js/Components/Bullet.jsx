export default function Bullet({ children }) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="flex-1">{children}</span>
        </li>
    );
}