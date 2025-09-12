"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import { FilePlus, Pencil, Trash2 } from "lucide-react";
import { FileTypeIcon } from "@/app/page";
import { useState } from "react";
import { Input } from "../ui/input";

export default function ExplorerPage() {
  const {
    files,
    openFile,
    activeFileId,
    addFile,
    renameFile,
    setFileToDelete,
  } = useStore();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creatingFileName, setCreatingFileName] = useState('');

  const handleAddNewFile = () => {
    setIsCreating(true);
  };

  const handleCreateFile = () => {
    if (creatingFileName) {
      addFile(creatingFileName);
      setIsCreating(false);
      setCreatingFileName('');
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setRenamingFileId(id);
    setNewFileName(currentName);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingFileId && newFileName) {
      renameFile(renamingFileId, newFileName);
      setRenamingFileId(null);
      setNewFileName('');
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
        {isCreating && (
          <li className="p-1">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateFile(); }} className="flex gap-2">
              <Input
                type="text"
                value={creatingFileName}
                onChange={(e) => setCreatingFileName(e.target.value)}
                placeholder="Enter file name"
                className="h-7 text-sm"
                autoFocus
                onBlur={() => { setIsCreating(false); setCreatingFileName(''); }}
              />
              <Button type="submit" size="sm" className="h-7">Create</Button>
            </form>
          </li>
        )}
        {files.map((file) =>
          renamingFileId === file.id ? (
            <li key={file.id} className="p-1">
              <form onSubmit={handleRenameSubmit} className="flex">
                <Input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                  onBlur={() => setRenamingFileId(null)}
                />
              </form>
            </li>
          ) : (
            <li key={file.id} className="group/menu-item relative">
              <button
                onClick={() => openFile(file.id)}
                className={`flex items-center w-full text-left p-1 rounded-md text-sm hover:bg-accent ${
                  activeFileId === file.id ? 'bg-accent' : ''
                }`}
              >
                <FileTypeIcon language={file.language} className="w-4 h-4 mr-2" />
                <span className="flex-grow truncate">{file.name}</span>
              </button>
              <div className="absolute right-1 top-0.5 flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(file.id, file.name);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Rename File</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Delete File</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
