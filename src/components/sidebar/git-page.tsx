
"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { FileTypeIcon } from "@/components/codepilot-page";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { GitCommit, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function GitPage() {
  const { getFiles, commits, commitChanges, viewCommit } = useStore();
  const [commitMessage, setCommitMessage] = useState("");
  const { toast } = useToast();

  const allFiles = getFiles();
  const modifiedFiles = allFiles.filter(file => file.isModified && !file.isReadOnly);

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
    const numFiles = modifiedFiles.length;
    setCommitMessage("");
    toast({
        title: "Changes committed",
        description: `Committed ${numFiles} file(s).`,
    });
  };

  const handleViewCommit = (commitId: string) => {
    viewCommit(commitId);
    toast({
      title: "Viewing Commit",
      description: "Opened files from the selected commit in read-only mode.",
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
        <ScrollArea className="flex-grow max-h-48">
            <ul className="space-y-1">
            {modifiedFiles.map(file => (
                <li key={file.id} className="flex items-center text-sm p-1 rounded-md">
                    <FileTypeIcon language={file.language} className="w-4 h-4 mr-2" />
                    <span>{file.name}</span>
                </li>
            ))}
             {modifiedFiles.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 mt-2">No changes to commit.</p>
            )}
            </ul>
        </ScrollArea>
      </div>

       <div className="mt-4 flex-grow flex flex-col min-h-0">
        <h3 className="text-xs font-bold uppercase text-muted-foreground px-2 mb-1">
            Commit History
        </h3>
        <ScrollArea className="flex-grow">
            <ul className="space-y-3">
            {commits.map(commit => (
                <li key={commit.id} className="flex items-start text-sm p-1 rounded-md group/commit">
                    <GitCommit className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
                    <div className="flex-grow">
                        <p className="font-medium leading-tight">{commit.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(commit.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/commit:opacity-100"
                      onClick={() => handleViewCommit(commit.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                </li>
            ))}
             {commits.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 mt-2">No commits yet.</p>
            )}
            </ul>
        </ScrollArea>
      </div>
    </div>
  );
}
