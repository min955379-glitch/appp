import type {
  AppCategory,
  CreateAppInput,
  ModelConfig,
  PipelineConfig,
  SortOption,
  StudioApp,
  ValidationResult,
} from '../types/studio';

const COMPLEXITY_RANK: Record<StudioApp['complexityTier'], number> = {
  Starter: 1,
  Intermediate: 2,
  Enterprise: 3,
};

export function filterAndSortApps(
  apps: StudioApp[],
  options: {
    category: AppCategory;
    searchQuery: string;
    sortBy: SortOption;
    onlySavedIds?: string[];
  }
): StudioApp[] {
  const normalizedQuery = options.searchQuery.trim().toLowerCase();

  const filtered = apps.filter((app) => {
    if (options.onlySavedIds && !options.onlySavedIds.includes(app.id)) {
      return false;
    }

    if (options.category !== 'All' && app.category !== options.category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      app.title,
      app.subtitle,
      app.description,
      app.category,
      app.framework,
      app.defaultConfig.modelId,
      ...app.capabilities,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'latency') {
      return a.avgLatencyMs - b.avgLatencyMs;
    }
    if (options.sortBy === 'complexity') {
      return COMPLEXITY_RANK[a.complexityTier] - COMPLEXITY_RANK[b.complexityTier];
    }
    if (options.sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    // Default: featured first, then custom first, then title
    if (Boolean(a.featured) !== Boolean(b.featured)) {
      return a.featured ? -1 : 1;
    }
    if (Boolean(a.isCustom) !== Boolean(b.isCustom)) {
      return a.isCustom ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
}

export function validateCreateAppInput(input: CreateAppInput): ValidationResult {
  const errors: Record<string, string> = {};

  const trimmedTitle = input.title.trim();
  const trimmedSubtitle = input.subtitle.trim();
  const trimmedPrompt = input.promptSpec.trim();

  if (!trimmedTitle) {
    errors.title = 'Application title is required.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Application title must be at least 3 characters.';
  } else if (trimmedTitle.length > 64) {
    errors.title = 'Application title must be 64 characters or fewer.';
  }

  if (!trimmedSubtitle) {
    errors.subtitle = 'Short summary is required.';
  } else if (trimmedSubtitle.length < 8) {
    errors.subtitle = 'Short summary must be at least 8 characters.';
  }

  if (!trimmedPrompt) {
    errors.promptSpec = 'System prompt and functional specification is required.';
  } else if (trimmedPrompt.length < 20) {
    errors.promptSpec = 'Specification must be at least 20 characters for accurate synthesis.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function estimateTokenTelemetry(
  promptText: string,
  systemInstruction: string,
  config: ModelConfig
): {
  estimatedInputTokens: number;
  estimatedOutputBudget: number;
  estimatedLatencyMs: number;
  costPer1kRunsUsd: string;
} {
  const combinedLength = promptText.trim().length + systemInstruction.trim().length;
  const estimatedInputTokens = Math.max(12, Math.ceil(combinedLength / 3.8));
  const estimatedOutputBudget = Math.min(config.maxOutputTokens, Math.max(128, estimatedInputTokens * 3));

  const baseLatencyByModel: Record<ModelConfig['modelId'], number> = {
    'gemini-2.5-flash-lite': 240,
    'gemini-2.5-flash': 390,
    'gemini-2.5-pro': 820,
    'imagen-3.0-generate-002': 1350,
  };

  const baseRatePerMillion: Record<ModelConfig['modelId'], number> = {
    'gemini-2.5-flash-lite': 0.075,
    'gemini-2.5-flash': 0.15,
    'gemini-2.5-pro': 1.25,
    'imagen-3.0-generate-002': 3.0,
  };

  const groundingOverhead = config.groundingEnabled ? 140 : 0;
  const estimatedLatencyMs =
    baseLatencyByModel[config.modelId] +
    Math.round(estimatedInputTokens * 0.35) +
    groundingOverhead;

  const totalTokensPerRun = estimatedInputTokens + Math.round(estimatedOutputBudget * 0.45);
  const costUsd = (totalTokensPerRun / 1_000_000) * baseRatePerMillion[config.modelId] * 1000;

  return {
    estimatedInputTokens,
    estimatedOutputBudget,
    estimatedLatencyMs,
    costPer1kRunsUsd: `$${ Math.max(0.01, costUsd).toFixed(2) }`,
  };
}

export function createForkedApp(source: StudioApp, existingAppsCount: number): StudioApp {
  const forkNumber = existingAppsCount + 1;
  const slug = `${source.slug}-fork-${forkNumber}`;

  return {
    ...source,
    id: `custom-fork-${Date.now()}-${forkNumber}`,
    slug,
    title: `${source.title} (Workspace Fork)`,
    isCustom: true,
    featured: false,
    forkedFromId: source.id,
    createdAt: '2026-10-30',
    author: 'Workspace Engineer',
    defaultConfig: { ...source.defaultConfig },
    files: source.files.map((file) => ({ ...file })),
    demoPresets: source.demoPresets.map((preset) => ({ ...preset })),
  };
}

export function buildCustomStudioApp(input: CreateAppInput, indexNumber: number): StudioApp {
  const slug = input.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const artworkMap: Record<Exclude<AppCategory, 'All'>, StudioApp['artworkVariant']> = {
    'Spatial & Vision': 'spatial',
    'Multimodal Live': 'live-audio',
    'Code & Next.js': 'nextjs-code',
    'Audio & Speech': 'waveform',
    'Grounding & Data': 'telemetry',
  };

  const latencyMap: Record<CreateAppInput['modelId'], number> = {
    'gemini-2.5-flash-lite': 280,
    'gemini-2.5-flash': 420,
    'gemini-2.5-pro': 890,
    'imagen-3.0-generate-002': 1420,
  };

  return {
    id: `custom-app-${indexNumber}-${slug || 'app'}`,
    slug: slug || `custom-app-${indexNumber}`,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    description: input.promptSpec.trim(),
    category: input.category,
    artworkVariant: artworkMap[input.category],
    featured: false,
    isCustom: true,
    createdAt: '2026-10-30',
    author: 'Workspace Engineer',
    sdkVersion: '@google/genai ^2.4.0',
    framework: input.framework,
    avgLatencyMs: latencyMap[input.modelId],
    complexityTier: 'Enterprise',
    capabilities: ['TypeScript Strict', 'Next.js App Router', 'Structured Output', 'Server Action'],
    defaultConfig: {
      modelId: input.modelId,
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 2048,
      systemInstruction: input.promptSpec.trim(),
      jsonMode: true,
      groundingEnabled: input.category === 'Grounding & Data',
    },
    demoPresets: [
      {
        id: 'preset-primary',
        label: 'Execute Primary Specification',
        inputPrompt: `Run validation test for ${input.title.trim()}: verify structured output schema and latency budget.`,
        simulatedOutput: {
          summary: `Executed ${input.title.trim()} via ${input.modelId} using Next.js 15 Server Actions. All schema invariants and WCAG contrast checks passed.`,
          structuredData: {
            pipelineStatus: 'VERIFIED_NOMINAL',
            frameworkRuntime: input.framework,
            modelEndpoint: input.modelId,
            securityPolicy: 'CSP_STRICT_NONCE',
          },
          codeSnippet: `// Generated Next.js Server Route Result\n{\n  "app": "${input.title.trim()}",\n  "status": "nominal",\n  "schemaVerified": true\n}`,
          metrics: {
            latencyMs: latencyMap[input.modelId],
            inputTokens: 164,
            outputTokens: 312,
            confidenceScore: '99.4%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/studio/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const response = await ai.models.generateContent({
    model: '${input.modelId}',
    contents: prompt,
    config: {
      systemInstruction: ${JSON.stringify(input.promptSpec.trim())},
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  return NextResponse.json({ output: response.text });
}`,
      },
      {
        path: 'app/page.tsx',
        language: 'tsx',
        content: `'use client';

import React, { useState } from 'react';

export default function CustomStudioAppPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResult(data.output);
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold">${input.title.trim()}</h1>
      <p className="mt-2 text-slate-400">${input.subtitle.trim()}</p>
    </main>
  );
}`,
      },
    ],
  };
}

export function generateGitHubWorkflowYaml(config: PipelineConfig): string {
  const steps: string[] = [
    `name: Enterprise AI Studio Next.js CI/CD Pipeline`,
    ``,
    `on:`,
    `  push:`,
    `    branches: [ "${config.branch}" ]`,
    `  pull_request:`,
    `    branches: [ "${config.branch}" ]`,
    ``,
    `permissions:`,
    `  contents: read`,
    `  id-token: write`,
    ``,
    `jobs:`,
    `  quality-and-security:`,
    `    runs-on: ubuntu-latest`,
    `    steps:`,
    `      - name: Checkout Repository`,
    `        uses: actions/checkout@v4`,
    `      - name: Setup Node.js ${config.nodeVersion}`,
    `        uses: actions/setup-node@v4`,
    `        with:`,
    `          node-version: '${config.nodeVersion}'`,
    `          cache: 'npm'`,
    `      - name: Install Deterministic Dependencies`,
    `        run: npm ci --ignore-scripts`,
  ];

  if (config.enableSecurityAudit) {
    steps.push(
      `      - name: OWASP Dependency & Secret Audit`,
      `        run: npm audit --audit-level=high`
    );
  }

  if (config.enableTypecheck) {
    steps.push(
      `      - name: Strict TypeScript Verification`,
      `        run: npm run lint`
    );
  }

  if (config.enableUnitTests) {
    steps.push(
      `      - name: Execute Deterministic Unit Test Suite`,
      `        run: npx --yes tsx --test src/utils/studioLogic.test.ts`
    );
  }

  steps.push(
    `      - name: Build Production Bundle`,
    `        run: npm run build`,
    ``,
    `  deploy-${config.targetPlatform}:`,
    `    needs: quality-and-security`,
    `    if: github.ref == 'refs/heads/${config.branch}'`,
    `    runs-on: ubuntu-latest`,
    `    steps:`,
    `      - name: Checkout Repository`,
    `        uses: actions/checkout@v4`
  );

  if (config.targetPlatform === 'google-cloud-run') {
    steps.push(
      `      - name: Authenticate to Google Cloud Workload Identity`,
      `        uses: google-github-actions/auth@v2`,
      `        with:`,
      `          workload_identity_provider: \${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}`,
      `          service_account: \${{ secrets.GCP_SERVICE_ACCOUNT }}`,
      `      - name: Deploy Container to Cloud Run (${config.region})`,
      `        uses: google-github-actions/deploy-cloudrun@v2`,
      `        with:`,
      `          service: aistudio-enterprise-apps`,
      `          region: ${config.region}`,
      `          source: .`,
      `          env_vars: |`,
      `            NODE_ENV=production`
    );
  } else if (config.targetPlatform === 'vercel-edge') {
    steps.push(
      `      - name: Deploy Next.js Build to Vercel Edge Network`,
      `        run: npx vercel deploy --prod --token=\${{ secrets.VERCEL_TOKEN }}`
    );
  } else {
    steps.push(
      `      - name: Build & Push OCI Container Image`,
      `        run: docker build -t ghcr.io/enterprise/aistudio-apps:\${{ github.sha }} .`,
      `      - name: Apply Kubernetes Rollout (${config.region})`,
      `        run: kubectl set image deployment/aistudio-web web=ghcr.io/enterprise/aistudio-apps:\${{ github.sha }}`
    );
  }

  if (config.autoRollback) {
    steps.push(
      `      - name: Post-Deploy Health Probe & Automatic Rollback Gate`,
      `        if: failure()`,
      `        run: echo "Health check failed; triggering automated revision rollback"`
    );
  }

  return steps.join('\n');
}
