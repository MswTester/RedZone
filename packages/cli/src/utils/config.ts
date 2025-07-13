import { readFile, fileExists } from './file-operations';
import { join } from 'path';

export interface ProjectConfig {
  name: string;
  version: string;
  features: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface FeatureConfig {
  name: string;
  description: string;
  dependencies?: string[];
  devDependencies?: string[];
  files?: string[];
}

export const PACKAGES_PATH = join(process.cwd(), 'packages');
export const APPS_PATH = join(process.cwd(), 'apps');

export async function loadConfig(configPath: string): Promise<ProjectConfig | null> {
  if (!(await fileExists(configPath))) {
    return null;
  }
  
  const content = await readFile(configPath);
  return JSON.parse(content);
}

export async function saveConfig(configPath: string, config: ProjectConfig): Promise<void> {
  const { createFile } = await import('./file-operations');
  await createFile(configPath, JSON.stringify(config, null, 2));
}

export function getDefaultConfig(): ProjectConfig {
  return {
    name: 'new-project',
    version: '1.0.0',
    features: [],
    dependencies: {},
    devDependencies: {}
  };
}

export function getFeatureConfig(featureName: string): FeatureConfig | null {
  const features: Record<string, FeatureConfig> = {
    'be/auth': {
      name: 'Authentication Backend',
      description: 'JWT-based authentication with Elysia',
      dependencies: ['@elysiajs/jwt', 'elysia'],
      devDependencies: []
    },
    'be/firebase': {
      name: 'Firebase Backend',
      description: 'Firebase integration for backend',
      dependencies: ['firebase-admin'],
      devDependencies: []
    },
    'fe/hooks': {
      name: 'React Hooks',
      description: 'Custom React hooks collection',
      dependencies: ['react'],
      devDependencies: ['@types/react']
    },
    'fe/components': {
      name: 'React Components',
      description: 'Reusable React components',
      dependencies: ['react', 'react-dom'],
      devDependencies: ['@types/react', '@types/react-dom']
    },
    'fe/i18n': {
      name: 'Internationalization',
      description: 'i18n support for frontend',
      dependencies: ['react-i18next'],
      devDependencies: []
    }
  };
  
  return features[featureName] || null;
}

export const BACKEND_FEATURES: Record<string, FeatureConfig> = {
  auth: {
    name: 'Authentication',
    description: 'JWT-based authentication with Elysia',
    dependencies: ['@elysiajs/jwt', 'elysia'],
    devDependencies: []
  },
  firebase: {
    name: 'Firebase',
    description: 'Firebase integration for backend',
    dependencies: ['firebase-admin'],
    devDependencies: []
  }
};

export const FRONTEND_FEATURES: Record<string, FeatureConfig> = {
  hooks: {
    name: 'React Hooks',
    description: 'Custom React hooks collection',
    dependencies: ['react'],
    devDependencies: ['@types/react']
  },
  components: {
    name: 'React Components',
    description: 'Reusable React components',
    dependencies: ['react', 'react-dom'],
    devDependencies: ['@types/react', '@types/react-dom']
  },
  i18n: {
    name: 'Internationalization',
    description: 'i18n support for frontend',
    dependencies: ['react-i18next'],
    devDependencies: []
  }
};