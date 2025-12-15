import { Injectable, inject } from '@angular/core';
import { Navigation } from './navigation';
import { TilingService } from './tiling.service';

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string;
}

@Injectable({
  providedIn: 'root',
})
export class TerminalCommandsService {
  private commands: Map<string, Command> = new Map();
  private readonly navigationService = inject(Navigation);
  private readonly tilingService = inject(TilingService);

  constructor() {
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commands.set('help', {
      name: 'help',
      description: 'Show available commands',
      execute: () => this.getHelpText(),
    });

    this.commands.set('ls', {
      name: 'ls',
      description: 'List available sections',
      execute: () => this.listSections(),
    });

    this.commands.set('cat', {
      name: 'cat',
      description: 'Display file contents (e.g., cat projects.json)',
      execute: (args) => this.catFile(args[0]),
    });

    this.commands.set('tree', {
      name: 'tree',
      description: 'Display directory tree (e.g., tree skills/)',
      execute: (args) => this.showTree(args[0]),
    });

    this.commands.set('clear', {
      name: 'clear',
      description: 'Clear terminal and show neofetch',
      execute: () => '__CLEAR__',
    });

    this.commands.set('neofetch', {
      name: 'neofetch',
      description: 'Display system information',
      execute: () => '__NEOFETCH__',
    });

    this.commands.set('download', {
      name: 'download',
      description: 'Download resume (download resume.pdf)',
      execute: (args) => this.downloadResume(args[0]),
    });

    this.commands.set('whoami', {
      name: 'whoami',
      description: 'Display user information',
      execute: () => this.whoami(),
    });

    this.commands.set('about', {
      name: 'about',
      description: 'Open About Me window',
      execute: () => this.openWindow('about'),
    });

    this.commands.set('skills', {
      name: 'skills',
      description: 'Open Skills window',
      execute: () => this.openWindow('file-manager'),
    });

    this.commands.set('projects', {
      name: 'projects',
      description: 'Open Projects window',
      execute: () => this.openWindow('projects'),
    });

    this.commands.set('contact', {
      name: 'contact',
      description: 'Open Contact window',
      execute: () => this.openWindow('contact'),
    });

    // Layout commands
    this.commands.set('layout', {
      name: 'layout',
      description: 'Change window layout (layout [grid|main-horizontal|main-vertical|floating])',
      execute: (args) => this.changeLayout(args[0]),
    });

    this.commands.set('layout-list', {
      name: 'layout-list',
      description: 'List available layouts',
      execute: () => this.listLayouts(),
    });

    this.commands.set('shortcuts', {
      name: 'shortcuts',
      description: 'Show keyboard shortcuts',
      execute: () => this.showShortcuts(),
    });

    // Position lock commands
    this.commands.set('lock-positions', {
      name: 'lock-positions',
      description: 'Lock window positions so they don\'t change when clicking tabs',
      execute: () => this.togglePositionLock(true),
    });

    this.commands.set('unlock-positions', {
      name: 'unlock-positions',
      description: 'Unlock window positions so they can change when clicking tabs',
      execute: () => this.togglePositionLock(false),
    });
  }

  executeCommand(input: string): string {
    const [commandName, ...args] = input.trim().split(/\s+/);
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      return `Command not found: ${commandName}. Type 'help' for available commands.`;
    }

