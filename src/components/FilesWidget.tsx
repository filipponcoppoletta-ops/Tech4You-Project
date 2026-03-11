"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Image as ImageIcon, File, UploadCloud, Trash2, Download } from "lucide-react";
import { useProject } from "@/lib/ProjectContext";
import { format, parseISO } from "date-fns";

export function FilesWidget() {
    const { files, addFile, deleteFile } = useProject();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // A very basic simulated upload that just takes the file info and saves it in local context
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];

            setIsUploading(true);

            // Simulate network wait
            setTimeout(() => {
                addFile({
                    id: `file-${Date.now()}`,
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type,
                    uploadDate: new Date().toISOString()
                });
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }, 1000);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
        if (type.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
        return <File className="h-8 w-8 text-slate-500" />;
    };

    return (
        <Card className="shadow-sm border-border/60 h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Project Documents
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Upload and manage your project assets here
                        </CardDescription>
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2"
                        >
                            {isUploading ? (
                                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-1" />
                            ) : (
                                <UploadCloud className="h-4 w-4" />
                            )}
                            {isUploading ? "Uploading..." : "Upload File"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                        <h3 className="font-semibold text-foreground">No files uploaded yet</h3>
                        <p className="text-sm mt-1 max-w-sm">Click the upload button to add your first document or image to the project.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map(file => (
                            <div key={file.id} className="border rounded-lg p-4 flex items-start gap-4 hover:border-primary/50 transition-colors bg-card group relative overflow-hidden">
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h4 className="font-medium text-sm truncate" title={file.name}>{file.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                                        <span>{formatSize(file.size)}</span>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span>{format(parseISO(file.uploadDate), "MMM d, yyyy")}</span>
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteFile(file.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
