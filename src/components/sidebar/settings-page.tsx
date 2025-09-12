"use client";

import { useStore } from "@/lib/store";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


export default function SettingsPage() {
  const { editorSettings, setEditorSettings } = useStore();

  const fontSizes = [10, 12, 14, 16, 18, 20, 24];

  return (
    <div className="space-y-6">
       <h2 className="text-sm font-bold text-muted-foreground px-2">
        SETTINGS
      </h2>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-muted-foreground px-2">Editor</h3>
        <div className="p-2 border rounded-lg bg-background/30">
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
