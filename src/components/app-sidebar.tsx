"use client";

import { useState } from "react";
import { Folder, Search, GitBranch, Settings, Puzzle, PanelLeft } from "lucide-react";
import ExplorerPage from "./sidebar/explorer-page";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import ExtensionsPage from "./sidebar/extensions-page";
import SearchPage from "./sidebar/search-page";
import GitPage from "./sidebar/git-page";
import SettingsPage from "./sidebar/settings-page";
import { Button } from "./ui/button";

const pages: Record<
  string,
  { component: JSX.Element; icon: React.ReactNode; title: string }
> = {
  explorer: {
    component: <ExplorerPage />,
    icon: <Folder className="h-5 w-5" />,
    title: "Explorer",
  },
  search: { component: <SearchPage />, icon: <Search className="h-5 w-5" />, title: "Search" },
  git: { component: <GitPage />, icon: <GitBranch className="h-5 w-5" />, title: "Source Control" },
  extensions: {
    component: <ExtensionsPage />,
    icon: <Puzzle className="h-5 w-5" />,
    title: "Extensions",
  },
  settings: {
    component: <SettingsPage />,
    icon: <Settings className="h-5 w-5" />,
    title: "Settings",
  },
};

export function AppSidebar() {
  const [activePage, setActivePage] = useState<string>("explorer");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleIconClick = (pageKey: string) => {
    setActivePage(pageKey);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex h-full bg-sidebar border-r border-sidebar-border/50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-72" : "w-16"
      )}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-2 h-14 border-b border-sidebar-border/50">
            {isExpanded && <h2 className="text-lg font-bold px-2">CodePilot</h2>}
             <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(!isExpanded && "mx-auto")}
                >
                  <PanelLeft className={cn("transition-transform", isExpanded && "rotate-180")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-sidebar-background">
            {Object.entries(pages).map(([key, { icon, title }]) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                   <button
                    onClick={() => handleIconClick(key)}
                    className={cn(
                      "flex-1 flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors relative",
                       isExpanded && "gap-2 justify-start px-3"
                    )}
                  >
                    {icon}
                    {isExpanded && <span className="text-sm font-medium">{title}</span>}
                    {activePage === key && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"></div>}
                  </button>
                </TooltipTrigger>
                 {!isExpanded && <TooltipContent side="right"><p>{title}</p></TooltipContent>}
              </Tooltip>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-grow p-2 overflow-auto">
             {activePage && pages[activePage] && pages[activePage].component}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
