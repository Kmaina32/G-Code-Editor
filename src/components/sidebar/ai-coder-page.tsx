
"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Sparkles, User, Bot } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Textarea } from "../ui/textarea";
import { editCode, EditCodeOutput } from "@/ai/flows/edit-code";

declare global {
  interface Window {
    applyChanges: (changes: EditCodeOutput) => void;
  }
}

export default function AiCoderPage() {
  const { 
    openFileIds,
    findFile,
    isGenerating, 
    setIsGenerating, 
    aiCoderHistory, 
    addAiCoderMessage,
    commitChanges
  } = useStore();
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the history when it changes
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [aiCoderHistory]);

  const handleGenerateChanges = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt is empty",
        description: "Please enter a prompt to generate changes.",
      });
      return;
    }

    setIsGenerating(true);
    addAiCoderMessage({ role: 'user', content: prompt });
    setPrompt("");

    try {
      const openFiles = openFileIds.map(id => findFile(id)).filter(Boolean).map(f => ({ path: f!.path, content: f!.content }));
      
      if (openFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "No files open",
          description: "Please open the relevant files you want the AI to edit.",
        });
        addAiCoderMessage({ role: 'ai', content: { error: "No files were open. Please open the files you want to edit and try again." } });
        setIsGenerating(false);
        return;
      }
      
      const result = await editCode({
        prompt: prompt,
        files: openFiles,
      });

      addAiCoderMessage({ role: 'ai', content: result });
      
      // This function is provided by the parent environment to apply changes
      if (window.applyChanges) {
        window.applyChanges(result);
        commitChanges(result.commitMessage);
        toast({
          title: "AI Changes Applied & Committed",
          description: result.commitMessage,
        });
      } else {
         console.log("AI Generated Changes:", result);
         toast({
          title: "Changes Proposed by AI",
          description: "Check the developer console to see the proposed changes (applyChanges function not found).",
        });
      }

    } catch (error) {
      console.error('Error getting AI edit:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addAiCoderMessage({ role: 'ai', content: { error: errorMessage } });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate AI edits. Please check the console.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleGenerateChanges();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
       <ScrollArea className="flex-grow -mx-2 px-2" viewportRef={scrollAreaRef}>
        <div className="flex flex-col gap-4 pr-2">
          {aiCoderHistory.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'ai' && (
                <div className="p-2 rounded-full bg-primary/20">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className={`p-3 rounded-lg max-w-[85%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {typeof message.content === 'string' ? (
                  <p className="text-sm">{message.content}</p>
                ) : message.content.error ? (
                  <div className="text-destructive">
                    <p className="font-bold text-sm">Error</p>
                    <p className="text-xs">{message.content.error}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{message.content.description}</p>
                     <p className="text-xs text-muted-foreground italic">Commit: "{message.content.commitMessage}"</p>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="p-2 rounded-full bg-muted">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
           {isGenerating && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="p-3 rounded-lg bg-muted flex items-center">
                 <LoadingSpinner className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Enter your desired changes..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-24 text-sm"
          disabled={isGenerating}
        />
        <Button onClick={handleGenerateChanges} disabled={isGenerating}>
          {isGenerating ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate Changes"}
        </Button>
      </div>
    </div>
  );
}
