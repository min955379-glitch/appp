import type { StudioApp } from '../types/studio';

export const INITIAL_STUDIO_APPS: StudioApp[] = [
  {
    id: 'spatial-understanding-3d',
    slug: 'spatial-understanding-3d',
    title: 'Spatial Understanding 3D',
    subtitle: '2D & 3D bounding box coordinate detection, depth segmentation, and volumetric labeling',
    description:
      'Interactive computer vision workbench that extracts normalized 2D bounding boxes, 3D oriented bounding volumes, and spatial relationships from complex indoor and industrial scenes using Gemini 2.5 Pro.',
    category: 'Spatial & Vision',
    artworkVariant: 'spatial',
    featured: true,
    createdAt: '2026-10-18',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 + Three.js',
    avgLatencyMs: 640,
    complexityTier: 'Intermediate',
    capabilities: ['3D Oriented Boxes', 'Segmentation Masks', 'Coordinate Normalization', 'Three.js Viewport'],
    defaultConfig: {
      modelId: 'gemini-2.5-pro',
      temperature: 0.15,
      topP: 0.85,
      maxOutputTokens: 2048,
      systemInstruction:
        'Detect all primary structural objects in the scene. Return JSON containing label, box_2d [ymin, xmin, ymax, xmax] normalized 0-1000, and box_3d [x_center, y_center, z_center, x_size, y_size, z_size, roll, pitch, yaw] in meters.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'spatial-robotics-bay',
        label: 'Robotic Assembly Workcell Inspection',
        inputPrompt:
          'Detect robotic manipulators, conveyor pallets, and optical safety barriers with 3D bounding coordinates and clearance distances.',
        simulatedOutput: {
          summary:
            'Identified 4 volumetric assets in the workcell. Minimum safety clearance between 6-axis manipulator arm and optical barrier is 1.42m (within ISO 10218 nominal threshold).',
          structuredData: {
            detectedObjects: 4,
            primaryAsset: 'KUKA_6AXIS_ARM [0.42, 1.18, 0.85, 0.65, 0.65, 1.40, 0, 12, -45]',
            conveyorPallet: 'PALLET_BAY_A [-0.80, 1.45, 0.22, 1.20, 0.80, 0.44, 0, 0, 90]',
            safetyClearanceMeters: '1.42m (NOMINAL)',
            coordinateFrame: 'CAMERA_OPTICAL_Z_FORWARD',
          },
          codeSnippet: `[\n  {\n    "label": "robotic_manipulator_6axis",\n    "box_2d": [142, 210, 780, 595],\n    "box_3d": [0.42, 1.18, 0.85, 0.65, 0.65, 1.40, 0, 12, -45],\n    "confidence": 0.984\n  },\n  {\n    "label": "anodized_pallet_carrier",\n    "box_2d": [520, 615, 890, 920],\n    "box_3d": [-0.80, 1.45, 0.22, 1.20, 0.80, 0.44, 0, 0, 90],\n    "confidence": 0.961\n  }\n]`,
          metrics: {
            latencyMs: 632,
            inputTokens: 1248,
            outputTokens: 384,
            confidenceScore: '98.4%',
          },
        },
      },
      {
        id: 'spatial-architectural-lidar',
        label: 'Architectural Floorplan Volumetric Parse',
        inputPrompt:
          'Extract structural load-bearing columns, HVAC trunk clearances, and glazing spans with metric 3D bounds.',
        simulatedOutput: {
          summary:
            'Parsed 6 structural vectors across 140 sq.m floorplate. Overhead HVAC ducting maintains 3.15m vertical datum clearance.',
          structuredData: {
            detectedObjects: 6,
            loadBearingColumns: '4 Reinforced Concrete Pillars (0.60m x 0.60m)',
            hvacClearanceDatum: '3.15m Vertical Span',
            glazingCurtainWall: '14.8m Continuous North Elevation',
          },
          codeSnippet: `[\n  {\n    "label": "structural_column_rc01",\n    "box_3d": [-4.20, 3.10, 1.80, 0.60, 0.60, 3.60, 0, 0, 0],\n    "load_class": "PRIMARY_AXIAL"\n  }\n]`,
          metrics: {
            latencyMs: 658,
            inputTokens: 1420,
            outputTokens: 412,
            confidenceScore: '97.9%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/spatial/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { imageBase64, prompt } = await req.json();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      prompt,
    ],
    config: {
      temperature: 0.15,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            box_3d: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          },
          required: ['label', 'box_2d', 'box_3d'],
        },
      },
    },
  });

  return NextResponse.json({ detections: JSON.parse(response.text ?? '[]') });
}`,
      },
      {
        path: 'components/SpatialViewport.tsx',
        language: 'tsx',
        content: `'use client';

