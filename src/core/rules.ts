
import { CodeCraftConfig } from '../config/schema';
import { execSync } from 'child_process';
import chalk from 'chalk';

export interface RuleViolation {
    ruleName: string;
    description: string;
    severity: 'error' | 'warn' | 'info';
    files: string[];
}

export class RuleValidator {
    private config: CodeCraftConfig;
    private cwd: string;

    constructor(config: CodeCraftConfig, cwd: string = process.cwd()) {
        this.config = config;
        this.cwd = cwd;
    }

    validate(): RuleViolation[] {
        const violations: RuleViolation[] = [];

        for (const rule of this.config.rules) {
            try {
                // Execute the check command (e.g. grep)
                // If grep finds matches, it returns 0 (success), which means a PROHIBITED pattern was found.
                // We catch the output to see which files failed.

                // Note: execSync throws if exit code is non-zero (which for grep means "no matches found", i.e., PASS)
                // So:
                // - exit 0 (matches found) -> FAIL (Violation)
                // - exit 1 (no matches) -> PASS

                execSync(rule.check, { cwd: this.cwd, stdio: 'ignore' });

                // If we reached here, grep found something!
                violations.push({
                    ruleName: rule.name,
                    description: rule.description,
                    severity: rule.severity,
                    files: ['(Run check manually to see files)'] // TODO: Parse grep output for specific files
                });

            } catch (error: any) {
                // grep returned status 1, which means NO matches found. This is GOOD.
                // So we do nothing.
            }
        }

        return violations;
    }
}
