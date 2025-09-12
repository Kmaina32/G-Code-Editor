"use client";

import { useState } from "react";
import { Folder, Search, GitBranch, Settings, Puzzle } from "lucide-react";
import ExplorerPage from "./sidebar/explorer-page";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import ExtensionsPage from "./sidebar/extensions-page";

const pages: Record<
  string,
  { component: JSX.Element; icon: React.ReactNode; title: string }
> = {
  explorer: {
    component: <ExplorerPage />,
    icon: <Folder />,
    title: "File Explorer",
  },
  search: { component: <div>Search Page</div>, icon: <Search />, title: "Search" },
  git: { component: <div>Git Page</div>, icon: <GitBranch />, title: "Source Control" },
  extensions: {
    component: <ExtensionsPage />,
    icon: <Puzzle />,
    title: "Extensions",
  },
  settings: {
    component: <div>Settings Page</div>,
    icon: <Settings />,
    title: "Settings",
  },
};

export function AppSidebar() {
  const [activePage, setActivePage] = useState<string | null>("explorer");

  const handleIconClick = (pageKey: string) => {
    setActivePage((currentPage) => (currentPage === pageKey ? null : pageKey));
  };

  return (
    <div className="flex h-full bg-muted/30">
      {/* Activity Bar */}
      <div className="w-14 bg-background border-r flex flex-col items-center py-2 space-y-2">
        {Object.entries(pages).map(([key, { icon, title }]) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleIconClick(key)}
                className={cn(
                  "p-2 rounded-md hover:bg-accent",
                  activePage === key && "bg-accent text-accent-foreground"
                )}
              >
                {icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Sidebar Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          activePage ? "w-64 p-2" : "w-0"
        )}
      >
        {activePage && pages[activePage] && pages[activePage].component}
      </div>
    </div>
  );
}
