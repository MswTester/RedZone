import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { input, select, confirm, checkbox } from '@inquirer/prompts';
import { 
  getVinxenRootPath, 
  getAppTemplates, 
  getPackages, 
  getSharedPackages,
  parseGitignore,
  copyDirectoryWithGitignore 
} from '../utils/file-utils.js';

export interface CreateOptions {
  name?: string;
}

export async function createProject(name?: string, options: CreateOptions = {}) {
  try {
    const vinxenRoot = getVinxenRootPath();
    
    let projectName = name;
    if (!projectName) {
      projectName = await input({
        message: 'Project name:',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
          return true;
        }
      });
    }
    
    const targetDir = path.resolve(process.cwd(), projectName!);
    
    if (fs.existsSync(targetDir)) {
      const overwrite = await confirm({
        message: `Directory ${projectName} already exists. Overwrite?`,
        default: false
      });
      
      if (!overwrite) {
        console.log(chalk.yellow('Operation cancelled'));
        return;
      }
      
      fs.removeSync(targetDir);
    }
    
    const appTemplates = getAppTemplates();
    if (appTemplates.length === 0) {
      console.log(chalk.red('No app templates found in /apps directory'));
      return;
    }
    
    const selectedApp = await select({
      message: 'Select app template:',
      choices: appTemplates.map(template => ({
        name: template,
        value: template
      }))
    });
    
    const appPackages = getPackages(selectedApp);
    const sharedPackages = getSharedPackages();
    
    let selectedPackages: string[] = [...sharedPackages];
    if (appPackages.length > 0) {
      const packages = await checkbox({
        message: 'Select additional packages to include:',
        choices: appPackages.map(pkg => ({
          name: `${selectedApp}/${pkg}`,
          value: `${selectedApp}/${pkg}`
        }))
      });
      selectedPackages = [...selectedPackages, ...packages];
    }
    
    console.log(chalk.blue(`Creating project in ${targetDir}`));
    
    const appTemplatePath = path.join(vinxenRoot, 'apps', selectedApp);
    const gitignorePath = path.join(appTemplatePath, '.gitignore');
    const gitignorePatterns = parseGitignore(gitignorePath);
    
    await copyDirectoryWithGitignore(appTemplatePath, targetDir, gitignorePatterns);
    
    if (selectedPackages.length > 0) {
      const packagesDir = path.join(targetDir, 'packages');
      await fs.ensureDir(packagesDir);
      
      for (const packageName of selectedPackages) {
        const [packageType, packageFolder] = packageName.includes('/') 
          ? packageName.split('/')
          : ['shared', packageName];
        
        const srcPath = path.join(vinxenRoot, 'packages', packageType!, packageFolder!);
        const destPath = path.join(packagesDir, packageFolder!);
        
        if (fs.existsSync(srcPath)) {
          await fs.copy(srcPath, destPath);
          console.log(chalk.green(`✓ Copied package: ${packageName}`));
        }
      }
    }
    
    process.chdir(targetDir);
    
    try {
      const { execSync } = await import('child_process');
      execSync('git init', { stdio: 'ignore' });
      console.log(chalk.green('✓ Git repository initialized'));
    } catch (error) {
      console.log(chalk.yellow('Warning: Could not initialize git repository'));
    }
    
    console.log(chalk.green('\n✓ Project created successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev'));
    
  } catch (error) {
    console.log(chalk.red('Error:', error instanceof Error ? error.message : 'Unknown error'));
  }
}