

"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

interface TerminalComponentProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
  theme?: string;
}

export interface TerminalComponent {
  write: (data: string) => void;
  clear: () => void;
  focus: () => void;
}

const solarizedDark = {
  background: '#002b36',
  foreground: '#839496',
  cursor: '#93a1a1',
  black: '#073642',
  red: '#dc322f',
  green: '#859900',
  yellow: '#b58900',
  blue: '#268bd2',
  magenta: '#d33682',
  cyan: '#2aa198',
  white: '#eee8d5',
  brightBlack: '#002b36',
  brightRed: '#cb4b16',
  brightGreen: '#586e75',
  brightYellow: '#657b83',
  brightBlue: '#839496',
  brightMagenta: '#6c71c4',
  brightCyan: '#93a1a1',
  brightWhite: '#fdf6e3',
};

const solarizedLight = {
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#657b83',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3'
};


export const TerminalComponent = forwardRef<
  TerminalComponent,
  TerminalComponentProps
>(({ onCommand, disabled = false, theme = 'dark' }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const command = useRef('');

  const handleResize = useCallback(() => {
    fitAddon.current?.fit();
  }, []);

  useEffect(() => {
    if (terminalRef.current && !term.current) {
      const isDark = !theme.includes('light');
      const newTerm = new Terminal({
        cursorBlink: true,
        fontFamily: 'monospace',
        fontSize: 14,
        theme: isDark ? solarizedDark : solarizedLight,
        convertEol: true,
      });
      const newFitAddon = new FitAddon();
      newTerm.loadAddon(newFitAddon);

      term.current = newTerm;
      fitAddon.current = newFitAddon;

      newTerm.open(terminalRef.current);
      newFitAddon.fit();
      
      newTerm.onData((e) => {
        if (disabled) return;
        switch (e) {
          case '\r': // Enter
            if (command.current) {
              onCommand(command.current);
              command.current = '';
            }
            break;
          case '\u007F': // Backspace
            if (command.current.length > 0) {
              newTerm.write('\b \b');
              command.current = command.current.slice(0, -1);
            }
            break;
          default: // Print all other characters
            if (
              (e >= String.fromCharCode(0x20) &&
                e <= String.fromCharCode(0x7e)) ||
              e >= '\u00a0'
            ) {
              command.current += e;
              newTerm.write(e);
            }
        }
      });

      newTerm.writeln('Welcome to CodePilot Terminal!');
      newTerm.write('$ ');

      window.addEventListener('resize', handleResize);
    }
    
    return () => {
        window.removeEventListener('resize', handleResize);
    }
  }, [disabled, onCommand, handleResize, theme]);

  useEffect(() => {
    if (term.current) {
      const isDark = !theme.includes('light');
      term.current.options.theme = isDark ? solarizedDark : solarizedLight;
      handleResize();
    }
  }, [theme, handleResize]);

  useImperativeHandle(ref, () => ({
    write: (data: string) => {
      term.current?.write(data);
    },
    clear: () => {
      term.current?.clear();
      term.current?.writeln('Welcome to CodePilot Terminal!');
      term.current?.write('$ ');
    },
    focus: () => {
      term.current?.focus();
    },
  }));

  return (
    <div
      ref={terminalRef}
      className="w-full h-full p-2 bg-background rounded-b-lg overflow-hidden"
      onMouseDown={() => term.current?.focus()}
    />
  );
});

TerminalComponent.displayName = 'TerminalComponent';
