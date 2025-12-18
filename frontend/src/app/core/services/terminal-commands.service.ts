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

    // Additional Linux commands
    this.commands.set('grep', {
      name: 'grep',
      description: 'Search for patterns in files (grep pattern file)',
      execute: (args) => this.grep(args[0], args[1]),
    });

    this.commands.set('find', {
      name: 'find',
      description: 'Search for files and directories (find path -name pattern)',
      execute: (args) => this.find(args),
    });

    this.commands.set('man', {
      name: 'man',
      description: 'Display manual page for a command (man command)',
      execute: (args) => this.man(args[0]),
    });

    this.commands.set('cd', {
      name: 'cd',
      description: 'Change directory (cd [directory])',
      execute: (args) => this.cd(args[0]),
    });

    this.commands.set('pwd', {
      name: 'pwd',
      description: 'Print working directory',
      execute: () => this.pwd(),
    });

    this.commands.set('echo', {
      name: 'echo',
      description: 'Display a message',
      execute: (args) => args.join(' '),
    });

    this.commands.set('date', {
      name: 'date',
      description: 'Display current date and time',
      execute: () => new Date().toString(),
    });

    this.commands.set('uname', {
      name: 'uname',
      description: 'Print system information (uname -a for all)',
      execute: (args) => this.uname(args[0]),
    });

    this.commands.set('history', {
      name: 'history',
      description: 'Display command history',
      execute: () => '__HISTORY__',
    });

    this.commands.set('exit', {
      name: 'exit',
      description: 'Close terminal window',
      execute: () => {
        this.navigationService.closeTab('terminal');
        return 'Terminal closed. Goodbye! 👋';
      },
    });

    // Easter eggs for developers
    this.commands.set('sudo', {
      name: 'sudo',
      description: 'Execute a command as superuser',
      execute: (args) => this.sudo(args),
    });

    this.commands.set('vim', {
      name: 'vim',
      description: 'Open Vim editor',
      execute: (args) => this.vim(args[0]),
    });

    this.commands.set('ssh', {
      name: 'ssh',
      description: 'SSH into remote servers',
      execute: (args) => this.ssh(args[0]),
    });

    this.commands.set('curl', {
      name: 'curl',
      description: 'Transfer data from or to a server',
      execute: (args) => this.curl(args),
    });

    this.commands.set('git', {
      name: 'git',
      description: 'Git version control',
      execute: (args) => this.git(args),
    });

    this.commands.set('docker', {
      name: 'docker',
      description: 'Docker container management',
      execute: (args) => this.docker(args),
    });

    this.commands.set('sudo-rm-rf', {
      name: 'sudo-rm-rf',
      description: '🔴 DANGER: Remove files recursively',
      execute: (args) => this.dangerousCommand(args),
    });

    this.commands.set('matrix', {
      name: 'matrix',
      description: 'Enter the Matrix',
      execute: () => this.matrix(),
    });

    this.commands.set('rickroll', {
      name: 'rickroll',
      description: 'Never gonna give you up...',
      execute: () => this.rickroll(),
    });

    this.commands.set('sudo-make-me-a-sandwich', {
      name: 'sudo-make-me-a-sandwich',
      description: 'Make a sandwich with sudo',
      execute: () => this.makeSandwich(),
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

  // Additional Linux command implementations
  private grep(pattern: string, file?: string): string {
    if (!pattern) {
      return '\x1b[1;31mError:\x1b[0m Usage: grep [pattern] [file]\nExample: grep "Angular" projects.json';
    }

    if (!file) {
      // Search in all available files
      const results: string[] = [];

      const projectsContent = this.getProjectsContent();
      if (projectsContent.toLowerCase().includes(pattern.toLowerCase())) {
        results.push(`\x1b[96mprojects.json:\x1b[0m`);
        const lines = projectsContent.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            results.push(`  ${index + 1}:${line.replace(new RegExp(pattern, 'gi'), (match) => `\x1b[91m${match}\x1b[0m`)}`);
          }
        });
      }

      const contactContent = this.getContactContent();
      if (contactContent.toLowerCase().includes(pattern.toLowerCase())) {
        results.push(`\x1b[96mcontact.txt:\x1b[0m`);
        const lines = contactContent.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(pattern.toLowerCase())) {
            results.push(`  ${index + 1}:${line.replace(new RegExp(pattern, 'gi'), (match) => `\x1b[91m${match}\x1b[0m`)}`);
          }
        });
      }

      return results.length > 0 ? results.join('\n') : `\x1b[90mNo matches found for pattern: ${pattern}\x1b[0m`;
    }

    // Search in specific file
    let content = '';
    switch (file.toLowerCase()) {
      case 'projects.json':
        content = this.getProjectsContent();
        break;
      case 'contact.txt':
        content = this.getContactContent();
        break;
      default:
        return `\x1b[1;31mError:\x1b[0m File not found: ${file}`;
    }

    const lines = content.split('\n');
    const matches: string[] = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(pattern.toLowerCase())) {
        matches.push(`${index + 1}:${line.replace(new RegExp(pattern, 'gi'), (match) => `\x1b[91m${match}\x1b[0m`)}`);
      }
    });

    return matches.length > 0 ? matches.join('\n') : `\x1b[90mNo matches found in ${file}\x1b[0m`;
  }

  private find(args: string[]): string {
    if (args.length === 0) {
      return this.getFindTree('.');
    }

    if (args.includes('-name') && args.length > 2) {
      const pattern = args[args.indexOf('-name') + 1];
      return this.searchByName(pattern);
    }

    if (args.includes('-type')) {
      const typeIndex = args.indexOf('-type');
      if (typeIndex >= 0 && args.length > typeIndex + 1) {
        const type = args[typeIndex + 1];
        if (type === 'f') return '\x1b[96mAvailable files:\x1b[0m\n  projects.json\n  contact.txt\n  resume.pdf';
        if (type === 'd') return '\x1b[96mAvailable directories:\x1b[0m\n  skills/\n  languages/\n  frameworks-and-libraries/\n  tools/\n  clouds-and-providers/';
      }
    }

    return '\x1b[1;31mError:\x1b[0m Usage: find [path] [-name pattern] [-type f|d]\nExample: find . -name "*.json"';
  }

  private searchByName(pattern: string): string {
    const files = [
      { name: 'projects.json', path: './projects.json' },
      { name: 'contact.txt', path: './contact.txt' },
      { name: 'resume.pdf', path: './resume.pdf' }
    ];

    const matches = files.filter(file =>
      file.name.toLowerCase().includes(pattern.toLowerCase().replace('*', ''))
    );

    if (matches.length === 0) {
      return `\x1b[90mNo files found matching: ${pattern}\x1b[0m`;
    }

    return matches.map(file => `./${file.name}`).join('\n');
  }

  private man(commandName?: string): string {
    if (!commandName) {
      return '\x1b[1;31mError:\x1b[0m What manual page do you want?\nExample: man ls';
    }

    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      return `\x1b[1;31mNo manual entry for ${commandName}\x1b[0m`;
    }

    // Ensure commandName is not undefined for template strings
    const cmdName = commandName || 'unknown';

    const manual = `\x1b[96m${cmdName.toUpperCase()}(1)\x1b[0m                    \x1b[96mUser Commands\x1b[0m                   \x1b[96m${cmdName.toUpperCase()}(1)\x1b[0m

\x1b[1;33mNAME\x1b[0m
       ${cmdName} - ${command.description}

\x1b[1;33mSYNOPSIS\x1b[0m
       \x1b[92m${cmdName}\x1b[0m ${this.getSyntax(cmdName)}

\x1b[1;33mDESCRIPTION\x1b[0m
       ${this.getDescription(cmdName)}

\x1b[1;33mEXAMPLES\x1b[0m
       ${this.getExamples(cmdName)}

\x1b[1;33mSEE ALSO\x1b[0m
       \x1b[96mls(1)\x1b[0m, \x1b[96mcat(1)\x1b[0m, \x1b[96mfind(1)\x1b[0m, \x1b[96mgrep(1)\x1b[0m

\x1b[90mPortfolio Linux \x1b[0m            \x1b[90mAugust 2024\x1b[0m                 \x1b[90m${cmdName.toUpperCase()}(1)\x1b[0m`;

    return manual;
  }

  private getSyntax(command: string): string {
    switch (command) {
      case 'ls': return '';
      case 'cat': return '[FILE]';
      case 'grep': return '[PATTERN] [FILE]';
      case 'find': return '[PATH] [-name PATTERN] [-TYPE f|d]';
      case 'cd': return '[DIRECTORY]';
      case 'man': return '[COMMAND]';
      case 'layout': return '[grid|main-horizontal|main-vertical|floating]';
      default: return '[OPTIONS]';
    }
  }

  private getDescription(commandName: string): string {
    switch (commandName) {
      case 'ls': return 'List directory contents in the portfolio filesystem.';
      case 'cat': return 'Concatenate and display FILE contents.';
      case 'grep': return 'Search for PATTERN in each FILE.';
      case 'find': return 'Search for files in a directory hierarchy.';
      case 'cd': return 'Change the current working directory.';
      case 'tree': return 'List contents of directories in a tree-like format.';
      case 'clear': return 'Clear the terminal screen.';
      case 'help': return 'Display information about builtin commands.';
      case 'whoami': return 'Print effective user information.';
      case 'sudo': return 'Execute a command as superuser.';
      case 'vim': return 'Open Vim text editor.';
      case 'ssh': return 'SSH into remote servers.';
      case 'curl': return 'Transfer data from or to a server.';
      case 'git': return 'Git version control system.';
      case 'docker': return 'Docker container management.';
      case 'echo': return 'Display a line of text.';
      case 'date': return 'Display current date and time.';
      case 'uname': return 'Print system information.';
      case 'pwd': return 'Print working directory.';
      case 'history': return 'Display command history.';
      case 'exit': return 'Close terminal window.';
      case 'man': return 'Display manual page for a command.';
      case 'layout': return 'Change window layout mode.';
      case 'matrix': return 'Enter the Matrix simulation.';
      case 'rickroll': return 'Never gonna give you up...';
      default:
        // Get the command object from the map
        const cmd = this.commands.get(commandName);
        return cmd ? cmd.description : 'Execute command.';
    }
  }

  private getExamples(command: string): string {
    switch (command) {
      case 'ls': return `       \x1b[92mls\x1b[0m
              List current directory

       \x1b[92mls -la\x1b[0m
              List with details (not implemented)`;
      case 'cat': return `       \x1b[92mcat projects.json\x1b[0m
              Display projects information

       \x1b[92mcat contact.txt\x1b[0m
              Display contact information`;
      case 'grep': return `       \x1b[92mgrep "Angular" projects.json\x1b[0m
              Find Angular in projects

       \x1b[92mgrep "email" *.txt\x1b[0m
              Find email in all text files`;
      case 'find': return `       \x1b[92mfind . -name "*.json"\x1b[0m
              Find all JSON files

       \x1b[92mfind skills/ -type f\x1b[0m
              Find all files in skills directory`;
      case 'cd': return `       \x1b[92mcd skills/\x1b[0m
              Go to skills directory

       \x1b[92mcd ..\x1b[0m
              Go to parent directory`;
      case 'tree': return `       \x1b[92mtree skills/\x1b[0m
              Show skills directory tree`;
      default: return `       \x1b[92m${command}\x1b[0m
              Run ${command} command`;
    }
  }

  private cd(directory?: string): string {
    if (!directory || directory === '~') {
      this.currentDirectory = '~';
      return `\x1b[92mChanged to home directory: ~\x1b[0m`;
    }

    if (directory === '..') {
      if (this.currentDirectory !== '~') {
        this.currentDirectory = '~';
        return `\x1b[92mMoved to parent directory: ~\x1b[0m`;
      }
      return `\x1b[90mAlready at home directory\x1b[0m`;
    }

    const validDirs = ['skills', 'skills/', 'languages', 'frameworks-and-libraries', 'tools', 'clouds-and-providers'];

    if (validDirs.includes(directory)) {
      this.currentDirectory = `~/${directory.replace('/', '')}`;
      return `\x1b[92mChanged to directory: ${this.currentDirectory}\x1b[0m`;
    }

    return `\x1b[1;31mError:\x1b[0m Directory not found: ${directory}`;
  }

  private pwd(): string {
    return `\x1b[96m${this.currentDirectory || '~'}\x1b[0m`;
  }

  private uname(option?: string): string {
    if (option === '-a') {
      return `Linux portfolio 6.14.0-36-generic #40-Ubuntu SMP PREEMPT_DYNAMIC Mon Nov 4 02:06:24 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux`;
    }
    if (option === '-s') return 'Linux';
    if (option === '-r') return '6.14.0-36-generic';
    if (option === '-m') return 'x86_64';

    return 'Linux';
  }

  private getFindTree(path: string): string {
    return `\x1b[96m.\x1b[0m
├── \x1b[92mprojects.json\x1b[0m
├── \x1b[92mcontact.txt\x1b[0m
├── \x1b[92mresume.pdf\x1b[0m
└── \x1b[96mskills/\x1b[0m
    ├── \x1b[96mlanguages/\x1b[0m
    │   ├── \x1b[92mjavascript\x1b[0m
    │   ├── \x1b[92mtypescript\x1b[0m
    │   ├── \x1b[92mpython\x1b[0m
    │   └── \x1b[92msql\x1b[0m
    ├── \x1b[96mframeworks-and-libraries/\x1b[0m
    │   ├── \x1b[92mnode.js\x1b[0m
    │   ├── \x1b[92mexpress.js\x1b[0m
    │   ├── \x1b[92mangular\x1b[0m
    │   └── \x1b[92mreact\x1b[0m
    ├── \x1b[96mtools/\x1b[0m
    │   ├── \x1b[92mgit\x1b[0m
    │   ├── \x1b[92mdocker\x1b[0m
    │   └── \x1b[92mvscode\x1b[0m
    └── \x1b[96mclouds-and-providers/\x1b[0m
        ├── \x1b[92maws\x1b[0m
        ├── \x1b[92mvercel\x1b[0m
        └── \x1b[92mrailway\x1b[0m`;
  }

  private currentDirectory: string = '~';

  // Easter eggs implementations
  private sudo(args: string[]): string {
    if (args.length === 0) {
      return '\x1b[91m[sudo] password for hat:\x1b[0m\n\x1b[92m✓\x1b[0m Authentication successful\nBut what do you want to do as root? Try "sudo make-me-a-sandwich"';
    }

    const command = args.join(' ');

    if (command === 'make-me-a-sandwich') {
      return this.makeSandwich();
    }

    if (command.includes('rm -rf /')) {
      return this.dangerousCommand(args.slice(2));
    }

    return `\x1b[92m[sudo] hat@portfolio:\x1b[0m Executing \x1b[96m${command}\x1b[0m as root...\n\x1b[90mOkay, but don't break anything! 😄\x1b[0m`;
  }

  private vim(filename?: string): string {
    // Ensure filename is always defined
    const fileToEdit = filename || 'portfolio.md';

    const vimArt = `
\x1b[92m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\x1b[0m
\x1b[96mVim - Vi IMproved 9.1\x1b[0m
\x1b[92m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\x1b[0m

\x1b[90mFeatures:\x1b[0m
\x1b[33m>\x1b[0m Vim has mode-based editing
\x1b[33m>\x1b[0m Vim is modal and efficient
\x1b[33m>\x1b[0m Vim has a steep learning curve
\x1b[33m>\x1b[0m Vim has :wq to save and quit
\x1b[33m>\x1b[0m Vim has :q! to quit without saving
\x1b[33m>\x1b[0m Vim has hjkl for navigation
\x1b[33m>\x1b[0m Vim has ESC to enter normal mode
\x1b[33m>\x1b[0m Vim has i to enter insert mode

\x1b[96mEditing ${fileToEdit}...\x1b[0m
\x1b[90mType :q to exit, :wq to save and quit\x1b[0m

\x1b[91mPress Ctrl+C to exit Vim simulation\x1b[0m
    `;

    return vimArt;
  }

  private ssh(server?: string): string {
    if (!server) {
      return '\x1b[1;31mUsage:\x1b[0m ssh [user@]hostname\nExample: ssh github.com';
    }

    if (server === 'github.com' || server === 'git@github.com') {
      return `
\x1b[90mConnecting to GitHub...\x1b[0m
\x1b[92mPTY allocation request sent on channel 0\x1b[0m
\x1b[96mHi hat! You've successfully authenticated to GitHub.\x1b[0m
\x1b[96mGitHub username: hat\x1b[0m
\x1b[96mShell access is not supported.\x1b[0m
\x1b[96mConnection to github.com closed.\x1b[0m

\x1b[90mBut you can check out my repositories at:\x1b[0m
\x1b[96mhttps://github.com/hat\x1b[0m
      `;
    }

    if (server === 'localhost' || server === '127.0.0.1') {
      return `
\x1b[90mConnecting to localhost...\x1b[0m
\x1b[92mWelcome to Ubuntu 22.04 LTS\x1b[0m
\x1b[96mLast login: ${new Date().toString()}\x1b[0m
\x1b[96mSystem load: 0.08, 0.12, 0.08\x1b[0m
\x1b[96mMemory usage: 45% of 8GB\x1b[0m
\x1b[96mDisk usage: 23% of 256GB\x1b[0m

\x1b[93mhat@portfolio:~$ \x1b[0m
\x1b[90mOops, you're already here! 🤔\x1b[0m
      `;
    }

    return `\x1b[90mConnecting to ${server}...\x1b[0m\n\x1b[1;31mConnection refused\x1b[0m\n\x1b[90mMake sure the server is running and you have the correct credentials\x1b[0m`;
  }

  private curl(args: string[]): string {
    if (args.length === 0) {
      return '\x1b[1;31mUsage:\x1b[0m curl [URL] [options]\nExample: curl https://api.github.com/users/hat';
    }

    const url = args.find(arg => arg.startsWith('http')) || args[0];

    if (url.includes('api.github.com')) {
      return `
\x1b[90mGET ${url} HTTP/1.1\x1b[0m
\x1b[90mHost: api.github.com\x1b[0m
\x1b[90mUser-Agent: curl/7.81.0\x1b[0m
\x1b[90mAccept: */*\x1b[0m

\x1b[96mHTTP/2 200\x1b[0m
\x1b[96mserver: GitHub.com\x1b[0m
\x1b[96mcontent-type: application/json; charset=utf-8\x1b[0m

\x1b[92m{\x1b[0m
  \x1b[96m"login"\x1b[0m: \x1b[1;32m"hat"\x1b[0m,
  \x1b[96m"id"\x1b[0m: \x1b[1;34m12345678\x1b[0m,
  \x1b[96m"public_repos"\x1b[0m: \x1b[1;34m42\x1b[0m,
  \x1b[96m"followers"\x1b[0m: \x1b[1;34m1337\x1b[0m,
  \x1b[96m"following"\x1b[0m: \x1b[1;34m256\x1b[0m,
  \x1b[96m"bio"\x1b[0m: \x1b[1;32m"Full Stack Developer | Linux Enthusiast | Portfolio Creator"\x1b[0m,
  \x1b[96m"location"\x1b[0m: \x1b[1;32m"Digital World"\x1b[0m
\x1b[92m}\x1b[0m
      `;
    }

    if (url.includes('jsonplaceholder.typicode.com')) {
      return `
\x1b[90mMaking API request...\x1b[0m
\x1b[92m{\x1b[0m
  \x1b[96m"userId"\x1b[0m: \x1b[1;34m1\x1b[0m,
  \x1b[96m"id"\x1b[0m: \x1b[1;34m1\x1b[0m,
  \x1b[96m"title"\x1b[0m: \x1b[1;32m"sunt aut facere repellat provident occaecati excepturi optio reprehenderit"\x1b[0m,
  \x1b[96m"completed"\x1b[0m: \x1b[1;34mfalse\x1b[0m
\x1b[92m}\x1b[0m
      `;
    }

    return `\x1b[90mRequesting ${url}...\x1b[0m\n\x1b[1;31m404 Not Found\x1b[0m\n\x1b[90mThis is a portfolio terminal, not a real curl client! 😄\x1b[0m`;
  }

  private git(args: string[]): string {
    if (args.length === 0) {
      return `\x1b[96mgit --version\x1b[0m
\x1b[92mgit version 2.43.0\x1b[0m

\x1b[90mUsage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           <command> [<args>]\x1b[0m`;
    }

    const subcommand = args[0];

    switch (subcommand) {
      case 'status':
        return `
\x1b[96mOn branch main\x1b[0m
\x1b[92mYour branch is up to date with 'origin/main'.\x1b[0m

\x1b[90mChanges to be committed:\x1b[0m
  \x1b[92mmodified:   src/app/core/services/terminal-commands.service.ts\x1b[0m
  \x1b[92mnew file:   src/app/core/services/theme.service.ts\x1b[0m
  \x1b[92mnew file:   src/app/core/services/performance.service.ts\x1b[0m

\x1b[96mChanges not staged for commit:\x1b[0m
  \x1b[91mmodified:   src/styles.css\x1b[0m
  \x1b[91mmodified:   package.json\x1b[0m

\x1b[90mUntracked files:\x1b[0m
  \x1b[93massets/images/background-dark.png\x1b[0m
        `;
      case 'log':
        return `
\x1b[96mcommit 7c666d4 (HEAD -> main, origin/main)\x1b[0m
\x1b[92mAuthor: hat <hat@example.com>\x1b[0m
\x1b[92mDate:   ${new Date().toDateString()}\x1b[0m
    \x1b[90mstyle(header): refactor taskbar styles to use CSS variables\x1b[0m

\x1b[96mcommit a406861\x1b[0m
\x1b[92mAuthor: hat <hat@example.com>\x1b[0m
\x1b[92mDate:   ${new Date().toDateString()}\x1b[0m
    \x1b[90mfeat(desktop): implement desktop-like window management\x1b[0m

\x1b[96mcommit 4000b4b\x1b[0m
\x1b[92mAuthor: hat <hat@example.com>\x1b[0m
\x1b[92mDate:   ${new Date().toDateString()}\x1b[0m
    \x1b[90mfeat(initial): portfolio application\x1b[0m
        `;
      case 'add':
        return `\x1b[90mStaging files...\x1b[0m\n\x1b[92m✓ Files staged successfully\x1b[0m\n\x1b[90mReady to commit! Use 'git commit -m "your message"'\x1b[0m`;
      case 'commit':
        const message = args.slice(2).join(' ') || 'feat: update portfolio';
        return `
\x1b[90mCreating commit...\x1b[0m
\x1b[92m[main 1234abcd] ${message}\x1b[0m
\x1b[92m 3 files changed, 142 insertions(+), 15 deletions(-)\x1b[0m
\x1b[92m create mode 100644 src/app/core/services/theme.service.ts\x1b[0m
\x1b[90mCommit created successfully!\x1b[0m
        `;
      default:
        return `\x1b[90mgit ${subcommand}: command not found in portfolio terminal\x1b[0m\n\x1b[90mTry: status, log, add, commit\x1b[0m`;
    }
  }

  private docker(args: string[]): string {
    if (args.length === 0) {
      return `
\x1b[96mClient: Docker Engine - Community\x1b[0m
\x1b[92mVersion:  24.0.7\x1b[0m
\x1b[92mAPI version:  1.43\x1b[0m
\x1b[92mGo version:  go1.20.10\x1b[0m
\x1b[92mGit commit:  311b9ff\x1b[0m
\x1b[92mBuilt:     Fri Oct 27 19:58:51 2023\x1b[0m
\x1b[92mOS/Arch:   linux/amd64\x1b[0m
\x1b[92mContext:   default\x1b[0m
      `;
    }

    const subcommand = args[0];

    switch (subcommand) {
      case 'ps':
        return `
\x1b[96mCONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES\x1b[0m
\x1b[92ma1b2c3d4e5f6   nginx:latest   "nginx -g 'daemon of…"   2 hours ago     Up 2 hours     80/tcp    portfolio-web\x1b[0m
\x1b[92mf6e5d4c3b2a1   postgres:15    "docker-entrypoint.s…"   5 hours ago     Up 5 hours     5432/tcp  portfolio-db\x1b[0m
        `;
      case 'run':
        const image = args[1] || 'hello-world';
        return `
\x1b[90mUnable to find image '${image}:latest' locally\x1b[0m
\x1b[90mlatest: Pulling from library/${image}\x1b[0m
\x1b[92mDigest: sha256:0000...\x1b[0m
\x1b[92mStatus: Downloaded newer image for ${image}:latest\x1b[0m

\x1b[96mHello from Docker!\x1b[0m
\x1b[90mThis message shows that your installation appears to be working correctly.\x1b[0m

\x1b[96mTo generate this message, Docker took the following steps:\x1b[0m
\x1b[33m1. The Docker client contacted the Docker daemon.\x1b[0m
\x1b[33m2. The Docker daemon pulled the "hello-world" image from the Docker Hub.\x1b[0m
\x1b[33m3. The Docker daemon created a new container from that image.\x1b[0m
        `;
      default:
        return `\x1b[90mdocker ${subcommand}: Not implemented in portfolio terminal\x1b[0m\n\x1b[90mTry: ps, run, version\x1b[0m`;
    }
  }

  private dangerousCommand(args: string[]): string {
    const target = args.join(' ') || '/';

    if (target.includes('/') || target === '/') {
      return `
\x1b[1;31m⚠️  WARNING! ⚠️\x1b[0m
\x1b[91mYou are about to execute: rm -rf ${target}\x1b[0m
\x1b[93mThis will delete everything in ${target}!\x1b[0m

\x1b[96mType "yes-i-really-want-to-delete-everything" to confirm:\x1b[0m
\x1b[90m(Ctrl+C to cancel)\x1b[0m

\x1b[1;32m> \x1b[0m
\x1b[90mJust kidding! This is a portfolio terminal. 😄\x1b[0m
\x1b[90mReal Linux systems would be affected by this command!\x1b[0m
\x1b[90mRemember: With great power comes great responsibility! 💻\x1b[0m
      `;
    }

    return `\x1b[90mAttempting to delete: ${target}\x1b[0m\n\x1b[92m✓ Simulated deletion successful\x1b[0m\n\x1b[90m(Don't worry, nothing was actually deleted!)\x1b[0m`;
  }

  private matrix(): string {
    return `
\x1b[92mWake up, Neo...\x1b[0m

\x1b[32mThe Matrix has you...\x1b[0m
\x1b[32mFollow the white rabbit.\x1b[0m

\x1b[90mKnock, knock, Neo.\x1b[0m

\x1b[96m ██╗    ██╗███████╗████████╗    ███████╗██████╗  █████╗ ███╗   ███╗███████╗\x1b[0m
\x1b[96m ██║    ██║██╔════╝╚══██╔══╝    ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝\x1b[0m
\x1b[96m ██║ █╗ ██║█████╗     ██║       █████╗  ██████╔╝███████║██╔████╔██║█████╗  \x1b[0m
\x1b[96m ██║███╗██║██╔══╝     ██║       ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  \x1b[0m
\x1b[96m ╚███╔███╔╝███████╗   ██║       ███████╗██║  ██║██║  ██║██║ ╚═╝ ██║███████╗\x1b[0m
\x1b[96m  ╚══╝╚══╝ ╚══════╝   ╚═╝       ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝\x1b[0m

\x1b[90mThere is no spoon.\x1b[0m
    `;
  }

  private rickroll(): string {
    return `
\x1b[91m🎵 Never gonna give you up, never gonna let you down... 🎵\x1b[0m

\x1b[93m┌─────────────────────────────────────────────┐\x1b[0m
\x1b[93m│                                             │\x1b[0m
\x1b[93m│           YOU'VE BEEN RICK-ROLLED!           │\x1b[0m
\x1b[93m│                                             │\x1b[0m
\x1b[93m│        Never gonna run around and desert    │\x1b[0m
\x1b[93m│                  you! 🕺💃                     │\x1b[0m
\x1b[93m│                                             │\x1b[0m
\x1b[93m│           👆 Click here to continue 👆        │\x1b[0m
\x1b[93m│                                             │\x1b[0m
\x1b[93m└─────────────────────────────────────────────┘\x1b[0m

\x1b[96mVideo URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ\x1b[0m
\x11]8;;https://www.youtube.com/watch?v=dQw4w9WgXcQ\a\x1b[96m[Click to open]\x1b[0m\x1b]8;;\a
    `;
  }

  private makeSandwich(): string {
    const ingredients = [
      '🍞 Fresh bread',
      '🥬 Lettuce',
      '🍅 Tomato',
      '🧀 Cheese',
      '🥓 Bacon',
      '🥒 Pickles'
    ];

    const sandwich = ingredients.sort(() => Math.random() - 0.5);

    let output = `\x1b[92m🔪 Making sandwich with sudo privileges...\x1b[0m\n\n`;

    sandwich.forEach((ingredient, index) => {
      setTimeout(() => {
        output += `\x1b[33m  ${index + 1}. Adding ${ingredient}...\x1b[0m\n`;
      }, index * 500);
    });

    output += `
\x1b[92m✓ Sandwich created successfully!\x1b[0m

\x1b[90mIngredients:\x1b[0m
${sandwich.map(ing => `  ${ing}`).join('\n')}

\x1b[93m🥪 Your delicious sandwich is ready! Enjoy!\x1b[0m
\x1b[90mCalories: ${Math.floor(Math.random() * 500) + 300}\x1b[0m
\x1b[90mSatisfaction level: 100%\x1b[0m
    `;

    return output;
  }
}
