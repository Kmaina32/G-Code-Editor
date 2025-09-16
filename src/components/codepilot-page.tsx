
'use client';

import {
  Code,
  Copy,
  Download,
  File as FileIcon,
  Play,
  Sparkles,
  Trash2,
  X,
  Plus,
  Split,
  PowerOff,
  Square,
  Eye,
  Folder,
  Search,
  GitBranch,
  Puzzle,
  Settings,
  PanelLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { executeCode } from '@/ai/flows/execute-code';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { UserNav } from '@/components/user-nav';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { AppSidebar } from '@/components/app-sidebar';
import 'xterm/css/xterm.css';
import type { TerminalComponent as TerminalComponentType } from '@/components/terminal';
import { cn } from '@/lib/utils';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const TerminalComponent = dynamic(
  () => import('@/components/terminal').then((mod) => mod.TerminalComponent),
  {
    ssr: false,
    loading: () => <p>Loading terminal...</p>,
  }
);

declare global {
  interface Window {
    loadPyodide: (options: {
      indexURL: string;
    }) => Promise<{
      runPython: (code: string) => any;
      setStdout: (options: { batched: (output: string) => void }) => void;
      setStderr: (options: { batched: (output: string) => void }) => void;
    }>;
  }
}

export function FileTypeIcon({
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
          viewBox="0 0 256 256"
          className={className}
        >
          <path
            fill="#E44D26"
            d="m43.335 229.47l-21.35-24.238l24.322-218.64h185.385l24.323 218.64l-21.35 24.238l-92.665 25.842z"
          />
          <path
            fill="#F16529"
            d="M128 235.918V26.592h92.453l-20.93 188.163z"
          />
          <path
            fill="#EBEBEB"
            d="m128 92.652v33.72h54.04l4.24-47.583H128V26.59h96.693l-.934 10.45l-5.34 60.272l-5.338.1zM128 160.05v40.32l51.87-13.91l6.217-69.67h-48.74v33.72h15.2l-3.36 37.89z"
          />
          <path
            fill="#FFFFFF"
            d="m128 92.652H70.13l3.36 37.89H128v-33.72zm0 107.718v-40.32H79.25l-2.427-27.208H128v-33.72H48.42l.73 8.18l6.216 69.67l72.633 20.21z"
          />
        </svg>
      );
    case 'css':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className={className}
        >
          <path
            fill="#264DE4"
            d="m43.335 229.47l-21.35-24.238l24.322-218.64h185.385l24.323 218.64l-21.35 24.238l-92.665 25.842z"
          />
          <path
            fill="#2965F1"
            d="M128 235.918V26.592h92.453l-20.93 188.163z"
          />
          <path
            fill="#EBEBEB"
            d="M128 92.652v33.72h55.05l-4.73 52.98l-50.32 13.58v40.97l91.44-24.59l.52-5.83l12.45-139.42l.52-5.83H128z"
          />
          <path
            fill="#FFFFFF"
            d="m128 92.652H70.13l3.36 37.89H128v-33.72zm-.1 75.927l-.05.013l-41.28-11.1l-2.8-31.32h-34.5l6.216 69.67l72.633 20.21v-40.8l.05-.013z"
          />
        </svg>
      );
    case 'javascript':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className={className}
        >
          <path fill="#F7DF1E" d="M0 0h256v256H0z" />
          <path d="M48.23 212.434h28.328l16.89-28.8H113.1c11.373 0 19.53-4.133 24.44-12.4c4.91-8.266 7.364-19.12 7.364-32.56c0-13.68-.981-24.373-2.944-32.08c-1.962-7.706-5.89-13.453-11.78-17.24c-5.89-3.787-13.45-5.68-22.68-5.68c-8.433 0-15.658 1.57-21.666 4.71c-6.008 3.14-10.74 7.527-14.197 13.16c-3.456 5.633-5.184 12.013-5.184 19.14h31.28c0-3.88.588-7.066 1.764-9.56c1.176-2.493 2.943-4.34 5.303-5.54c2.36-1.2 5.093-1.8 8.192-1.8c4.524 0 7.953.882 10.287 2.646c2.333 1.765 3.5 4.555 3.5 8.37c0 3.045-.54 5.76-1.62 8.14c-1.08 2.38-2.646 4.29-4.706 5.72c-2.06 1.43-4.632 2.49-7.722 3.18c-3.09.69-6.932 1.29-11.522 1.8L83.33 148.1c-11.23.98-20.04 3.75-26.43 8.31c-6.39 4.56-9.58 11.23-9.58 20.01c0 8.01 2.29 14.54 6.87 19.6s10.89 7.6 18.91 7.6c6.08 0 11.63-1.26 16.66-3.78s9.02-6.19 11.95-11.01s4.39-10.45 4.39-16.92H98.9c0 5.23-.78 9.28-2.34 12.16c-1.56 2.88-3.9 5.02-7.02 6.42c-3.12 1.4-6.68 2.1-10.68 2.1c-5.89 0-10.28-.98-13.16-2.94c-2.88-1.96-4.32-5.18-4.32-9.66c0-4.04 1.26-7.13 3.78-9.28c2.52-2.15 6.3-3.66 11.34-4.54l16.89-2.94c11.09-2.06 19.3-5.59 24.62-10.6c5.32-5.02 7.98-11.73 7.98-20.13c0-7.31-1.37-13.69-4.1-19.14c-2.73-5.45-6.68-9.82-11.85-13.11c-5.17-3.29-11.23-4.93-18.19-4.93c-8.67 0-16.12 2.2-22.36 6.6c-6.24 4.4-10.89 10.37-13.96 17.92c-3.06 7.55-4.6 16.06-4.6 25.53c0 9.87 1.52 18.57 4.57 26.09c3.04 7.52 7.72 13.57 14.02 18.14c6.3 4.57 14.28 6.86 23.94 6.86c9.33 0 17.54-2.1 24.63-6.29c7.09-4.19 12.49-10.15 16.2-17.88s5.56-16.89 5.56-27.48H220.5v-31.04h-44.18V212.43h31.28v-31.01h-31.28v-29.01h31.28V212.43zM176.32 212.434h31.28V83.565h-31.28v128.87z" />
        </svg>
      );
    case 'python':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className={className}
        >
          <path fill="#3776AB" d="M128 0h128v128H128z" />
          <path fill="#FFD43B" d="M0 128h128v128H0z" />
          <path
            fill="#FFFFFF"
            d="M110.18 64.9c0 4.7-3.8 8.5-8.5 8.5h-24.4v-17h24.4c4.7 0 8.5 3.8 8.5 8.5m-32.9-25.5h49.6c15.8 0 28.6 12.8 28.6 28.6v.7c0 10-5.3 18.8-13.3 24.1c10.5 4.4 17.7 14.8 17.7 26.6v7.2c0 15.8-12.8 28.6-28.6 28.6h-50.7V39.4zm54.3 64.1h-21.4v25.6h21.4c7.6 0 13.8-6.2 13.8-13.8v-8c0-7.6-6.2-13.8-13.8-13.8m101.42 86.9c0-4.7 3.8-8.5 8.5-8.5h24.4v17h-24.4c-4.7 0-8.5-3.8-8.5-8.5m32.9 25.5h-49.6c-15.8 0-28.6-12.8-28.6-28.6v-.7c0-10 5.3-18.8 13.3-24.1c-10.5-4.4-17.7-14.8-17.7-26.6v-7.2c0-15.8 12.8-28.6 28.6-28.6h50.7v116.7zm-54.3-64.1h21.4v-25.6h-21.4c-7.6 0-13.8 6.2-13.8 13.8v8c0 7.6 6.2 13.8 13.8 13.8"
          />
        </svg>
      );
    default:
      return <FileIcon className={className} />;
  }
}

