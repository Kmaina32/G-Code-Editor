"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Download, Trash2 } from "lucide-react";

export default function ExtensionsPage() {
  const { extensions, installExtension, uninstallExtension } = useStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-muted-foreground px-2">
          EXTENSIONS
        </h2>
      </div>
      <ul className="space-y-4">
        {extensions.map((ext) => (
          <li
            key={ext.id}
            className="p-2 rounded-md border bg-background/50 flex flex-col"
          >
            <h3 className="font-bold text-sm">{ext.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex-grow">
              {ext.description}
            </p>
            <div className="mt-3 flex gap-2">
              {ext.installed ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => uninstallExtension(ext.id)}
                  className="w-full"
                  disabled={ext.id === 'theme-dark' && ext.installed}
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Uninstall
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => installExtension(ext.id)}
                  className="w-full"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Install
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