    return command.execute(args);
  }

  private getHelpText(): string {
    let help = '\x1b[92m\n━━━ Available Commands ━━━\x1b[0m\n\n';
    this.commands.forEach((cmd) => {
      help += `  \x1b[96m${cmd.name.padEnd(12)}\x1b[0m ${cmd.description}\n`;
    });
    help += '\n\x1b[90mTip: Use arrow keys to navigate command history\x1b[0m\n';
    return help;
  }

  private listSections(): string {
    return `\x1b[96m.\x1b[0m
├── \x1b[92mprojects.json\x1b[0m
├── \x1b[92mcontact.txt\x1b[0m
├── \x1b[92mresume.pdf\x1b[0m
└── \x1b[96mskills/\x1b[0m
    ├── \x1b[96mlanguages/\x1b[0m
    ├── \x1b[96mframeworks-and-libraries/\x1b[0m
    ├── \x1b[96mtools/\x1b[0m
    └── \x1b[96mclouds-and-providers/\x1b[0m
`;
  }

  private catFile(filename: string): string {
    if (!filename) {
      return '\x1b[1;31mError:\x1b[0m Please specify a file (e.g., cat projects.json)';
    }

    switch (filename.toLowerCase()) {
      case 'projects.json':
        return this.getProjectsContent();
      case 'contact.txt':
        return this.getContactContent();
      default:
        return `\x1b[1;31mError:\x1b[0m File not found: ${filename}`;
    }
  }

  private showTree(directory: string): string {
    if (!directory) {
      return '\x1b[1;31mError:\x1b[0m Please specify a directory (e.g., tree skills/)';
    }

    switch (directory.toLowerCase().replace('/', '')) {
      case 'skills':
        return this.getSkillsTree();
      case 'languages':
      case 'skills/languages':
        return this.getLanguagesTree();
      case 'frameworks-and-libraries':
      case 'frameworks':
      case 'skills/frameworks-and-libraries':
        return this.getFrameworksTree();
      case 'tools':
      case 'skills/tools':
        return this.getToolsTree();
      case 'clouds-and-providers':
      case 'clouds':
      case 'skills/clouds-and-providers':
        return this.getCloudsTree();
      default:
        return `\x1b[1;31mError:\x1b[0m Directory not found: ${directory}`;
    }
  }

  private downloadResume(filename: string): string {
    if (filename === 'resume.pdf') {
      // TODO: Implement actual download
      return '\x1b[1;32m✓\x1b[0m Resume download started...\n\x1b[90m(Feature coming soon)\x1b[0m';
    }
    return '\x1b[1;31mError:\x1b[0m File not available for download: ' + filename;
  }

  private whoami(): string {
    return `\x1b[92mlizzy\x1b[0m

\x1b[96m👤 Name:\x1b[0m Your Name
\x1b[96m💼 Role:\x1b[0m Full Stack Developer
\x1b[96m📧 Email:\x1b[0m your@email.com
\x1b[96m🔗 Links:\x1b[0m github.com/you | linkedin.com/in/you
`;
  }

  private getProjectsContent(): string {
    return `\x1b[1;33m[\x1b[0m
  \x1b[1;33m{\x1b[0m
    \x1b[1;36m"name"\x1b[0m: \x1b[1;32m"Project 1"\x1b[0m,
    \x1b[1;36m"description"\x1b[0m: \x1b[1;32m"Description of your first project"\x1b[0m,
    \x1b[1;36m"tech"\x1b[0m: [\x1b[1;32m"Angular"\x1b[0m, \x1b[1;32m"Node.js"\x1b[0m, \x1b[1;32m"PostgreSQL"\x1b[0m],
    \x1b[1;36m"link"\x1b[0m: \x1b[1;32m"https://github.com/you/project1"\x1b[0m
  \x1b[1;33m}\x1b[0m,
  \x1b[1;33m{\x1b[0m
    \x1b[1;36m"name"\x1b[0m: \x1b[1;32m"Project 2"\x1b[0m,
    \x1b[1;36m"description"\x1b[0m: \x1b[1;32m"Description of your second project"\x1b[0m,
    \x1b[1;36m"tech"\x1b[0m: [\x1b[1;32m"React"\x1b[0m, \x1b[1;32m"Express"\x1b[0m, \x1b[1;32m"MongoDB"\x1b[0m],
    \x1b[1;36m"link"\x1b[0m: \x1b[1;32m"https://github.com/you/project2"\x1b[0m
  \x1b[1;33m}\x1b[0m
\x1b[1;33m]\x1b[0m
`;
  }

  private getContactContent(): string {
    return `\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[1;36m         CONTACT INFORMATION        \x1b[0m
\x1b[1;32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m

📧 Email:    your@email.com
🐙 GitHub:   github.com/you
💼 LinkedIn: linkedin.com/in/you
🌐 Website:  yourportfolio.com

\x1b[90mFeel free to reach out!\x1b[0m
`;
  }

  private getSkillsTree(): string {
    return `\x1b[96mskills/\x1b[0m
├── \x1b[96mlanguages/\x1b[0m
│   ├── \x1b[92mJavaScript\x1b[0m ⭐⭐⭐⭐⭐
│   ├── \x1b[92mTypeScript\x1b[0m ⭐⭐⭐⭐⭐
│   ├── \x1b[92mPython\x1b[0m ⭐⭐⭐⭐
│   ├── \x1b[92mSQL\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[92mHTML/CSS\x1b[0m ⭐⭐⭐⭐
├── \x1b[96mframeworks-and-libraries/\x1b[0m
│   ├── \x1b[92mNode.js\x1b[0m ⭐⭐⭐⭐⭐
│   ├── \x1b[92mExpress.js\x1b[0m ⭐⭐⭐⭐
│   ├── \x1b[92mAngular\x1b[0m ⭐⭐⭐⭐
│   ├── \x1b[92mReact\x1b[0m ⭐⭐⭐
│   └── \x1b[92mPrisma ORM\x1b[0m ⭐⭐⭐⭐
├── \x1b[96mtools/\x1b[0m
│   ├── \x1b[92mGit & GitHub\x1b[0m ⭐⭐⭐⭐⭐
│   ├── \x1b[92mDocker\x1b[0m ⭐⭐⭐⭐
│   ├── \x1b[92mPostman\x1b[0m ⭐⭐⭐⭐
│   ├── \x1b[92mVS Code\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[92mLinux/Bash\x1b[0m ⭐⭐⭐⭐
└── \x1b[96mclouds-and-providers/\x1b[0m
    ├── \x1b[92mAWS (EC2, S3, RDS)\x1b[0m ⭐⭐⭐
    ├── \x1b[92mVercel\x1b[0m ⭐⭐⭐⭐
    ├── \x1b[92mRailway\x1b[0m ⭐⭐⭐
    └── \x1b[92mPostgreSQL Cloud\x1b[0m ⭐⭐⭐⭐
`;
  }

  private getLanguagesTree(): string {
    return `\x1b[96mlanguages/\x1b[0m
├── \x1b[92mJavaScript\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[90mCore language for full-stack development\x1b[0m
├── \x1b[92mTypeScript\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[90mPreferred for type safety and scalability\x1b[0m
├── \x1b[92mPython\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mScripting, automation, data processing\x1b[0m
├── \x1b[92mSQL\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mPostgreSQL, MySQL - database queries\x1b[0m
└── \x1b[92mHTML/CSS\x1b[0m ⭐⭐⭐⭐
    └── \x1b[90mSemantic HTML, responsive design\x1b[0m
`;
  }

  private getFrameworksTree(): string {
    return `\x1b[96mframeworks-and-libraries/\x1b[0m
├── \x1b[92mNode.js\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[90mBackend runtime - REST APIs, microservices\x1b[0m
├── \x1b[92mExpress.js\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mWeb framework - routing, middleware\x1b[0m
├── \x1b[92mAngular\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mFrontend framework - SPAs, signals\x1b[0m
├── \x1b[92mReact\x1b[0m ⭐⭐⭐
│   └── \x1b[90mUI library - hooks, context\x1b[0m
├── \x1b[92mPrisma ORM\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mDatabase toolkit - migrations, queries\x1b[0m
└── \x1b[92mRxJS\x1b[0m ⭐⭐⭐
    └── \x1b[90mReactive programming - observables\x1b[0m
`;
  }

  private getToolsTree(): string {
    return `\x1b[96mtools/\x1b[0m
├── \x1b[92mGit & GitHub\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[90mVersion control, collaboration, CI/CD\x1b[0m
├── \x1b[92mDocker\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mContainerization, compose, deployment\x1b[0m
├── \x1b[92mPostman\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mAPI testing, documentation\x1b[0m
├── \x1b[92mVS Code\x1b[0m ⭐⭐⭐⭐⭐
│   └── \x1b[90mPrimary IDE with extensions\x1b[0m
└── \x1b[92mLinux/Bash\x1b[0m ⭐⭐⭐⭐
    └── \x1b[90mCommand line, scripting, server management\x1b[0m
`;
  }

  private getCloudsTree(): string {
    return `\x1b[96mclouds-and-providers/\x1b[0m
├── \x1b[92mAWS\x1b[0m ⭐⭐⭐
│   └── \x1b[90mEC2, S3, RDS - cloud infrastructure\x1b[0m
├── \x1b[92mVercel\x1b[0m ⭐⭐⭐⭐
│   └── \x1b[90mFrontend deployment, serverless functions\x1b[0m
├── \x1b[92mRailway\x1b[0m ⭐⭐⭐
│   └── \x1b[90mBackend deployment, databases\x1b[0m
└── \x1b[92mPostgreSQL Cloud\x1b[0m ⭐⭐⭐⭐
    └── \x1b[90mNeon, Supabase - managed databases\x1b[0m
`;
  }

  getNeofetchOutput(): string {
    const logo = `\x1b[37mMMMMMMMMMMMMMMMMMMMMMMMMMmds+.
MMm----::-://////////////oymNMd+\`
MMd      \x1b[92m/++\x1b[37m                -sNMd:
MMNso/  \x1b[92mdMM\x1b[37m    \`.::-. .-::.\`.  .hMN:
ddddMMh \x1b[92mdMM\x1b[37m   :hNMNMNhNMNMNh: \`NMm
    NMm \x1b[92mdMM\x1b[37m  .NMN/-+MMM+-/NMN\` dMM
    NMm \x1b[92mdMM\x1b[37m  -MMm  \`MMM   dMM. dMM
    NMm \x1b[92mdMM\x1b[37m  -MMm  \`MMM   dMM. dMM
    NMm \x1b[92mdMM\x1b[37m  .mmd  \`mmm   yMM. dMM
    NMm \x1b[92mdMM\x1b[37m\`  ..\`   ...   ydm. dMM
    hMM- \x1b[92m+MMd/-------...-:sdds\x1b[37m dMM
    -NMm- \x1b[92m:hNMNNNmdddddddddy/\x1b[37m dMM
     -dMNs-\x1b[92m\`\`-::::-------.\x1b[37m    dMM
      \`/dMNmy+/:-------------:/yMMM
         ./ydNMMMMMMMMMMMMMMMMMMMMM
            .MMMMMMMMMMMMMMMMMMM\x1b[0m`;

    const info = `\x1b[92mhat\x1b[0m@\x1b[92mportfolio\x1b[0m
\x1b[90m──────────────\x1b[0m
\x1b[92mOS:\x1b[0m Linux Mint 22.2 x86_64
\x1b[92mKernel:\x1b[0m 6.14.0-36-generic
\x1b[92mUptime:\x1b[0m 14 hours, 48 mins
\x1b[92mPackages:\x1b[0m 2226 (dpkg), 8 (flatpak)
\x1b[92mShell:\x1b[0m bash 5.2.21
\x1b[92mResolution:\x1b[0m 1920x1080
\x1b[92mDE:\x1b[0m Xfce 4.18
\x1b[92mWM:\x1b[0m Xfwm4
\x1b[92mWM Theme:\x1b[0m oneprite
\x1b[92mTheme:\x1b[0m oneprite [GTK2/3]
\x1b[92mIcons:\x1b[0m Papirus [GTK2/3]
\x1b[92mTerminal:\x1b[0m xfce4-terminal

\x1b[96m👤 Name:\x1b[0m Facundo Gayoso
\x1b[96m💼 Role:\x1b[0m Full Stack Developer
\x1b[96m📧 Email:\x1b[0m facundo.gayoso02@email.com
\x1b[96m🔗 Links:\x1b[0m github.com/you | linkedin.com/in/you

\x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m

\x1b[90mType '\x1b[96mhelp\x1b[90m' for available commands\x1b[0m
`;

    // Combine logo and info side by side
    const logoLines = logo.split('\n');
    const infoLines = info.split('\n');
    const maxLogoWidth = 35; // approximate width after ANSI codes

    let output = '\n';
    const maxLines = Math.max(logoLines.length, infoLines.length);

    for (let i = 0; i < maxLines; i++) {
      const logoLine = logoLines[i] || '';
      const infoLine = infoLines[i] || '';
      // Pad logo line to align info
      const padding = ' '.repeat(Math.max(0, maxLogoWidth - this.stripAnsi(logoLine).length));
      output += logoLine + padding + '  ' + infoLine + '\n';
    }

    return output;
  }

  private openWindow(tabId: string): string {
    this.navigationService.openTab(tabId);
    return `\x1b[92m✓\x1b[0m Opening ${tabId} window...`;
  }

  private changeLayout(layoutType: string): string {
    const validLayouts = ['grid', 'main-horizontal', 'main-vertical', 'floating'];

    if (!layoutType) {
      return '\x1b[1;31mError:\x1b[0m Please specify a layout type.\nUsage: \x1b[96mlayout [grid|main-horizontal|main-vertical|floating]\x1b[0m';
    }

    if (!validLayouts.includes(layoutType.toLowerCase())) {
      return `\x1b[1;31mError:\x1b[0m Invalid layout type: ${layoutType}\n\x1b[90mValid layouts: grid, main-horizontal, main-vertical, floating\x1b[0m`;
    }

    this.tilingService.setLayoutMode(layoutType as any);
    return `\x1b[92m✓\x1b[0m Layout changed to: \x1b[96m${layoutType}\x1b[0m`;
  }

  private listLayouts(): string {
    const currentLayout = this.tilingService.getCurrentLayout();

    return `\x1b[96m━━━ Available Window Layouts ━━━\x1b[0m

${currentLayout === 'grid' ? '★' : '○'} \x1b[92mgrid\x1b[0m
  ${currentLayout === 'grid' ? 'Currently active' : 'Equal grid distribution for all windows'}

${currentLayout === 'main-horizontal' ? '★' : '○'} \x1b[92mmain-horizontal\x1b[0m
  ${currentLayout === 'main-horizontal' ? 'Currently active' : 'Main window + horizontal stack'}

${currentLayout === 'main-vertical' ? '★' : '○'} \x1b[92mmain-vertical\x1b[0m
  ${currentLayout === 'main-vertical' ? 'Currently active' : 'Main window + vertical stack'}

${currentLayout === 'floating' ? '★' : '○'} \x1b[92mfloating\x1b[0m
  ${currentLayout === 'floating' ? 'Currently active' : 'Free-floating windows'}

\x1b[90mUsage: layout [name]\x1b[0m
\x1b[90mKeyboard shortcuts: Win+G/H/V/F\x1b[0m`;
  }

  private togglePositionLock(lock: boolean): string {
    this.tilingService.setLockPositions(lock);
    const status = lock ? 'locked' : 'unlocked';
    const icon = lock ? '🔒' : '🔓';
    return `\x1b[92m✓\x1b[0m Window positions ${status} ${icon}\n\x1b[90m${lock ? 'Windows will stay in their current positions' : 'Windows will rearrange when you click tabs'}\x1b[0m`;
  }

  private showShortcuts(): string {
    const isLocked = this.tilingService.isLocked();
    return `\x1b[96m━━━ Keyboard Shortcuts ━━━\x1b[0m

\x1b[92mWindow Layouts:\x1b[0m
  \x1b[96mWin+G\x1b[0m     Switch to grid layout
  \x1b[96mWin+H\x1b[0m     Switch to main + horizontal stack
  \x1b[96mWin+V\x1b[0m     Switch to main + vertical stack
  \x1b[96mWin+F\x1b[0m     Switch to floating layout

\x1b[92mSystem:\x1b[0m
  \x1b[96mWin+?\x1b[0m     Show this help

\x1b[90mNote: You can also use Ctrl instead of Win/Meta key\x1b[0m

\x1b[96m━━━ Terminal Layout Commands ━━━\x1b[0m

  \x1b[96mlayout\x1b[0m           Change layout
  \x1b[96mlayout-list\x1b[0m      List all layouts
  \x1b[96mshortcuts\x1b[0m        Show this help
  \x1b[96mlock-positions\x1b[0m  ${isLocked ? '\x1b[92m[Locked]\x1b[0m' : 'Lock window positions'}
  \x1b[96munlock-positions\x1b[0m ${isLocked ? 'Unlock window positions' : '\x1b[90m[Unlocked]\x1b[0m'}

\x1b[96m━━━ Position Status ━━━\x1b[0m

  ${isLocked ? '\x1b[92m🔒 Positions Locked\x1b[0m' : '\x1b[90m🔓 Positions Unlocked\x1b[0m'}
  ${isLocked ? 'Windows stay fixed when clicking tabs' : 'Windows rearrange when clicking tabs'}
`;
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }
}
