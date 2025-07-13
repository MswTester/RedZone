import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export async function createFile(path: string, content: string): Promise<void> {
  await fs.writeFile(path, content, 'utf8');
}

export async function readFile(path: string): Promise<string> {
  return await fs.readFile(path, 'utf8');
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function createDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copyFile(src, dest);
}

export async function copyDirectory(src: string, dest: string, ignorePatterns: string[] = []): Promise<void> {
  await createDirectory(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (ignorePatterns.includes(entry.name)) {
      continue;
    }
    
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, ignorePatterns);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

export async function readGitignore(path: string): Promise<string[]> {
  const gitignorePath = join(path, '.gitignore');
  try {
    const content = await readFile(gitignorePath);
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

export function resolveProjectPath(...paths: string[]): string {
  return join(process.cwd(), ...paths);
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function logError(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

export function logInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}