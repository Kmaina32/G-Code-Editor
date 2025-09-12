'use client';

import { Code, Download, FilePlus, Play, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore, File } from '@/lib/store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { suggestCodeImprovements } from '@/ai/flows/suggest-code-improvements';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function CodePilotPage() {
  const {
    files,
    openFileIds,
    activeFileId,
    loadInitialFiles,
    addFile,
    updateFileContent,
    openFile,
    closeFile,
    setActiveFile,
    deleteFile,
  } = useStore();
  const [output, setOutput] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialFiles();
  }, [loadInitialFiles]);

  const activeFile = useMemo(
    () => files.find(file => file.id === activeFileId),
    [files, activeFileId]
  );
  const openFiles = useMemo(
    () => openFileIds.map(id => files.find(f => f.id === id)).filter(Boolean) as File[],
    [openFileIds, files]
  );

  const handleRunCode = () => {
    if (!activeFile) return;

    if (['html', 'css', 'javascript'].includes(activeFile.language)) {
      const htmlFile = files.find(f => f.name.endsWith('.html'));
      const cssFile = files.find(f => f.name.endsWith('.css'));
      const jsFile = files.find(f => f.name.endsWith('.js'));

      const srcDoc = `
        <html>
          <head>
            <style>${cssFile?.content || ''}</style>
          </head>
          <body>
            ${htmlFile?.content || ''}
            <script>${jsFile?.content || ''}</script>
          </body>
        </html>
      `;
      setPreviewDoc(srcDoc);
      setOutput('');
      setActiveTab('preview');
    } else if (activeFile.language === 'python') {
      setOutput('Running Python code...\n(Execution is mocked on the client)');
      setPreviewDoc('');
      setActiveTab('console');
    }
  };

  const handleAddNewFile = () => {
    const fileName = prompt('Enter new file name (e.g., index.html, style.css, script.js, main.py)');
    if (fileName) {
      addFile(fileName);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!activeFile) return;
    setIsGenerating(true);
    setSuggestions([]);
    try {
      const result = await suggestCodeImprovements({
        code: activeFile.content,
        language: activeFile.language,
      });
      setSuggestions(result.suggestions);
      setShowSuggestions(true);
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

  const handleExportProject = async () => {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'codepilot-project.zip');
  };

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-headline">CodePilot</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={15} minSize={10}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 border-b">
              <h2 className="text-sm font-semibold">File Explorer</h2>
              <Button variant="ghost" size="icon" onClick={handleAddNewFile}>
                <FilePlus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-2">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between w-full text-left p-1.5 rounded-md text-sm hover:bg-accent ${activeFileId === file.id ? 'bg-accent' : ''}`}
                  >
                    <button
                      onClick={() => openFile(file.id)}
                      className="flex-grow text-left"
                    >
                      {file.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteFile(file.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={20}>
              <div className="flex flex-col h-full">
                {openFiles.length > 0 ? (
                  <Tabs
                    value={activeFileId}
                    onValueChange={setActiveFile}
                    className="flex flex-col flex-grow"
                  >
                    <div className="flex items-center justify-between border-b pr-2">
                      <TabsList className="bg-transparent border-none p-0 m-0">
                        {openFiles.map(file => (
                          <TabsTrigger
                            key={file.id}
                            value={file.id}
                            className="h-10 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                          >
                            {file.name}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                closeFile(file.id);
                              }}
                              className="ml-2 p-0.5 rounded hover:bg-muted"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                       <div className="flex items-center gap-2">
                        <Button
                          onClick={handleGenerateSuggestions}
                          size="sm"
                          variant="outline"
                          disabled={isGenerating || !activeFile}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'AI Suggest'}
                        </Button>
                        <Button
                          onClick={handleExportProject}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        <Button onClick={handleRunCode} size="sm" disabled={!activeFile}>
                          <Play className="mr-2 h-4 w-4" />
                          Run
                        </Button>
                      </div>
                    </div>
                    {openFiles.map(file => (
                      <TabsContent
                        key={file.id}
                        value={file.id}
                        className="flex-grow mt-0"
                      >
                        <Editor
                          height="100%"
                          language={file.language}
                          value={file.content}
                          onChange={content =>
                            updateFileContent(file.id, content || '')
                          }
                          theme="vs-dark"
                          options={{ minimap: { enabled: false } }}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a file to start editing or create a new one.
                  </div>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={10}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="console">Console</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="flex-grow bg-white mt-0">
                  <iframe
                    srcDoc={previewDoc}
                    title="Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals"
                  />
                </TabsContent>
                <TabsContent value="console" className="flex-grow mt-0">
                  <pre className="p-4 text-sm bg-muted h-full overflow-auto font-mono text-foreground">
                    {output}
                  </pre>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <AlertDialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Code Suggestions</AlertDialogTitle>
            <AlertDialogDescription>
              Here are some suggestions to improve your code:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-60">
            <ul className="space-y-2 p-4">
              {suggestions.map((s, i) => (
                <li key={i} className="text-sm p-2 bg-muted rounded">
                  {s}
                </li>
              ))}
            </ul>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuggestions(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
