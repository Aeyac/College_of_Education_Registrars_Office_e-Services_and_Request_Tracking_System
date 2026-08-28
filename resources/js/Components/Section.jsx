export default function Section({ title, children }) {
    return (
        <section className="mb-8 last:mb-0">
            <h3 className="text-xl font-extrabold text-slate-900 mt-8 mb-4 first:mt-0">{title}</h3>
            {children}
        </section>
    );
}