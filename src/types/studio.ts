export type AppCategory =
  | 'All'
  | 'Spatial & Vision'
  | 'Multimodal Live'
  | 'Code & Next.js'
  | 'Audio & Speech'
  | 'Grounding & Data';

export type SortOption = 'featured' | 'latency' | 'complexity' | 'alphabetical';

export type ActiveSection = 'gallery' | 'workspace' | 'Workbench' | 'architecture' | 'pipeline';

export type GeminiModelId =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'imagen-3.0-generate-002';

export interface CodeFile {
  path: string;
  language: 'typescript' | 'tsx' | 'css' | 'json' | 'yaml';
  content: string;
}

export interface DemoPreset {
  id: string;
  label: string;
  inputPrompt: string;
  simulatedOutput: {
    summary: string;
    structuredData?: Record<string, string | number | string[]>;
    codeSnippet?: string;
    metrics: {
      latencyMs: number;
      inputTokens: number;
      outputTokens: number;
      confidenceScore: string;
    };
  };
}

export interface ModelConfig {
  modelId: GeminiModelId;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  systemInstruction: string;
  jsonMode: boolean;
  groundingEnabled: boolean;
}

export interface StudioApp {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<AppCategory, 'All'>;
  artworkVariant:
    | 'spatial'
    | 'video'
    | 'live-audio'
    | 'nextjs-code'
    | 'maps-grounding'
    | 'chameleon-ui'
    | 'schema-extract'
    | 'code-sandbox'
    | 'waveform'
    | 'telemetry';
  featured?: boolean;
  isCustom?: boolean;
  forkedFromId?: string;
  createdAt: string;
  author: string;
  sdkVersion: string;
  framework: 'Next.js 15 App Router' | 'Next.js 15 + WebRTC' | 'Next.js 15 + Three.js';
  avgLatencyMs: number;
  complexityTier: 'Starter' | 'Intermediate' | 'Enterprise';
  capabilities: string[];
  defaultConfig: ModelConfig;
  demoPresets: DemoPreset[];
  files: CodeFile[];
}

export interface CreateAppInput {
  title: string;
  subtitle: string;
  promptSpec: string;
  category: Exclude<AppCategory, 'All'>;
  modelId: GeminiModelId;
  framework: 'Next.js 15 App Router' | 'Next.js 15 + WebRTC' | 'Next.js 15 + Three.js';
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface PipelineConfig {
  repositoryUrl: string;
  branch: string;
  targetPlatform: 'google-cloud-run' | 'vercel-edge' | 'docker-kubernetes';
  region: string;
  nodeVersion: '20.x' | '22.x';
  enableTypecheck: boolean;
  enableUnitTests: boolean;
  enableSecurityAudit: boolean;
  autoRollback: boolean;
}
