import { RaciMatrix } from "@/components/RaciMatrix";

export default function ResourcesPage() {
    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Resources & RACI Matrix</h1>
            </header>

            <section>
                <h2 className="text-xl font-semibold mb-4 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                    Resource Allocations
                </h2>
                <RaciMatrix />
            </section>
        </div>
    );
}
