import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCustomStudioApp,
  createForkedApp,
  estimateTokenTelemetry,
  filterAndSortApps,
  generateGitHubWorkflowYaml,
  validateCreateAppInput,
} from './studioLogic';
import type { StudioApp } from '../types/studio';

const sampleApps: StudioApp[] = [
  {
    id: 'app-1',
    slug: 'spatial-3d',
    title: 'Spatial Understanding 3D',
    subtitle: '3D bounding box detection and scene reasoning',
    description: 'Detect 2D and 3D spatial coordinates from camera streams.',
    category: 'Spatial & Vision',
    artworkVariant: 'spatial',
    featured: true,
    createdAt: '2026-10-01',
    author: 'Google AI Studio Team',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 + Three.js',
    avgLatencyMs: 610,
    complexityTier: 'Intermediate',
    capabilities: ['3D Bounding Boxes', 'Depth Estimation'],
    defaultConfig: {
      modelId: 'gemini-2.5-pro',
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 2048,
      systemInstruction: 'Return 3D bounding boxes in normalized coordinates.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [],
    files: [],
  },
  {
    id: 'app-2',
    slug: 'live-audio',
    title: 'Acoustic Stream Analyzer',
    subtitle: 'Low-latency bidirectional PCM audio synthesis',
    description: 'Stream real-time voice and acoustic telemetry over WebSockets.',
    category: 'Audio & Speech',
    artworkVariant: 'waveform',
    featured: false,
    createdAt: '2026-10-05',
    author: 'Google AI Studio Team',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 + WebRTC',
    avgLatencyMs: 280,
    complexityTier: 'Starter',
    capabilities: ['WebRTC Audio', 'Voice Activity Detection'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.4,
      topP: 0.95,
      maxOutputTokens: 1024,
      systemInstruction: 'Analyze incoming audio frames with sub-300ms latency.',
      jsonMode: false,
      groundingEnabled: false,
    },
    demoPresets: [],
    files: [],
  },
];

test('filterAndSortApps filters by category and search query accurately', () => {
  const byCategory = filterAndSortApps(sampleApps, {
    category: 'Audio & Speech',
    searchQuery: '',
    sortBy: 'featured',
  });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'app-2');

  const byQuery = filterAndSortApps(sampleApps, {
    category: 'All',
    searchQuery: 'bounding box',
    sortBy: 'featured',
  });
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'app-1');
});

test('filterAndSortApps sorts by latency and complexity', () => {
  const sortedByLatency = filterAndSortApps(sampleApps, {
    category: 'All',
    searchQuery: '',
    sortBy: 'latency',
  });
  assert.equal(sortedByLatency[0].id, 'app-2');
  assert.equal(sortedByLatency[1].id, 'app-1');

  const sortedByComplexity = filterAndSortApps(sampleApps, {
    category: 'All',
    searchQuery: '',
    sortBy: 'complexity',
  });
  assert.equal(sortedByComplexity[0].complexityTier, 'Starter');
});

test('validateCreateAppInput rejects empty or short inputs and accepts valid spec', () => {
  const invalid = validateCreateAppInput({
    title: 'ab',
    subtitle: 'short',
    promptSpec: 'too short',
    category: 'Code & Next.js',
    modelId: 'gemini-2.5-pro',
    framework: 'Next.js 15 App Router',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.subtitle);
  assert.ok(invalid.errors.promptSpec);

  const valid = validateCreateAppInput({
    title: 'Enterprise Contract Verifier',
    subtitle: 'Automated legal clause extraction with structured JSON schemas',
    promptSpec: 'Extract indemnification, liability caps, and termination clauses into strict JSON.',
    category: 'Grounding & Data',
    modelId: 'gemini-2.5-pro',
    framework: 'Next.js 15 App Router',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('createForkedApp and buildCustomStudioApp produce distinct workspace items', () => {
  const forked = createForkedApp(sampleApps[0], 4);
  assert.equal(forked.isCustom, true);
  assert.equal(forked.forkedFromId, 'app-1');
  assert.ok(forked.title.includes('(Workspace Fork)'));

  const custom = buildCustomStudioApp(
    {
      title: 'Next.js Supply Chain Optimizer',
      subtitle: 'Real-time route anomaly detection',
      promptSpec: 'Analyze logistics telemetry and output optimal rerouting recommendations.',
      category: 'Grounding & Data',
      modelId: 'gemini-2.5-flash',
      framework: 'Next.js 15 App Router',
    },
    5
  );
  assert.equal(custom.isCustom, true);
  assert.equal(custom.files.length, 2);
  assert.equal(custom.defaultConfig.groundingEnabled, true);
});

test('estimateTokenTelemetry and generateGitHubWorkflowYaml return deterministic outputs', () => {
  const telemetry = estimateTokenTelemetry(
    'Analyze this 3D point cloud tensor and return bounding vectors.',
    'You are a spatial vision parser.',
    sampleApps[0].defaultConfig
  );
  assert.ok(telemetry.estimatedInputTokens >= 12);
  assert.ok(telemetry.estimatedLatencyMs > 800);
  assert.ok(telemetry.costPer1kRunsUsd.startsWith('$'));

  const yaml = generateGitHubWorkflowYaml({
    repositoryUrl: 'https://github.com/enterprise-org/aistudio-nextjs-suite',
    branch: 'main',
    targetPlatform: 'google-cloud-run',
    region: 'asia-southeast1',
    nodeVersion: '22.x',
    enableTypecheck: true,
    enableUnitTests: true,
    enableSecurityAudit: true,
    autoRollback: true,
  });
  assert.ok(yaml.includes('deploy-google-cloud-run:'));
  assert.ok(yaml.includes('region: asia-southeast1'));
  assert.ok(yaml.includes('npm audit --audit-level=high'));
});
