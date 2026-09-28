import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const major = Number(process.versions.node.split('.')[0]);
const command = process.argv[2];
const rest = process.argv.slice(3);

function versionOf(nodePath) {
  try {
    const text = execFileSync(nodePath, ['-p', 'process.versions.node'], { encoding: 'utf8' }).trim();
    return Number(text.split('.')[0]);
  } catch {
    return 0;
  }
}

function newerNode() {
  const found = [];
  const winget = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages')
    : '';
  if (winget && existsSync(winget)) {
    for (const pack of readdirSync(winget)) {
      const root = join(winget, pack);
      let nested = [];
      try {
        nested = readdirSync(root);
      } catch {
        nested = [];
      }
      for (const name of nested) {
        const candidate = join(root, name, 'node.exe');
        if (existsSync(candidate)) found.push(candidate);
      }
    }
  }
  const program = 'C:\\Program Files\\nodejs\\node.exe';
  if (existsSync(program)) found.push(program);
  return found
    .map((nodePath) => ({ nodePath, major: versionOf(nodePath) }))
    .filter((item) => item.major >= 18)
    .sort((a, b) => b.major - a.major)[0];
}

function launch(nodePath, args) {
  const child = spawn(nodePath, args, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code == null ? 1 : code));
}

const viteArgs = command === 'vite'
  ? [join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'), ...rest]
  : [command, ...rest];

if (major >= 18) {
  launch(process.execPath, viteArgs);
} else {
  const picked = newerNode();
  if (!picked) {
    console.error('TypeDrop needs Node.js 18 or newer. This terminal is using Node ' + process.versions.node + '.');
    process.exit(1);
  }
  launch(picked.nodePath, viteArgs);
}
