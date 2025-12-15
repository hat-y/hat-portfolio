import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../core/services/navigation';
import { TerminalCommandsService } from '../../core/services/terminal-commands.service';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';

@Component({
  selector: 'app-terminal',
  imports: [CommonModule],
  templateUrl: './terminal.html',
  styleUrl: './terminal.css',
})
export class Terminal implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('terminalContainer', { static: false })
  terminalContainer!: ElementRef;

  @Input() windowTop: string = '60px';
  @Input() windowLeft: string = '40px';
  @Input() windowWidth: string = '750px';
  @Input() windowHeight: string = '500px';
  @Input() windowZIndex: number = 100;

  protected readonly navigationService = inject(Navigation);
  private readonly commandsService = inject(TerminalCommandsService);

  private xterm!: XTerm;
  private fitAddon!: FitAddon;
  private currentLine = '';

  protected get isMaximized(): boolean {
    const tab = this.navigationService.tabs().find(t => t.id === 'terminal');
    return tab?.maximized ?? false;
  }
  private commandHistory: string[] = [];
  private historyIndex = -1;
  private readonly prompt = '\x1b[92mlizzy@portfolio\x1b[0m:\x1b[96m~\x1b[0m$ ';
  private isInitialized = false;

  ngOnInit(): void {
    this.navigationService.registerTab({
      id: 'terminal',
      title: 'Terminal',
      component: Terminal,
    });
  }

  ngAfterViewInit(): void {
    // Delay initialization slightly to ensure DOM is ready
    setTimeout(() => {
      this.initializeTerminal();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.xterm) {
      this.xterm.dispose();
    }
  }

  private initializeTerminal(): void {
    if (this.isInitialized || !this.terminalContainer) {
      return;
    }

    this.xterm = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'Ubuntu Mono', 'Courier New', monospace",
      letterSpacing: 0,
      lineHeight: 1.2,
      theme: {
        background: '#2d2d2d',
        foreground: '#d4d4d4',
        cursor: '#88c090',
        black: '#2d2d2d',
        red: '#ff6b6b',
        green: '#88c090',
        yellow: '#f9ca24',
        blue: '#74b9ff',
        magenta: '#a29bfe',
        cyan: '#81ecec',
        white: '#d4d4d4',
        brightBlack: '#6c6c6c',
        brightRed: '#ff7675',
        brightGreen: '#8cc265',
        brightYellow: '#feca57',
        brightBlue: '#74b9ff',
        brightMagenta: '#a29bfe',
        brightCyan: '#81ecec',
        brightWhite: '#ffffff',
      },
      cols: 100,
      rows: 30,
    });

    this.fitAddon = new FitAddon();
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(this.terminalContainer.nativeElement);
    
    setTimeout(() => {
      this.fitAddon.fit();
    }, 50);

    // Show neofetch on startup with typing effect
    this.typeNeofetch();

    // Handle input
    this.xterm.onKey(({ key, domEvent }) => {
      this.handleKeyPress(key, domEvent);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.fitAddon && this.xterm) {
        this.fitAddon.fit();
      }
    });

    this.isInitialized = true;
  }

  private handleKeyPress(key: string, event: KeyboardEvent): void {
    const code = key.charCodeAt(0);

    // Enter key
    if (event.key === 'Enter') {
      this.xterm.write('\r\n');
      this.executeCommand(this.currentLine);
      this.currentLine = '';
      return;
    }

    // Backspace
    if (event.key === 'Backspace') {
      if (this.currentLine.length > 0) {
        this.currentLine = this.currentLine.slice(0, -1);
        this.xterm.write('\b \b');
      }
      return;
    }

    // Arrow up (history)
    if (event.key === 'ArrowUp') {
      if (this.commandHistory.length > 0 && this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.replaceCurrentLine(this.commandHistory[this.commandHistory.length - 1 - this.historyIndex]);
      }
      return;
    }

    // Arrow down (history)
    if (event.key === 'ArrowDown') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.replaceCurrentLine(this.commandHistory[this.commandHistory.length - 1 - this.historyIndex]);
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.replaceCurrentLine('');
      }
      return;
    }

    // Tab key (autocomplete could go here)
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }

    // Ctrl+C
    if (event.ctrlKey && event.key === 'c') {
      this.xterm.write('^C\r\n');
      this.currentLine = '';
      this.xterm.write(this.prompt);
      return;
    }

    // Ctrl+L (clear)
    if (event.ctrlKey && event.key === 'l') {
      this.xterm.clear();
      this.showNeofetch();
      this.currentLine = '';
      return;
    }

    // Regular character
    if (!event.ctrlKey && !event.altKey && code >= 32 && code < 127) {
      this.currentLine += key;
      this.xterm.write(key);
    }
  }

  private replaceCurrentLine(newLine: string): void {
    // Clear current line
    this.xterm.write('\r' + this.prompt);
    this.xterm.write(' '.repeat(this.currentLine.length));
    this.xterm.write('\r' + this.prompt);
    
    // Write new line
    this.currentLine = newLine;
    this.xterm.write(newLine);
  }

  private executeCommand(command: string): void {
    const trimmedCommand = command.trim();
    
    if (trimmedCommand) {
      this.commandHistory.push(trimmedCommand);
      this.historyIndex = -1;
      
      const output = this.commandsService.executeCommand(trimmedCommand);
      
      if (output === '__CLEAR__' || output === '__NEOFETCH__') {
        this.xterm.clear();
        this.showNeofetch();
      } else {
        this.xterm.write(output + '\r\n');
        this.xterm.write(this.prompt);
      }
    } else {
      this.xterm.write(this.prompt);
    }
  }

  protected minimizeWindow(): void {
    this.navigationService.toggleMinimize('terminal');
  }

  protected closeWindow(): void {
    this.navigationService.closeTab('terminal');
  }

  protected maximizeWindow(): void {
    this.navigationService.maximizeTab('terminal');
  }

  private showNeofetch(): void {
    const neofetch = this.commandsService.getNeofetchOutput();
    this.xterm.write(neofetch);
    this.xterm.write('\r\n' + this.prompt);
  }

  private typeNeofetch(): void {
    const neofetch = this.commandsService.getNeofetchOutput();
    const lines = neofetch.split('\n');
    let currentLineIndex = 0;

    const typeNextLine = () => {
      if (currentLineIndex < lines.length) {
        this.xterm.write(lines[currentLineIndex] + '\r\n');
        currentLineIndex++;
        setTimeout(typeNextLine, 30); // 30ms between lines for smooth effect
      } else {
        this.xterm.write(this.prompt);
      }
    };

    typeNextLine();
  }
}