import React from 'react';

export interface SpatialDetection {
  label: string;
  box_2d: [number, number, number, number];
  box_3d: [number, number, number, number, number, number, number, number, number];
}

export function SpatialViewport({ detections }: { detections: SpatialDetection[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
        <h3 className="text-sm font-semibold text-slate-200">3D Oriented Bounding Frustum</h3>
        <p className="mt-1 text-xs text-slate-400">Normalized [0, 1000] camera space projection</p>
      </div>
    </div>
  );
}`,
      },
    ],
  },
  {
    id: 'prompt-to-nextjs-architect',
    slug: 'prompt-to-nextjs-architect',
    title: 'Prompt-to-Next.js Architect',
    subtitle: 'Full-stack Next.js 15 App Router, Tailwind CSS, and TypeScript component synthesis',
    description:
      'Generates modular, accessible Next.js 15 applications with Server Actions, strict TypeScript interfaces, WCAG AA contrast verification, and automated unit test suites from natural language specifications.',
    category: 'Code & Next.js',
    artworkVariant: 'nextjs-code',
    featured: true,
    createdAt: '2026-10-22',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 740,
    complexityTier: 'Enterprise',
    capabilities: ['Next.js 15 App Router', 'Server Actions', 'Tailwind v4 Tokens', 'WCAG AA Audit'],
    defaultConfig: {
      modelId: 'gemini-2.5-pro',
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 4096,
      systemInstruction:
        'Generate production-grade Next.js 15 App Router TypeScript modules. Enforce WCAG AA 4.5:1 contrast, semantic HTML landmarks, zero inline styles, and strict Zod/TypeScript validation.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'nextjs-fintech-ledger',
        label: 'Synthesize Institutional Treasury Dashboard',
        inputPrompt:
          'Build a Next.js 15 Treasury Liquidity Console with multi-currency settlement tables, tabular numerals, and server-side rate locking.',
        simulatedOutput: {
          summary:
            'Synthesized 4 Next.js 15 App Router files (`app/page.tsx`, `app/actions/settlement.ts`, `components/LiquidityGrid.tsx`, `lib/schema.ts`) with zero TypeScript errors and 100% WCAG AA contrast compliance.',
          structuredData: {
            generatedFilesCount: 4,
            frameworkTarget: 'Next.js 15.2 App Router (React 19)',
            accessibilityScore: '100 / 100 WCAG AA Verified',
            bundleFootprintGzip: '41.8 kB First Load JS',
          },
          codeSnippet: `export async function lockFxSettlementRate(pair: string, notionalUsd: number) {\n  'use server';\n  if (notionalUsd <= 0) throw new Error('Invalid notional amount');\n  return { status: 'LOCKED', pair, timestamp: new Date().toISOString() };\n}`,
          metrics: {
            latencyMs: 728,
            inputTokens: 410,
            outputTokens: 1680,
            confidenceScore: '99.6%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/actions/synthesize.ts',
        language: 'typescript',
        content: `'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function synthesizeNextJsModule(specification: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: specification,
    config: {
      systemInstruction: 'Output clean Next.js 15 TypeScript + Tailwind CSS code with strict types.',
      temperature: 0.2,
    },
  });

  return { code: response.text };
}`,
      },
    ],
  },
  {
    id: 'multimodal-live-webrtc',
    slug: 'multimodal-live-webrtc',
    title: 'Multimodal Live Audio & Vision Stream',
    subtitle: 'Bidirectional low-latency WebSocket audio, camera frame streaming, and function calling',
    description:
      'Real-time conversational and visual inspection console built on the Gemini Live API. Supports 24kHz PCM audio output, live screen/camera frame ingestion, and deterministic tool invocation.',
    category: 'Multimodal Live',
    artworkVariant: 'live-audio',
    featured: true,
    createdAt: '2026-10-20',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 + WebRTC',
    avgLatencyMs: 265,
    complexityTier: 'Enterprise',
    capabilities: ['Bidirectional PCM 24kHz', 'Live Frame Streaming', 'Sub-300ms Turn Detection', 'Tool Calling'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 1024,
      systemInstruction:
        'Operate as a real-time engineering diagnostics copilot. Process incoming video frames at 2 FPS alongside continuous PCM audio and invoke telemetry tools when anomalies appear.',
      jsonMode: false,
      groundingEnabled: true,
    },
    demoPresets: [
      {
        id: 'live-pcb-diagnostics',
        label: 'Live PCB Thermal & Solder Joint Inspection',
        inputPrompt:
          'Stream 1080p microscope feed of SMT power regulator rail; flag cold solder bridges and trigger benchtop multimeter probe.',
        simulatedOutput: {
          summary:
            'Detected high-impedance solder bridge across pins 14-15 of U4 Buck Controller at frame #48. Executed tool call `queryBenchMultimeter({ rail: "VDD_3V3" })` returning 2.84V sag.',
          structuredData: {
            streamProtocol: 'WSS_BIDIRECTIONAL_PCM24K',
            firstAudioByteLatency: '248 ms',
            invokedToolCall: 'queryBenchMultimeter({ rail: "VDD_3V3" })',
            anomalyPinpoint: 'IC_U4_PIN_14_15_BRIDGE',
          },
          codeSnippet: `session.sendRealtimeInput({\n  media: { mimeType: 'audio/pcm;rate=16000', data: pcmBase64Chunk }\n});`,
          metrics: {
            latencyMs: 248,
            inputTokens: 890,
            outputTokens: 215,
            confidenceScore: '99.1%',
          },
        },
      },
    ],
    files: [
      {
        path: 'lib/liveSession.ts',
        language: 'typescript',
        content: `import { GoogleGenAI, Modality } from '@google/genai';

