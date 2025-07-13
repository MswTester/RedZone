import * as fs from 'fs-extra';
import * as path from 'path';

export function getVinxenRootPath(): string {
  let currentPath = process.cwd();
  
  while (currentPath !== '/') {
    const vinxenPath = path.join(currentPath, 'apps');
    if (fs.existsSync(vinxenPath)) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  
  throw new Error('Could not find vinxen root directory. Make sure you are in a vinxen project.');
}

export function getAppTemplates(): string[] {
  const vinxenRoot = getVinxenRootPath();
  const appsPath = path.join(vinxenRoot, 'apps');
  
  if (!fs.existsSync(appsPath)) {
    return [];
  }
  
  return fs.readdirSync(appsPath).filter((item: any) => {
    const itemPath = path.join(appsPath, item);
    return fs.statSync(itemPath).isDirectory();
  });
}

export function getPackages(appType: string): string[] {
  const vinxenRoot = getVinxenRootPath();
  const packagesPath = path.join(vinxenRoot, 'packages', appType);
  
  if (!fs.existsSync(packagesPath)) {
    return [];
  }
  
  return fs.readdirSync(packagesPath).filter((item: any) => {
    const itemPath = path.join(packagesPath, item);
    return fs.statSync(itemPath).isDirectory();
  });
}

export function getSharedPackages(): string[] {
  const vinxenRoot = getVinxenRootPath();
  const sharedPath = path.join(vinxenRoot, 'packages', 'shared');
  
  if (!fs.existsSync(sharedPath)) {
    return [];
  }
  
  return ['shared'];
}

export function parseGitignore(gitignorePath: string): string[] {
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  return content
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line && !line.startsWith('#'))
    .map((line: string) => line.endsWith('/') ? line.slice(0, -1) : line);
}

export function shouldIgnoreFile(filePath: string, gitignorePatterns: string[]): boolean {
  const fileName = path.basename(filePath);
  const relativePath = filePath;
  
  return gitignorePatterns.some((pattern: string) => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(fileName) || regex.test(relativePath);
    }
    return fileName === pattern || relativePath.includes(pattern);
  });
}

export async function copyDirectoryWithGitignore(
  srcDir: string,
  destDir: string,
  gitignorePatterns: string[] = []
): Promise<void> {
  await fs.ensureDir(destDir);
  
  const items = await fs.readdir(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    
    if (shouldIgnoreFile(item, gitignorePatterns)) {
      continue;
    }
    
    const stat = await fs.stat(srcPath);
    
    if (stat.isDirectory()) {
      await copyDirectoryWithGitignore(srcPath, destPath, gitignorePatterns);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}