"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Input } from "../ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";

export default function SearchPage() {
  const { files, openFile } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Record<string, { lineNumber: number; line: string }[]>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      setResults({});
      return;
    }

    const newResults: Record<string, { lineNumber: number; line: string }[]> = {};
    files.forEach(file => {
      const lines = file.content.split('\n');
      const matches = lines.reduce((acc, line, index) => {
        if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
          acc.push({ lineNumber: index + 1, line: line.trim() });
        }
        return acc;
      }, [] as { lineNumber: number; line: string }[]);

      if (matches.length > 0) {
        newResults[file.id] = matches;
      }
    });
    setResults(newResults);
  };

  const fileCount = Object.keys(results).length;
  const matchCount = Object.values(results).reduce((sum, matches) => sum + matches.length, 0);

  return (
    <div>
      <h2 className="text-sm font-bold text-muted-foreground px-2 mb-2">
        SEARCH
      </h2>
      <form onSubmit={handleSearch}>
        <Input
          type="text"
          placeholder="Search in files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      {searchTerm && (
         <p className="text-xs text-muted-foreground mt-2 px-1">
          {matchCount} result{matchCount !== 1 && 's'} in {fileCount} file{fileCount !== 1 && 's'}
        </p>
      )}

      {Object.keys(results).length > 0 && (
        <Accordion type="multiple" className="w-full mt-2">
          {Object.entries(results).map(([fileId, matches]) => {
            const file = files.find(f => f.id === fileId);
            if (!file) return null;
            return (
              <AccordionItem value={fileId} key={fileId}>
                <AccordionTrigger className="text-sm font-semibold hover:no-underline px-1">
                  {file.name}
                  <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 ml-2">{matches.length}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {matches.map(({ lineNumber, line }) => (
                      <li key={`${fileId}-${lineNumber}`}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto py-1 px-2 text-left"
                            onClick={() => openFile(fileId)}
                          >
                            <span className="text-muted-foreground/70 mr-2 text-right w-6 shrink-0">{lineNumber}</span>
                            <code className="text-xs truncate">{line}</code>
                          </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  );
}