export async function connectMultimodalLiveSession(apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });
  const session = await ai.live.connect({
    model: 'gemini-2.5-flash',
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: 'Provide concise real-time engineering diagnostics.',
    },
    callbacks: {
      onopen: () => console.info('Live WebSocket session established'),
      onmessage: (msg) => console.info('Received server frame', msg),
      onerror: (err) => console.error('Session error', err),
      onclose: () => console.info('Session closed'),
    },
  });
  return session;
}`,
      },
    ],
  },
  {
    id: 'video-temporal-analyzer',
    slug: 'video-temporal-analyzer',
    title: 'Video Temporal Frame Analyzer',
    subtitle: 'Long-context video indexing, timestamped event extraction, and Dense Captioning',
    description:
      'Ingests up to 2 hours of high-definition video footage to extract frame-accurate event markers, compliance audit logs, and searchable transcript timelines using Gemini 1M+ token context window.',
    category: 'Spatial & Vision',
    artworkVariant: 'video',
    featured: false,
    createdAt: '2026-10-14',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 580,
    complexityTier: 'Intermediate',
    capabilities: ['1M Token Context', 'Timestamp Grounding', 'Dense Video Captioning', 'CSV/JSON Export'],
    defaultConfig: {
      modelId: 'gemini-2.5-pro',
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 2048,
      systemInstruction:
        'Analyze video streams and output an array of timestamped events in MM:SS.mmm format with actor classification, action summary, and severity level.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'video-cleanroom-audit',
        label: 'Semiconductor Cleanroom Protocol Audit',
        inputPrompt:
          'Scan 45-minute wafer transfer recording for gowning compliance, airlock dwell duration, and FOU-pod handling timestamps.',
        simulatedOutput: {
          summary:
            'Indexed 18 discrete transfer milestones across 45:00.000 timeline. Airlock purge dwell averaged 18.4s (exceeding 15.0s minimum specification). Zero protocol deviations detected.',
          structuredData: {
            videoDuration: '45:00.000 (1080p @ 30fps)',
            indexedEventsCount: 18,
            airlockMeanDwell: '18.4s (COMPLIANT)',
            waferCassetteTransfers: '6 Complete Cycles',
          },
          codeSnippet: `[\n  { "timestamp": "04:12.400", "event": "AIRLOCK_PURGE_COMPLETE", "dwellSeconds": 18.6 },\n  { "timestamp": "11:48.120", "event": "FOUP_DOCK_LOADPORT_02", "status": "NOMINAL" }\n]`,
          metrics: {
            latencyMs: 574,
            inputTokens: 4820,
            outputTokens: 510,
            confidenceScore: '99.2%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/video-index/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { fileUri, mimeType, query } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      { fileData: { fileUri, mimeType } },
      query,
    ],
    config: { responseMimeType: 'application/json' },
  });
  return NextResponse.json({ timeline: JSON.parse(response.text ?? '[]') });
}`,
      },
    ],
  },
  {
    id: 'interactive-maps-grounding',
    slug: 'interactive-maps-grounding',
    title: 'Geospatial & Maps Grounding Explorer',
    subtitle: 'Supply chain routing, facility site selection, and live Google Search & Maps grounding',
    description:
      'Combines Gemini grounded reasoning with geospatial coordinates, verified place citations, and multi-modal logistics telemetry to evaluate regional infrastructure and transit resilience.',
    category: 'Grounding & Data',
    artworkVariant: 'maps-grounding',
    featured: false,
    createdAt: '2026-10-12',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 520,
    complexityTier: 'Intermediate',
    capabilities: ['Google Maps Grounding', 'Search Citations', 'Geospatial Routing', 'ISO Logistics Metrics'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 2048,
      systemInstruction:
        'Ground all facility coordinates, port throughput figures, and transit corridors using Google Search and Google Maps grounding metadata. Always return verified source attributions.',
      jsonMode: true,
      groundingEnabled: true,
    },
    demoPresets: [
      {
        id: 'maps-cold-chain',
        label: 'Cold-Chain Pharmaceutical Hub Triangulation',
        inputPrompt:
          'Evaluate intermodal cold-storage logistics corridors between Singapore Tuas Mega Port and Senai Airport Industrial Park.',
        simulatedOutput: {
          summary:
            'Triangulated 3 redundancy-certified cold-chain corridors with 42-minute mean customs clearance and continuous -20C reefer telemetry coverage.',
          structuredData: {
            originTerminal: 'Tuas Mega Port (1.2494 N, 103.6361 E)',
            destinationHub: 'Senai Cold Logistics Zone (1.6413 N, 103.6696 E)',
            primaryCorridorDistance: '64.8 km via Second Link Expressway',
            groundedCitationsCount: 5,
          },
          codeSnippet: `{\n  "corridor": "TUAS_TO_SENAI_EXPRESS",\n  "distanceKm": 64.8,\n  "reeferPlugAvailability": "99.4%",\n  "groundingChunks": ["maps.google.com/place/Tuas+Port"]\n}`,
          metrics: {
            latencyMs: 512,
            inputTokens: 320,
            outputTokens: 440,
            confidenceScore: '98.8%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/grounding/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { query } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    },
  });

  return NextResponse.json({
    text: response.text,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata,
  });
}`,
      },
    ],
  },
  {
    id: 'chameleon-adaptive-ui',
    slug: 'chameleon-adaptive-ui',
    title: 'Chameleon Adaptive Interface Engine',
    subtitle: 'Context-driven UI layout synthesis with real-time schema binding and design token enforcement',
    description:
      'Dynamically reconfigures data density, chart topologies, and accessibility contrast tokens based on user role, viewport geometry, and live domain payload schemas.',
    category: 'Code & Next.js',
    artworkVariant: 'chameleon-ui',
    featured: false,
    createdAt: '2026-10-10',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 340,
    complexityTier: 'Starter',
    capabilities: ['Dynamic Component Tree', 'Design Token Binding', 'WCAG Contrast Lock', 'Zero-Layout Shift'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.25,
      topP: 0.9,
      maxOutputTokens: 1536,
      systemInstruction:
        'Map incoming telemetry payloads to the optimal Next.js component tree schema while preserving 60-30-10 color balance and tabular-nums alignment.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'chameleon-grid-adaptation',
        label: 'Adapt Grid Density for Incident Command Mode',
        inputPrompt:
          'Switch layout schema from executive summary to high-density SRE incident triage for 12 degraded microservices.',
        simulatedOutput: {
          summary:
            'Rebound viewport to 12-column SRE triage grid (`rowHeight: 36px`, `fontVariantNumeric: tabular-nums`) surfacing P99 latency spikes and error budgets.',
          structuredData: {
            activeLayoutProfile: 'SRE_INCIDENT_HIGH_DENSITY',
            rowHeightPx: 36,
            contrastRatioVerified: '11.4:1 (WCAG AAA)',
            renderCommitTimeMs: '8.2 ms',
          },
          codeSnippet: `{\n  "layoutMode": "SRE_INCIDENT_GRID",\n  "columns": ["service", "p99_ms", "error_rate", "rollback_action"],\n  "tabularNums": true\n}`,
          metrics: {
            latencyMs: 328,
            inputTokens: 210,
            outputTokens: 340,
            confidenceScore: '99.5%',
          },
        },
      },
    ],
    files: [
      {
        path: 'components/AdaptiveSurface.tsx',
        language: 'tsx',
        content: `'use client';

import React from 'react';

export function AdaptiveSurface({ mode, metrics }: { mode: string; metrics: Array<{ label: string; value: string }> }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-sm font-semibold text-slate-100">Adaptive Mode: {mode}</h2>
      </header>
    </section>
  );
}`,
      },
    ],
  },
  {
    id: 'document-schema-extractor',
    slug: 'document-schema-extractor',
    title: 'Document Schema & Ledger Extractor',
    subtitle: 'Zero-shot PDF/invoice table normalization into strict TypeScript & SQL schemas',
    description:
      'Transforms multi-page engineering specifications, bills of materials (BOM), and financial filings into strictly validated JSON payloads with line-item bounding provenance.',
    category: 'Grounding & Data',
    artworkVariant: 'schema-extract',
    featured: false,
    createdAt: '2026-10-08',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 410,
    complexityTier: 'Starter',
    capabilities: ['Strict responseSchema', 'PDF & Table Parsing', 'Provenance Bounding', 'PostgreSQL DDL Export'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.0,
      topP: 0.8,
      maxOutputTokens: 2048,
      systemInstruction:
        'Extract all tabular line items with 100% numeric fidelity. Never hallucinate missing fields; emit explicit null values with confidence flags.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'schema-bom-parse',
        label: 'Normalize Aerospace Avionics Bill of Materials',
        inputPrompt:
          'Extract part numbers, MIL-STD temperature ratings, unit lead times, and unit pricing from 18-page avionics BOM.',
        simulatedOutput: {
          summary:
            'Normalized 142 line items with 100% checksum parity against invoice totals. Generated strict TypeScript interface and Drizzle ORM PostgreSQL migration.',
          structuredData: {
            extractedLineItems: 142,
            checksumReconciliation: '100.0% EXACT_MATCH ($482,910.00)',
            milStdFlaggedParts: '14 Components (-55C to +125C Rated)',
            outputFormat: 'JSON_SCHEMA_DRAFT_2020_12',
          },
          codeSnippet: `{\n  "partNumber": "MIL-PRF-38535-QMLV",\n  "operatingTempRange": "-55C to +125C",\n  "unitCostUsd": 1420.50,\n  "verified": true\n}`,
          metrics: {
            latencyMs: 398,
            inputTokens: 2150,
            outputTokens: 640,
            confidenceScore: '99.9%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/extract/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { documentText } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: documentText,
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalAmountUsd: { type: Type.NUMBER },
          lineItemsCount: { type: Type.INTEGER },
        },
      },
    },
  });
  return NextResponse.json(JSON.parse(response.text ?? '{}'));
}`,
      },
    ],
  },
  {
    id: 'acoustic-waveform-synthesizer',
    slug: 'acoustic-waveform-synthesizer',
    title: 'Acoustic Diarization & Speech Telemetry',
    subtitle: 'Multi-speaker diarization, acoustic sentiment telemetry, and domain lexicon transcription',
    description:
      'High-accuracy audio transcription and speaker turn segmentation engineered for clinical, aviation, and financial compliance recordings with custom terminology boosting.',
    category: 'Audio & Speech',
    artworkVariant: 'waveform',
    featured: false,
    createdAt: '2026-10-06',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 310,
    complexityTier: 'Starter',
    capabilities: ['Speaker Diarization', 'Domain Lexicon Boost', 'Millisecond Timestamps', 'PII Redaction'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash-lite',
      temperature: 0.1,
      topP: 0.85,
      maxOutputTokens: 2048,
      systemInstruction:
        'Transcribe multi-channel audio with speaker diarization tags, millisecond timestamps, and automatic PII redaction for account identifiers.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'audio-atc-telemetry',
        label: 'Aviation Approach Control Comms Transcription',
        inputPrompt:
          'Transcribe dual-channel VHF approach control recording with ICAO callsign extraction and readback verification.',
        simulatedOutput: {
          summary:
            'Diarized 8 speaker turns across 2 VHF channels. Verified 100% altitude and heading readback accuracy for callsign SIA-318.',
          structuredData: {
            speakerTurnsCount: 8,
            identifiedCallsigns: 'SIA-318, QFA-002, TOWER_APPROACH_09L',
            readbackVerification: 'VERIFIED_MATCH (FL040, HDG 090)',
            signalToNoiseDb: '+22.4 dB',
          },
          codeSnippet: `[\n  {\n    "speaker": "TOWER_APPROACH_09L",\n    "startMs": 1240,\n    "endMs": 4890,\n    "transcript": "Singapore Three One Eight, descend and maintain four thousand feet, turn left heading zero nine zero."\n  }\n]`,
          metrics: {
            latencyMs: 295,
            inputTokens: 980,
            outputTokens: 310,
            confidenceScore: '99.3%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/transcribe/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { audioBase64 } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
      'Transcribe with speaker labels and millisecond timestamps in JSON.',
    ],
    config: { responseMimeType: 'application/json' },
  });
  return NextResponse.json({ segments: JSON.parse(response.text ?? '[]') });
}`,
      },
    ],
  },
  {
    id: 'code-execution-sandbox',
    slug: 'code-execution-sandbox',
    title: 'Deterministic Code Execution Sandbox',
    subtitle: 'Algorithmic verification, quantitative financial modeling, and sandboxed computation',
    description:
      'Executes quantitative simulations, Monte Carlo risk models, and cryptographic checksum validations inside an isolated execution environment with step-by-step verification.',
    category: 'Code & Next.js',
    artworkVariant: 'code-sandbox',
    featured: false,
    createdAt: '2026-10-04',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 690,
    complexityTier: 'Enterprise',
    capabilities: ['Sandboxed Execution', 'Quantitative Modeling', 'Deterministic Assertions', 'TypeScript SDK'],
    defaultConfig: {
      modelId: 'gemini-2.5-pro',
      temperature: 0.0,
      topP: 0.9,
      maxOutputTokens: 2048,
      systemInstruction:
        'Write and execute deterministic verification code to solve quantitative problems. Verify edge cases before emitting final numerical results.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'sandbox-portfolio-var',
        label: 'Compute 10,000-Path Monte Carlo Value-at-Risk',
        inputPrompt:
          'Calculate 99% 10-day Conditional Value-at-Risk (CVaR) for a $50M multi-asset treasury portfolio under stressed correlation.',
        simulatedOutput: {
          summary:
            'Executed 10,000 Cholesky-decomposed paths in sandboxed runtime. 99% 10-day CVaR converged at $1,842,190 (3.68% of notional) with standard error +/- $4,120.',
          structuredData: {
            simulationPaths: '10,000 Cholesky Paths',
            var99TenDayUsd: '$1,490,800 (2.98% Notional)',
            cvar99TenDayUsd: '$1,842,190 (3.68% Notional)',
            sandboxRuntimeMs: '184 ms',
          },
          codeSnippet: `// Sandbox Execution Result\nconst var99 = sortedLosses[Math.floor(0.99 * N)]; // 1490800.00\nconst cvar99 = tailLosses.reduce((a, b) => a + b, 0) / tailLosses.length; // 1842190.00`,
          metrics: {
            latencyMs: 682,
            inputTokens: 340,
            outputTokens: 590,
            confidenceScore: '100.0%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/sandbox/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { problemStatement } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: problemStatement,
    config: {
      tools: [{ codeExecution: {} }],
    },
  });
  return NextResponse.json({ output: response.text });
}`,
      },
    ],
  },
  {
    id: 'enterprise-data-telemetry',
    slug: 'enterprise-data-telemetry',
    title: 'Enterprise Telemetry & Anomaly Matrix',
    subtitle: 'High-throughput time-series drift detection, root-cause synthesis, and SLO forecasting',
    description:
      'Correlates distributed OpenTelemetry traces, database query plans, and infrastructure metrics to isolate p99 latency regressions and generate automated remediation pull requests.',
    category: 'Grounding & Data',
    artworkVariant: 'telemetry',
    featured: false,
    createdAt: '2026-10-02',
    author: 'Google AI Studio Reference',
    sdkVersion: '@google/genai ^2.4.0',
    framework: 'Next.js 15 App Router',
    avgLatencyMs: 360,
    complexityTier: 'Enterprise',
    capabilities: ['OpenTelemetry Correlation', 'Root-Cause Synthesis', 'SQL Plan Analysis', 'Automated PR Generation'],
    defaultConfig: {
      modelId: 'gemini-2.5-flash',
      temperature: 0.15,
      topP: 0.85,
      maxOutputTokens: 2048,
      systemInstruction:
        'Analyze OpenTelemetry span waterfalls and PostgreSQL EXPLAIN ANALYZE plans. Pinpoint the exact bottleneck and generate an idempotent remediation migration.',
      jsonMode: true,
      groundingEnabled: false,
    },
    demoPresets: [
      {
        id: 'telemetry-pg-index',
        label: 'Diagnose P99 Checkout Latency Regression',
        inputPrompt:
          'Correlate trace `tr-99481a` (p99 jumped from 42ms to 680ms) with PostgreSQL `orders_ledger` sequential scan telemetry.',
        simulatedOutput: {
          summary:
            'Isolated sequential scan on `orders_ledger (tenant_id, created_at)` costing 618ms per query. Generated concurrent composite B-Tree index migration reducing cost by 98.4%.',
          structuredData: {
            bottleneckSpan: 'postgres.query.orders_ledger (618.4 ms)',
            rootCause: 'MISSING_COMPOSITE_INDEX (tenant_id, created_at DESC)',
            projectedLatencyAfterFix: '9.8 ms (98.4% Reduction)',
            migrationSafety: 'CONCURRENTLY_NON_BLOCKING',
          },
          codeSnippet: `CREATE INDEX CONCURRENTLY idx_orders_ledger_tenant_created\nON public.orders_ledger (tenant_id, created_at DESC)\nWHERE status = 'SETTLED';`,
          metrics: {
            latencyMs: 348,
            inputTokens: 780,
            outputTokens: 420,
            confidenceScore: '99.7%',
          },
        },
      },
    ],
    files: [
      {
        path: 'app/api/telemetry/route.ts',
        language: 'typescript',
        content: `import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  const { spanWaterfall, explainPlan } = await req.json();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: JSON.stringify({ spanWaterfall, explainPlan }),
    config: { responseMimeType: 'application/json' },
  });
  return NextResponse.json(JSON.parse(response.text ?? '{}'));
}`,
      },
    ],
  },
];
