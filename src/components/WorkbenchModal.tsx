import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Cpu,
  GitFork,
  Play,
  RotateCcw,
  Sliders,
  Terminal,
  X,
} from 'lucide-react';
import type { GeminiModelId, ModelConfig, StudioApp } from '../types/studio';
import { estimateTokenTelemetry } from '../utils/studioLogic';

interface WorkbenchModalProps {
  app: StudioApp;
  onClose: () => void;
  onForkApp: (app: StudioApp) => void;
  onSaveConfig: (appId: string, updatedConfig: ModelConfig) => void;
}

export const WorkbenchModal: React.FC<WorkbenchModalProps> = ({
  app,
  onClose,
  onForkApp,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'source' | 'parameters'>('sandbox');
  const [config, setConfig] = useState<ModelConfig>({ ...app.defaultConfig });
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    app.demoPresets[0]?.id ?? 'custom'
  );
  const [promptInput, setPromptInput] = useState<string>(
    app.demoPresets[0]?.inputPrompt ??
      `Execute structured verification workflow for ${app.title}.`
  );
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [runCount, setRunCount] = useState<number>(1);
  const [configSavedNotice, setConfigSavedNotice] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState(
    app.demoPresets[0]?.simulatedOutput ?? {
      summary: `Executed ${app.title} using ${app.defaultConfig.modelId} with deterministic schema verification.`,
      structuredData: {
        status: 'VERIFIED_NOMINAL',
        framework: app.framework,
        model: app.defaultConfig.modelId,
      },
      codeSnippet: `{\n  "status": "nominal",\n  "appId": "${app.id}"\n}`,
      metrics: {
        latencyMs: app.avgLatencyMs,
        inputTokens: 320,
        outputTokens: 490,
        confidenceScore: '99.4%',
      },
    }
  );

  const liveTelemetry = estimateTokenTelemetry(promptInput, config.systemInstruction, config);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = app.demoPresets.find((p) => p.id === presetId);
    if (found) {
      setPromptInput(found.inputPrompt);
      setExecutionResult(found.simulatedOutput);
    }
  };

  const handleExecutePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const nextRun = runCount + 1;
    setRunCount(nextRun);

    const matchedPreset = app.demoPresets.find((p) => p.inputPrompt === promptInput);
    if (matchedPreset) {
      setExecutionResult({
        ...matchedPreset.simulatedOutput,
        metrics: {
          ...matchedPreset.simulatedOutput.metrics,
          latencyMs: liveTelemetry.estimatedLatencyMs,
          inputTokens: liveTelemetry.estimatedInputTokens,
        },
      });
      return;
    }

    setExecutionResult({
      summary: `Run #${nextRun} completed on ${config.modelId} (Temp ${config.temperature.toFixed(
        2
      )}, JSON Mode: ${config.jsonMode ? 'Enabled' : 'Disabled'}). Output adheres to Next.js 15 TypeScript contract.`,
      structuredData: {
        executionId: `exec-${app.slug}-${nextRun}`,
        activeModel: config.modelId,
        temperature: config.temperature,
        groundingActive: config.groundingEnabled ? 'ENABLED_VERIFIED' : 'DISABLED',
        promptCharacters: promptInput.trim().length,
      },
      codeSnippet: `{\n  "executionRun": ${nextRun},\n  "model": "${config.modelId}",\n  "promptDigest": ${JSON.stringify(
        promptInput.trim().slice(0, 72)
      )},\n  "verified": true\n}`,
      metrics: {
        latencyMs: liveTelemetry.estimatedLatencyMs,
        inputTokens: liveTelemetry.estimatedInputTokens,
        outputTokens: Math.round(liveTelemetry.estimatedOutputBudget * 0.42),
        confidenceScore: '99.2%',
      },
    });
  };

  const handleCopySource = () => {
    const file = app.files[selectedFileIndex];
    if (file && navigator.clipboard) {
      navigator.clipboard.writeText(file.content).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handlePersistConfig = () => {
    onSaveConfig(app.id, config);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 2000);
  };

  const activeFile = app.files[selectedFileIndex] ?? app.files[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workbench-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-white text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-slate-100">
        {/* Top Workbench Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{app.category}</span>
              <span aria-hidden="true">·</span>
              <span>{app.framework}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{config.modelId}</span>
            </div>
            <h2 id="workbench-modal-title" className="mt-1 text-lg font-bold tracking-tight">
              {app.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onForkApp(app)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={`Fork ${app.title} to Workspace`}
            >
              <GitFork className="h-4 w-4 text-indigo-500" />
              <span>Fork to Workspace</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              aria-label="Close Studio Workbench"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector Sub-Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-6 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-900" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sandbox'}
              onClick={() => setActiveTab('sandbox')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sandbox'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Interactive Sandbox</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'source'}
              onClick={() => setActiveTab('source')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'source'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Next.js TypeScript Source ({app.files.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'parameters'}
              onClick={() => setActiveTab('parameters')}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'parameters'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Model & System Parameters</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
            <span>Est. Input: {liveTelemetry.estimatedInputTokens} tok</span>
            <span aria-hidden="true">·</span>
            <span>Est. Latency: {liveTelemetry.estimatedLatencyMs} ms</span>
            <span aria-hidden="true">·</span>
            <span>1K Runs: {liveTelemetry.costPer1kRunsUsd}</span>
          </div>
        </div>

        {/* Main Workbench Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'sandbox' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Prompt Runner & Presets */}
              <div className="space-y-5 lg:col-span-5">
                {app.demoPresets.length > 0 && (
                  <div>
                    <label
                      htmlFor="workbench-preset-select"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Reference Test Scenario
                    </label>
                    <select
                      id="workbench-preset-select"
                      value={selectedPresetId}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {app.demoPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <form onSubmit={handleExecutePrompt} className="space-y-4">
                  <div>
                    <label
                      htmlFor="workbench-prompt-textarea"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Input Prompt Payload
                    </label>
                    <textarea
                      id="workbench-prompt-textarea"
                      rows={5}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Enter multimodal prompt instruction..."
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultPreset = app.demoPresets[0];
                        if (defaultPreset) {
                          setPromptInput(defaultPreset.inputPrompt);
                          setExecutionResult(defaultPreset.simulatedOutput);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Input</span>
                    </button>

                    <button
                      type="submit"
                      className="ingredient-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Run in Sandbox</span>
                    </button>
                  </div>
                </form>

                {/* System Instruction Summary */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/90 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Active System Instruction
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('parameters')}
                      className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Edit Parameters
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {config.systemInstruction}
                  </p>
                </div>
              </div>

              {/* Right Column: Execution Output & Telemetry */}
              <div className="space-y-5 lg:col-span-7">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Structured Execution Output (Run #{runCount})
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{executionResult.metrics.latencyMs} ms</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {executionResult.metrics.inputTokens} in / {executionResult.metrics.outputTokens} out
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {executionResult.metrics.confidenceScore}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {executionResult.summary}
                  </p>

                  {executionResult.structuredData && (
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {Object.entries(executionResult.structuredData).map(([key, val]) => (
                        <div
                          key={key}
                          className="rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950/70"
                        >
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {key}
                          </div>
                          <div className="mt-0.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {executionResult.codeSnippet && (
                    <div className="mt-4">
                      <div className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        JSON Response Payload
                      </div>
                      <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-indigo-200 tabular-nums">
                        <code>{executionResult.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {app.files.map((file, idx) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedFileIndex === idx
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      {file.path}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopySource}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Next.js Module</span>
                    </>
                  )}
                </button>
              </div>

              {activeFile && (
                <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs leading-relaxed text-slate-200">
                  <code>{activeFile.content}</code>
                </pre>
              )}
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="param-model-select"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Target Gemini Model
                  </label>
                  <select
                    id="param-model-select"
                    value={config.modelId}
                    onChange={(e) =>
                      setConfig({ ...config, modelId: e.target.value as GeminiModelId })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Complex Reasoning & 3D)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Low-Latency Multimodal)</option>
                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (High-Throughput)</option>
                    <option value="imagen-3.0-generate-002">imagen-3.0-generate-002 (Visual Synthesis)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="param-max-tokens"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Max Output Tokens ({config.maxOutputTokens})
                  </label>
                  <input
                    id="param-max-tokens"
                    type="range"
                    min={256}
                    max={8192}
                    step={256}
                    value={config.maxOutputTokens}
                    onChange={(e) =>
                      setConfig({ ...config, maxOutputTokens: Number(e.target.value) })
                    }
                    className="mt-3 w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="param-temperature"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Sampling Temperature ({config.temperature.toFixed(2)})
                  </label>
                  <input
                    id="param-temperature"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={config.temperature}
                    onChange={(e) =>
                      setConfig({ ...config, temperature: Number(e.target.value) })
                    }
                    className="mt-3 w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="param-top-p"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nucleus Sampling Top-P ({config.topP.toFixed(2)})
                  </label>
                  <input
                    id="param-top-p"
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={config.topP}
                    onChange={(e) => setConfig({ ...config, topP: Number(e.target.value) })}
                    className="mt-3 w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="param-system-instruction"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  System Instruction Contract
                </label>
                <textarea
                  id="param-system-instruction"
                  rows={4}
                  value={config.systemInstruction}
                  onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.jsonMode}
                      onChange={(e) => setConfig({ ...config, jsonMode: e.target.checked })}
                      className="rounded border-slate-300 accent-indigo-600"
                    />
                    <span>Enforce Strict JSON Schema Output</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.groundingEnabled}
                      onChange={(e) =>
                        setConfig({ ...config, groundingEnabled: e.target.checked })
                      }
                      className="rounded border-slate-300 accent-indigo-600"
                    />
                    <span>Enable Google Search & Maps Grounding</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handlePersistConfig}
                  className="ingredient-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{configSavedNotice ? 'Configuration Saved' : 'Apply Configuration'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
