'use client';

import {
  Code,
  Download,
  File as FileIcon,
  FilePlus,
  Play,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function FileTypeIcon({
  language,
  className,
}: {
  language: string;
  className?: string;
}) {
  switch (language) {
    case 'html':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m10 13-1.1 2.2a.9.9 0 0 1-1.7-.1L6 13" />
          <path d="m18 13-1.1 2.2a.9.9 0 0 1-1.7-.1L14 13" />
          <path d="M12 19.5V13" />
        </svg>
      );
    case 'css':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m10.5 13.5.5-1.5 5.5 2" />
          <path d="m9 16.5 5.5-1" />
          <path d="m14.5 12.5.5 2 5.5-1" />
          <path d="m8 19 5.5-1" />
        </svg>
      );
    case 'javascript':
       return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M10 12h-1" />
          <path d="M14 12h1" />
          <path d="M10 18H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 1v-2a1 1 0 0 0 1-1h2a1 1 0 0 0 1 1v2a1 1 0 0 0 1 1h1" />
          <path d="M14 18h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1Z" />
        </svg>
      );
    case 'python':
       return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M11.5 12.5h1" />
          <path d="M15 16h-1a1.5 1.5 0 0 1-3 0h-1" />
          <path d="M15 13a2 2 0 0 0-2-2H9v6" />
          <path d="M12.5 19.5v-3" />
          <path d="M9 16a2 2 0 0 0 2 2h2" />
        </svg>
      );
    default:
      return <FileIcon className={className} />;
  }
}

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
    () => files.find((file) => file.id === activeFileId),
    [files, activeFileId]
  );
  const openFiles = useMemo(
    () =>
      openFileIds
        .map((id) => files.find((f) => f.id === id))
        .filter(Boolean) as File[],
    [openFileIds, files]
  );

  const handleRunCode = () => {
    if (!activeFile) return;

    if (['html', 'css', 'javascript'].includes(activeFile.language)) {
      const htmlFile = files.find((f) => f.name.endsWith('.html'));
      const cssFile = files.find((f) => f.name.endsWith('.css'));
      const jsFile = files.find((f) => f.name.endsWith('.js'));

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
    const fileName = prompt(
      'Enter new file name (e.g., index.html, style.css, script.js, main.py)'
    );
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
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'codepilot-project.zip');
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex flex-col h-screen bg-background font-sans overflow-x-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Code className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold font-headline">CodePilot</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <div className="flex flex-grow min-h-0">
            <Sidebar>
              <SidebarContent>
                <SidebarHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">File Explorer</h2>
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
                </SidebarHeader>
                <SidebarMenu>
                  {files.map((file) => (
                    <SidebarMenuItem key={file.id}>
                      <SidebarMenuButton
                        onClick={() => openFile(file.id)}
                        isActive={activeFileId === file.id}
                        className="justify-start w-full"
                      >
                        <FileTypeIcon
                          language={file.language}
                          className="w-4 h-4"
                        />
                        <span className="flex-grow text-left">{file.name}</span>
                      </SidebarMenuButton>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1.5 h-6 w-6 opacity-0 group-hover/menu-item:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFile(file.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Delete File</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>

            <ResizablePanelGroup direction="horizontal" className="flex-grow min-w-0">
              <ResizablePanel defaultSize={85} className="flex flex-col min-w-0">
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={70} minSize={20} className="flex flex-col min-h-0">
                    <div className="flex flex-col h-full">
                      {openFiles.length > 0 ? (
                        <Tabs
                          value={activeFileId || ''}
                          onValueChange={setActiveFile}
                          className="flex flex-col flex-grow min-w-0"
                        >
                          <div className="flex items-center justify-between border-b bg-muted/30">
                            <ScrollArea className="h-full w-full overflow-x-auto">
                              <TabsList className="flex w-max bg-transparent border-none p-0 m-0">
                                {openFiles.map((file) => (
                                  <div
                                    key={file.id}
                                    className="relative group/tab"
                                  >
                                    <TabsTrigger
                                      value={file.id}
                                      className="h-10 pr-8 border-b-2 border-r border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-background"
                                    >
                                      <FileTypeIcon
                                        language={file.language}
                                        className="w-4 h-4 mr-2"
                                      />
                                      {file.name}
                                    </TabsTrigger>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        closeFile(file.id);
                                      }}
                                      className="absolute top-1/2 right-1.5 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20 opacity-0 group-hover/tab:opacity-100"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </TabsList>
                            </ScrollArea>
                            <div className="flex items-center gap-2 p-2 shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={handleGenerateSuggestions}
                                    size="sm"
                                    variant="outline"
                                    disabled={isGenerating || !activeFile}
                                  >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isGenerating
                                      ? 'Generating...'
                                      : 'AI Suggest'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Get AI suggestions for the current file
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={handleExportProject}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download project as a .zip file</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={handleRunCode}
                                    size="sm"
                                    disabled={!activeFile}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Run
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Run code and see preview</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          {openFiles.map((file) => (
                            <TabsContent
                              key={file.id}
                              value={file.id}
                              className="flex-grow mt-0 min-h-0"
                            >
                              <Editor
                                height="100%"
                                language={file.language}
                                value={file.content}
                                onChange={(content) =>
                                  updateFileContent(file.id, content || '')
                                }
                                theme="vs-dark"
                                options={{
                                  minimap: { enabled: false },
                                  lineNumbers: 'on',
                                }}
                              />
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                           <div className="text-center">
                            <Code className="w-24 h-24 mx-auto text-muted-foreground/20" />
                            <p className="mt-4 text-lg">Select a file to begin</p>
                            <p className="text-sm text-muted-foreground">Or create a new file to start coding.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={10} className="min-h-0">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="h-full flex flex-col"
                    >
                      <TabsList>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="console">Console</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="preview"
                        className="flex-grow bg-white mt-0 rounded-b-lg overflow-hidden"
                      >
                        <iframe
                          srcDoc={previewDoc}
                          title="Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-modals"
                        />
                      </TabsContent>
                      <TabsContent
                        value="console"
                        className="flex-grow mt-0"
                      >
                        <pre className="p-4 text-sm bg-muted h-full overflow-auto font-mono text-foreground rounded-b-lg">
                          {output}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
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
      </SidebarProvider>
    </TooltipProvider>
  );
}
