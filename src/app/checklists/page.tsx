import { ChecklistsWidget } from "@/components/ChecklistsWidget";

export default function ChecklistsPage() {
    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto h-[calc(100vh-80px)] lg:h-screen flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">To-Do & Checklists</h1>
                <p className="text-muted-foreground mt-2">Track global tasks and minor milestones.</p>
            </header>

            <div className="flex-1 min-h-0 pb-8">
                <ChecklistsWidget />
            </div>
        </div>
    );
}
