
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore, FileSystemItem, Folder } from "@/lib/store";
import { FilePlus, FolderPlus, Pencil, Trash2, Folder as FolderIcon, FolderOpen } from "lucide-react";
import { FileTypeIcon } from "@/components/codepilot-page";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const ExplorerItem: React.FC<{ item: FileSystemItem; level: number }> = ({ item, level }) => {
    const {
    openFile,
    activeFileId,
    renameItem,
    setFileToDelete,
    addFile,
    addFolder,
    toggleFolder,
  } = useStore();

  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [creatingName, setCreatingName] = useState('');

  const handleCreate = (type: 'file' | 'folder') => {
    setIsCreating(type);
    if(item.type === 'folder' && !item.isOpen) {
      toggleFolder(item.id);
    }
  };
  
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(creatingName && isCreating && item.type === 'folder'){
      if(isCreating === 'file'){
        addFile(creatingName, item.id);
      } else {
        addFolder(creatingName, item.id);
      }
    }
    setIsCreating(null);
    setCreatingName('');
  }

  const handleRename = (id: string, currentName: string) => {
    setRenamingItemId(id);
    setNewFileName(currentName);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingItemId && newFileName) {
      renameItem(renamingItemId, newFileName);
      setRenamingItemId(null);
      setNewFileName('');
    }
  };

  if (renamingItemId === item.id) {
    return (
      <li className="p-1" style={{ paddingLeft: `${level * 1.5 + 0.25}rem`}}>
        <form onSubmit={handleRenameSubmit} className="flex">
          <Input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onBlur={() => setRenamingItemId(null)}
          />
        </form>
      </li>
    );
  }

  if (item.type === 'folder') {
    return (
      <>
        <li key={item.id} className="group/menu-item relative">
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(`flex items-center w-full text-left p-1 rounded-md text-sm hover:bg-accent`, {
                'bg-accent/50': item.isOpen
            })}
            style={{ paddingLeft: `${level * 1.5 + 0.25}rem`}}
          >
            {item.isOpen ? <FolderOpen className="w-4 h-4 mr-2" /> : <FolderIcon className="w-4 h-4 mr-2" />}
            <span className="flex-grow truncate">{item.name}</span>
          </button>
          <div className="absolute right-1 top-0.5 flex items-center">
            <Tooltip>
                <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100" onClick={(e) => { e.stopPropagation(); handleCreate('file')}}>
                    <FilePlus className="h-3 w-3" />
                </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>New File</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100" onClick={(e) => { e.stopPropagation(); handleCreate('folder')}}>
                    <FolderPlus className="h-3 w-3" />
                </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>New Folder</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100" onClick={(e) => { e.stopPropagation(); handleRename(item.id, item.name);}}>
                  <Pencil className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Rename</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/menu-item:opacity-100" onClick={(e) => { e.stopPropagation(); setFileToDelete(item.id);}}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Delete</p></TooltipContent>
            </Tooltip>
          </div>
        </li>
        {isCreating && item.isOpen && (
             <li className="p-1" style={{ paddingLeft: `${(level + 1) * 1.5 + 0.25}rem`}}>
                <form onSubmit={handleCreateSubmit} className="flex gap-2">
                <Input
                    type="text"
                    value={creatingName}
                    onChange={(e) => setCreatingName(e.target.value)}
                    placeholder={`New ${isCreating}...`}
                    className="h-7 text-sm"
                    autoFocus
                    onBlur={() => { setIsCreating(null); setCreatingName(''); }}
                />
                </form>
            </li>
        )}
        {item.isOpen && item.children.map(child => <ExplorerItem key={child.id} item={child} level={level + 1} />)}
      </>
    );
  }

  return (
    <li key={item.id} className="group/menu-item relative">
      <button
        onClick={() => openFile(item.id)}
        className={`flex items-center w-full text-left p-1 rounded-md text-sm hover:bg-accent ${
          activeFileId === item.id ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.25}rem`}}
      >
        <FileTypeIcon language={item.language} className="w-4 h-4 mr-2" />
        <span className="flex-grow truncate">{item.name}</span>
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
                handleRename(item.id, item.name);
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
                setFileToDelete(item.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Delete File</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
};


export default function ExplorerPage() {
  const { fileTree, addFile, addFolder } = useStore();
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [creatingName, setCreatingName] = useState('');

  const handleCreate = (type: 'file' | 'folder') => {
    setIsCreating(type);
  }
  
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if(creatingName && isCreating){
      if(isCreating === 'file'){
        addFile(creatingName, null);
      } else {
        addFolder(creatingName, null);
      }
    }
    setIsCreating(null);
    setCreatingName('');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-muted-foreground px-2">
          EXPLORER
        </h2>
        <div className="flex">
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleCreate('file')} className="h-7 w-7">
                        <FilePlus className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>New File</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleCreate('folder')} className="h-7 w-7">
                        <FolderPlus className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>New Folder</p></TooltipContent>
            </Tooltip>
        </div>
      </div>
      <ul className="mt-2 space-y-px">
        {isCreating && (
          <li className="p-1">
            <form onSubmit={handleCreateSubmit} className="flex gap-2">
              <Input
                type="text"
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                placeholder={`New ${isCreating}...`}
                className="h-7 text-sm"
                autoFocus
                onBlur={() => { setIsCreating(null); setCreatingName(''); }}
              />
            </form>
          </li>
        )}
        {fileTree.map((item) => (
          <ExplorerItem key={item.id} item={item} level={0} />
        ))}
      </ul>
    </div>
  );
}
