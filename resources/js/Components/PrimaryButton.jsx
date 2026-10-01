export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center min-h-[44px] rounded-xl border border-transparent bg-yellow-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm transition-all duration-150 ease-in-out select-none cursor-pointer hover:bg-yellow-500 active:bg-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${className}`
            }
        >
            {children}
        </button>
    );
}