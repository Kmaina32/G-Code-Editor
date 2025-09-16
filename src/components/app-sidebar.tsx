
"use client";

import ExplorerPage from "./sidebar/explorer-page";
import ExtensionsPage from "./sidebar/extensions-page";
import SearchPage from "./sidebar/search-page";
import GitPage from "./sidebar/git-page";
import SettingsPage from "./sidebar/settings-page";

const pages: Record<string, { component: JSX.Element; title: string }> = {
  explorer: {
    component: <ExplorerPage />,
    title: "Explorer",
  },
  search: { component: <SearchPage />, title: "Search" },
  git: { component: <GitPage />, title: "Source Control" },
  extensions: {
    component: <ExtensionsPage />,
    title: "Extensions",
  },
  settings: {
    component: <SettingsPage />,
    title: "Settings",
  },
};

export function AppSidebar({ activePage }: { activePage: string }) {

  const CurrentPage = pages[activePage];

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border/50">
      <div className="flex items-center justify-between p-2 h-14 border-b border-sidebar-border/50">
        <h2 className="text-lg font-bold px-2 uppercase">{CurrentPage.title}</h2>
      </div>

      <div className="flex-grow p-2 overflow-auto">
        {CurrentPage.component}
      </div>
    </div>
  );
}
