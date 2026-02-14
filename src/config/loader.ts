
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { CodeCraftConfig, CodeCraftConfigSchema } from './schema';
import chalk from 'chalk';

export class ConfigLoader {
    private configPath: string;

    constructor(cwd: string = process.cwd()) {
        this.configPath = path.join(cwd, 'codecraft.config.json');
    }

    load(): CodeCraftConfig | null {
        if (!existsSync(this.configPath)) {
            return null; // No config found
        }

        try {
            const rawConfig = readFileSync(this.configPath, 'utf-8');
            const jsonConfig = JSON.parse(rawConfig);
            const parsedConfig = CodeCraftConfigSchema.parse(jsonConfig);
            return parsedConfig;
        } catch (error) {
            console.error(chalk.red('Error loading codecraft.config.json:'), error);
            process.exit(1);
        }
    }

    exists(): boolean {
        return existsSync(this.configPath);
    }
}
