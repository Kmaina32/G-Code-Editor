
"use client";

import { useStore } from "@/lib/store";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


export default function SettingsPage() {
  const { editorSettings, setEditorSettings, extensions, activeThemeId, setActiveThemeId } = useStore();

  const fontSizes = [10, 12, 14, 16, 18, 20, 24];
  const installedThemes = extensions.filter(ext => ext.type === 'theme' && ext.installed);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-muted-foreground px-2">Appearance</h3>
        <div className="p-2 border rounded-lg bg-background/30 space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="text-sm">Theme</Label>
                <Select
                    value={activeThemeId}
                    onValueChange={setActiveThemeId}
                >
                    <SelectTrigger className="w-[150px] h-8">
                        <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {installedThemes.map(theme => (
                            <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                        ))}
                         <SelectItem value="neon-future" disabled>Neon Future (Active)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <h3 className="text-xs font-bold uppercase text-muted-foreground px-2">Editor</h3>
        <div className="p-2 border rounded-lg bg-background/30 space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="text-sm">Font Size</Label>
                <Select
                    value={String(editorSettings.fontSize)}
                    onValueChange={(value) => setEditorSettings({ fontSize: Number(value) })}
                >
                    <SelectTrigger className="w-[100px] h-8">
                        <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                        {fontSizes.map(size => (
                            <SelectItem key={size} value={String(size)}>{size} px</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>
    </div>
  );
}
