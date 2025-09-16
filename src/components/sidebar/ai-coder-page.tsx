
"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Textarea } from "../ui/textarea";
import { editCode } from "@/ai/flows/edit-code";

export default function AiCoderPage() {
  const { getFiles, isGenerating, setIsGenerating } = useStore();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

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
    setResponse(null);
    try {
      const allFiles = getFiles().map(f => ({ path: f.path, content: f.content }));
      const result = await editCode({
        prompt: prompt,
        files: allFiles,
      });
      setResponse(result);
      console.log("AI Generated Changes:", result);
       toast({
        title: "Changes Proposed by AI",
        description: "Check the developer console to see the proposed changes.",
      });
    } catch (error) {
      console.error('Error getting AI edit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate AI edits. Please check the console.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Enter your desired changes... e.g., 'Add a new contact page with a form.'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-24 text-sm"
          disabled={isGenerating}
        />
        <Button onClick={handleGenerateChanges} disabled={isGenerating}>
          {isGenerating ? <LoadingSpinner className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate Changes"}
        </Button>
      </div>

      <ScrollArea className="flex-grow">
        {response ? (
            <div className="space-y-4 p-3 bg-background/50 rounded-lg border">
              <h4 className="font-bold">AI Response</h4>
              <p className="text-sm">{response.description}</p>
              <p className="text-xs text-muted-foreground">
                (Check developer console for full file changes)
              </p>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground p-4">
                <p>
                    {isGenerating 
                        ? "The AI is analyzing your project and generating changes..." 
                        : "Describe the changes you want to make to your project, and the AI will generate the new code for you."}
                </p>
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
