
import { z } from 'zod';

export const CodeCraftConfigSchema = z.object({
  projectType: z.enum(['monorepo', 'standard', 'unknown']).default('standard'),
  layers: z.record(z.string(), z.array(z.string())).optional(),
  rules: z.array(z.object({
    name: z.string(),
    description: z.string(),
    severity: z.enum(['error', 'warn', 'info']),
    check: z.string()
  })).default([]),
  scopeGuard: z.object({
    protectedPaths: z.array(z.string()).default([]),
    autoLock: z.boolean().default(true)
  }).default({ protectedPaths: [], autoLock: true })
});

export type CodeCraftConfig = z.infer<typeof CodeCraftConfigSchema>;