const sidebarNavItems = [
  { id: 'explorer', title: 'Explorer', icon: Folder },
  { id: 'search', title: 'Search', icon: Search },
  { id: 'git', title: 'Source Control', icon: GitBranch },
  { id: 'extensions', title: 'Extensions', icon: Puzzle },
  { id: 'settings', title: 'Settings', icon: Settings },
];

export function CodePilotPage() {
  const {
    openFileIds,
    activeFileId,
    updateFileContent,
    closeFile,
    setActiveFile,
    deleteItem,
    fileToDelete,
    setFileToDelete,
    isLoading,
    editorSettings,
    getFiles,
    findFile,
    projectName,
  } = useStore();

  const files = getFiles();

  const [output, setOutput] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [activeTab, setActiveTab] = useState('terminal');
  const [isExecuting, setIsExecuting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const auth = getAuth(app);
  const terminalRef = useRef<TerminalComponentType | null>(null);
  const jsWorkerRef = useRef<Worker | null>(null);
  const pyodideRef = useRef<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarPage, setActiveSidebarPage] = useState('explorer');

  const handleSidebarToggle = (pageId: string) => {
    if (activeSidebarPage === pageId && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveSidebarPage(pageId);
      setIsSidebarOpen(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Initialize the JS Web Worker
    jsWorkerRef.current = new Worker('/js-worker.js');

    // Handle messages from the worker
    jsWorkerRef.current.onmessage = (event) => {
      const { type, message } = event.data;
      const formattedMessage = String(message).replace(/\n/g, '\r\n');
      if (type === 'log' || type === 'error') {
        terminalRef.current?.write(formattedMessage + '\r\n');
      }
      setIsExecuting(false);
      terminalRef.current?.write('$ ');
    };

    // Initialize Pyodide
    const initPyodide = async () => {
      if (window.loadPyodide) {
        setIsPyodideLoading(true);
        terminalRef.current?.write('Loading Pyodide...\r\n');
        try {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
          });
          pyodide.setStdout({
            batched: (output) => {
              terminalRef.current?.write(output.replace(/\n/g, '\r\n') + '\r\n');
            },
          });
          pyodide.setStderr({
            batched: (output) => {
              terminalRef.current?.write(output.replace(/\n/g, '\r\n') + '\r\n');
            },
          });
          pyodideRef.current = pyodide;
          terminalRef.current?.write('Pyodide loaded. Python is ready.\r\n');
        } catch (error) {
          console.error('Failed to load Pyodide:', error);
          terminalRef.current?.write('Error: Failed to load Pyodide.\r\n');
        } finally {
          setIsPyodideLoading(false);
          terminalRef.current?.write('$ ');
        }
      }
    };
    initPyodide();

    const handleIframeMessages = (event: MessageEvent) => {
      if (event.data && event.data.source === 'iframe') {
        setOutput((prev) => `${prev}[PREVIEW] ${event.data.message}\n`);
      }
    };
    window.addEventListener('message', handleIframeMessages);

    return () => {
      unsubscribe();
      jsWorkerRef.current?.terminate();
      window.removeEventListener('message', handleIframeMessages);
    };
  }, [auth]);

  useEffect(() => {
    // Live preview logic
    const allFiles = getFiles();
    const htmlFile = allFiles.find((f) => f.name.endsWith('.html'));
    const cssFile = allFiles.find((f) => f.name.endsWith('.css'));
    const jsFile = allFiles.find((f) => f.name.endsWith('.js'));

    const srcDoc = `
      <html>
        <head>
          <style>${cssFile?.content || ''}</style>
        </head>
        <body>
          ${htmlFile?.content || ''}
          <script>${
            jsFile?.content
              ? `
            // Web Worker based console for preview
            const iframeConsole = {
              log: (...args) => window.parent.postMessage({ source: 'iframe', type: 'log', message: args.join(' ') }, '*'),
              error: (...args) => window.parent.postMessage({ source: 'iframe', type: 'error', message: args.join(' ') }, '*'),
              warn: (...args) => window.parent.postMessage({ source: 'iframe', type: 'warn', message: args.join(' ') }, '*'),
            };
            window.console = { ...window.console, ...iframeConsole };
            
            try {
              ${jsFile.content}
            } catch (e) {
              console.error(e);
            }
          `
              : ''
          }</script>
        </body>
      </html>
    `;
    setPreviewDoc(srcDoc);
  }, [files, getFiles]);

  const activeFile = useMemo(
    () => findFile(activeFileId || ''),
    [findFile, activeFileId]
  );
  const openFiles = useMemo(
    () =>
      openFileIds
        .map((id) => findFile(id))
        .filter(Boolean) as File[],
    [openFileIds, findFile]
  );

  const getCommandForFile = (file: File) => {
    switch (file.language) {
      case 'python':
        return `python ${file.name}`;
      case 'javascript':
        return `node ${file.name}`;
      case 'html':
      case 'css':
        return 'preview';
      default:
        return `run ${file.name}`;
    }
  };

  const handleRunCode = async () => {
    if (!activeFile) return;

    if (activeFile.language === 'javascript') {
      setIsExecuting(true);
      terminalRef.current?.write(`\r\n> node ${activeFile.name}\r\n`);
      jsWorkerRef.current?.postMessage({ code: activeFile.content });
      setActiveTab('terminal');
    } else if (activeFile.language === 'python') {
      if (!pyodideRef.current) {
        toast({
          variant: 'destructive',
          title: 'Pyodide Not Ready',
          description: 'The Python runtime is still loading. Please wait.',
        });
        return;
      }
      setIsExecuting(true);
      setActiveTab('terminal');
      terminalRef.current?.write(`\r\n> python ${activeFile.name}\r\n`);
      try {
        await pyodideRef.current.runPython(activeFile.content);
      } catch (error) {
        console.error('Python execution error:', error);
        terminalRef.current?.write(String(error).replace(/\n/g, '\r\n'));
      } finally {
        setIsExecuting(false);
        terminalRef.current?.write('$ ');
      }
    } else if (activeFile.language === 'html') {
      // The live preview useEffect now handles this, but we can switch to the tab
      setActiveTab('preview');
    } else {
      setIsExecuting(true);
      const command = getCommandForFile(activeFile);
      terminalRef.current?.write(`\r\n> ${command}\r\n`);
      setActiveTab('terminal');
      try {
        const result = await executeCode({
          command: command,
          language: activeFile.language,
          code: activeFile.content,
        });
        terminalRef.current?.write(result.output.replace(/\n/g, '\r\n'));
      } catch (error) {
        console.error('Error executing code:', error);
        const errorMessage = `Error executing code: ${error}`;
        terminalRef.current?.write(errorMessage.replace(/\n/g, '\r\n'));
        toast({
          variant: 'destructive',
          title: 'Execution Error',
          description: 'Could not run the code on the backend.',
        });
      } finally {
        setIsExecuting(false);
        terminalRef.current?.write('$ ');
      }
    }
  };

  const handleTerminalSubmit = useCallback(
    async (command: string) => {
      if (!command) return;
      if (isExecuting) return;

      terminalRef.current?.write(`\r\n$ ${command}\r\n`);
      setIsExecuting(true);
      setActiveTab('terminal');

      try {
        const result = await executeCode({
          command: command,
          language: 'shell',
          code: '',
        });
        terminalRef.current?.write(result.output.replace(/\n/g, '\r\n'));
      } catch (error) {
        console.error('Error executing command:', error);
        const errorMessage = `Error: ${error}`;
        terminalRef.current?.write(errorMessage.replace(/\n/g, '\r\n'));
        toast({
          variant: 'destructive',
          title: 'Execution Error',
          description: 'Could not run the command on the backend.',
        });
      } finally {
        setIsExecuting(false);
        terminalRef.current?.focus();
        terminalRef.current?.write('$ ');
      }
    },
    [toast, isExecuting]
  );

  const handleExportProject = async () => {
    const zip = new JSZip();
    const allFiles = getFiles();
    allFiles.forEach((file) => {
      // Create folders in the zip file based on the file's path
      const pathParts = file.path.split('/').filter((p) => p);
      let currentFolder: JSZip | null = zip;
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentFolder = currentFolder.folder(pathParts[i]);
      }
      if (currentFolder) {
        currentFolder.file(file.name, file.content);
      } else {
        zip.file(file.name, file.content);
      }
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'codepilot-project.zip');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleRunCode();
      }
      if (ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleExportProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFile, getFiles]);

  const handleClearConsole = () => {
    setOutput('');
  };

  const handleClearTerminal = () => {
    terminalRef.current?.clear();
  };

  const handleCopyConsole = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: 'Copied to clipboard',
    });
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `codepilot-logs-${new Date().toISOString()}.txt`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <LoadingSpinner className="w-12 h-12" />
        <div className="flex items-center gap-2 mt-4">
          <Code className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold font-headline">CodePilot</h1>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background font-sans overflow-hidden">
        <header className="flex items-center justify-between h-14 px-2 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Code className="w-7 h-7 text-primary" />
              <h1 className="text-lg font-bold font-headline">CodePilot</h1>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-medium text-muted-foreground">{projectName}</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
               {sidebarNavItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeSidebarPage === item.id && isSidebarOpen ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => handleSidebarToggle(item.id)}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
            </div>
            <UserNav user={user} auth={auth} />
          </div>
        </header>
        <div className="flex flex-grow min-h-0">
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-grow min-w-0"
          >
            {isSidebarOpen && (
              <>
                <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                  <AppSidebar activePage={activeSidebarPage} />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            <ResizablePanel
              defaultSize={85}
              className="flex flex-col min-w-0"
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={70}
                  minSize={20}
                  className="flex flex-col min-h-0"
                >
                  <div className="flex flex-col h-full min-w-0">
                    {openFiles.length > 0 ? (
                      <Tabs
                        value={activeFileId || ''}
                        onValueChange={setActiveFile}
                        className="flex flex-col flex-grow min-h-0"
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
                                    {file.isReadOnly && ' (read-only)'}
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
                                fontSize: editorSettings.fontSize,
                                readOnly: file.isReadOnly,
                              }}
                            />
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Code className="w-24 h-24 mx-auto text-muted-foreground/20" />
                          <p className="mt-4 text-lg">
                            Select a file to begin
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Or create a new file to start coding.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={30}
                  minSize={10}
                  className="min-h-0"
                >
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col"
                  >
                    <div className="flex justify-between items-center pr-2 border-b">
                      <TabsList className="bg-transparent border-none">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="output">Output</TabsTrigger>
                        <TabsTrigger value="terminal">Terminal</TabsTrigger>
                      </TabsList>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleRunCode}
                            size="sm"
                            disabled={
                              isExecuting ||
                              !activeFile ||
                              isPyodideLoading ||
                              activeFile?.isReadOnly
                            }
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {isExecuting || isPyodideLoading ? (
                              <LoadingSpinner className="mr-2" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            {isExecuting ? 'Running...' : 'Run'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Run code and see preview (Ctrl+Enter)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <TabsContent
                      value="preview"
                      className="flex-grow bg-white mt-0 rounded-b-lg overflow-hidden"
                    >
                      <div className="w-full h-full overflow-hidden">
                        <iframe
                          srcDoc={previewDoc}
                          title="Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-modals"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="output"
                      className="flex-grow mt-0 flex flex-col"
                    >
                      <div className="flex items-center gap-2 border-b px-2 py-1 bg-muted/50">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleClearConsole}
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear Output</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCopyConsole}
                              className="h-6 w-6"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Output</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleDownloadLogs}
                              className="h-6 w-6"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download Logs</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <pre className="p-4 text-sm bg-muted flex-grow overflow-auto font-mono text-foreground rounded-b-lg">
                        {output}
                      </pre>
                    </TabsContent>
                    <TabsContent
                      value="terminal"
                      className="flex-grow mt-0 flex flex-col"
                    >
                      <div className="flex items-center gap-2 border-b px-2 py-1 bg-muted/50">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>New Terminal</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Split className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Split Terminal</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                            >
                              <PowerOff className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kill Terminal</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex-grow" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={handleClearTerminal}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stop Execution</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <TerminalComponent
                        ref={terminalRef}
                        onCommand={handleTerminalSubmit}
                        disabled={isExecuting}
                      />
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={() => setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file{' '}
              <span className="font-bold">
                {findFile(fileToDelete || '')?.name}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (fileToDelete) {
                  deleteItem(fileToDelete);
                  setFileToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
