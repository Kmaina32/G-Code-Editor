"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { FileTypeIcon } from "@/app/page";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function GitPage() {
  const { files, commitChanges } = useStore();
  const [commitMessage, setCommitMessage] = useState("");
  const { toast } = useToast();

  const modifiedFiles = files.filter(file => file.isModified);

  const handleCommit = () => {
    if (!commitMessage) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter a commit message.",
        });
        return;
    }
    if(modifiedFiles.length === 0){
        toast({
            title: "No changes",
            description: "There are no changes to commit.",
        });
        return;
    }

    commitChanges(commitMessage);
    setCommitMessage("");
    toast({
        title: "Changes committed",
        description: `Committed ${modifiedFiles.length} file(s). (This is a simulation)`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold text-muted-foreground px-2 mb-2">
        SOURCE CONTROL
      </h2>
      
      <div className="flex flex-col p-2 border rounded-lg bg-background/30">
        <Textarea
          placeholder="Commit message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="mb-2 h-20 text-sm"
        />
        <Button onClick={handleCommit} size="sm" disabled={modifiedFiles.length === 0}>
            Commit {modifiedFiles.length > 0 ? `(${modifiedFiles.length})` : ''}
        </Button>
      </div>

      <div className="mt-4 flex-grow flex flex-col min-h-0">
        <h3 className="text-xs font-bold uppercase text-muted-foreground px-2 mb-1">
            Changes
        </h3>
        <ScrollArea className="flex-grow">
            <ul className="space-y-1">
            {modifiedFiles.map(file => (
                <li key={file.id} className="flex items-center text-sm p-1 rounded-md">
                    <FileTypeIcon language={file.language} className="w-4 h-4 mr-2" />
                    <span>{file.name}</span>
                </li>
            ))}
             {modifiedFiles.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 mt-2">No changes detected.</p>
            )}
            </ul>
        </ScrollArea>
      </div>
    </div>
  );
}
