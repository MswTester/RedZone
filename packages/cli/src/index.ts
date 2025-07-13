#!/usr/bin/env node
import { Command } from 'commander';
import { createProject } from './commands/create';

const program = new Command();

program
  .name('vinxen')
  .description('Vinxen CLI - Quick start app generator')
  .version('1.0.0');

program
  .command('create [name]')
  .description('Create a new project')
  .action(createProject);

program.parse();