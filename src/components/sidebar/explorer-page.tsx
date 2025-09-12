"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { FilePlus, Trash2 } from "lucide-react";
import { FileTypeIcon } from "@/app/page";
import { useState } from "react";

export default function ExplorerPage() {
  const { files, openFile, activeFileId, addFile, deleteFile } = useStore();
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleAddNewFile = () => {
    const fileName = prompt('Enter new file name (e.g., index.html, style.css, script.js, main.py)');
    if (fileName) {
      addFile(fileName);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-muted-foreground px-2">
          EXPLORER
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddNewFile}
              className="h-7 w-7"
            >
              <FilePlus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>New File</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <ul className="mt-2 space-y-1">
        {files.map((file) => (
          <li key={file.id} className="group/menu-item relative">
             <button
                onClick={() => openFile(file.id)}
                className={`flex items-center w-full text-left p-1 rounded-md text-sm hover:bg-accent ${activeFileId === file.id ? 'bg-accent' : ''}`}
            >
              <FileTypeIcon language={file.language} className="w-4 h-4 mr-2" />
              <span className="flex-grow truncate">{file.name}</span>
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-0.5 h-6 w-6 opacity-0 group-hover/menu-item:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, you'd trigger the dialog here
                    // For now, we'll just log it.
                    console.log("Attempting to delete file:", file.id)
                    deleteFile(file.id) // This still uses the direct delete from store
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Delete File</p>
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}
