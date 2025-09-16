
"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { suggestCodeImprovements } from "@/ai/flows/suggest-code-improvements";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/loading-spinner";

export default function AiCoderPage() {
  const { activeFileId, findFile, isGenerating, setIsGenerating } = useStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const activeFile = findFile(activeFileId || '');

  const handleGenerateSuggestions = async () => {
    if (!activeFile) {
        toast({
            variant: "destructive",
            title: "No file selected",
            description: "Please open a file to get AI suggestions.",
        });
        return;
    };

    setIsGenerating(true);
    setSuggestions([]);
    try {
      const result = await suggestCodeImprovements({
        code: activeFile.content,
        language: activeFile.language,
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate AI suggestions.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={handleGenerateSuggestions} disabled={isGenerating || !activeFile}>
        {isGenerating ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {isGenerating ? "Analyzing..." : "Analyze Active File"}
      </Button>

      <ScrollArea className="mt-4 flex-grow">
        {suggestions.length > 0 ? (
            <ul className="space-y-3">
                {suggestions.map((s, i) => (
                    <li key={i} className="text-sm p-3 bg-background/50 rounded-lg border">
                        {s}
                    </li>
                ))}
            </ul>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground p-4">
                <p>
                    {isGenerating 
                        ? "The AI is analyzing your code..." 
                        : "Click the button to get AI-powered suggestions for your active file."}
                </p>
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
