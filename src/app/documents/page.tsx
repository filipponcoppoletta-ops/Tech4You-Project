import { FilesWidget } from "@/components/FilesWidget";

export default function DocumentsPage() {
    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto h-[calc(100vh-80px)] lg:h-screen flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
                <p className="text-muted-foreground mt-2">Manage and upload files, PDFs, and assets for your project.</p>
            </header>

            <div className="flex-1 min-h-0 pb-8">
                <FilesWidget />
            </div>
        </div>
    );
}
