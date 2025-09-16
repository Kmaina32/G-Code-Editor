
"use client";

import ExplorerPage from "./sidebar/explorer-page";
import ExtensionsPage from "./sidebar/extensions-page";
import SearchPage from "./sidebar/search-page";
import GitPage from "./sidebar/git-page";
import SettingsPage from "./sidebar/settings-page";
import { Folder, Search, GitBranch, Puzzle, Settings } from 'lucide-react';
import { Sidebar, SidebarMenu, SidebarMenuButton } from "./ui/sidebar";
import { useStore } from "@/lib/store";

const pages: Record<string, { component: JSX.Element; title: string, icon: React.ElementType }> = {
  explorer: {
    component: <ExplorerPage />,
    title: "Explorer",
    icon: Folder,
  },
  search: { component: <SearchPage />, title: "Search", icon: Search },
  git: { component: <GitPage />, title: "Source Control", icon: GitBranch },
  extensions: {
    component: <ExtensionsPage />,
    title: "Extensions",
    icon: Puzzle
  },
  settings: {
    component: <SettingsPage />,
    title: "Settings",
    icon: Settings,
  },
};

export function AppSidebar({ activePage, onPageChange }: { activePage: string, onPageChange: (pageId: string) => void }) {
  const { isGenerating } = useStore();
  const CurrentPage = pages[activePage];

  return (
    <div className="flex h-full">
        <Sidebar className="w-[var(--sidebar-width-icon)] flex flex-col items-center border-r">
          <SidebarMenu>
            {Object.entries(pages).map(([id, { title, icon: Icon }]) => (
                <SidebarMenuButton 
                  key={id}
                  isActive={activePage === id}
                  onClick={() => onPageChange(id)}
                  tooltip={title}
                  variant="ghost"
                  className="h-10 w-10"
                >
                    <Icon className="w-5 h-5"/>
                </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </Sidebar>
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border/50 w-[var(--sidebar-width)]">
        <div className="flex items-center justify-between p-2 h-14 border-b border-sidebar-border/50">
            <h2 className="text-lg font-bold px-2 uppercase">{CurrentPage.title}</h2>
        </div>

        <div className="flex-grow p-2 overflow-auto">
            {CurrentPage.component}
        </div>
        </div>
    </div>
  );
}

    