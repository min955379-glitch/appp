import React, { useState } from 'react';
import { AlertCircle, Code2, Plus, X } from 'lucide-react';
import type { AppCategory, CreateAppInput, GeminiModelId } from '../types/studio';
import { validateCreateAppInput } from '../utils/studioLogic';

interface CreateAppModalProps {
  initialPrompt?: string;
  onClose: () => void;
  onCreateApp: (input: CreateAppInput) => void;
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({
  initialPrompt = '',
  onClose,
  onCreateApp,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [promptSpec, setPromptSpec] = useState(initialPrompt);
  const [category, setCategory] = useState<Exclude<AppCategory, 'All'>>('Code & Next.js');
  const [modelId, setModelId] = useState<GeminiModelId>('gemini-2.5-pro');
  const [framework, setFramework] = useState<CreateAppInput['framework']>('Next.js 15 App Router');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateAppInput = {
      title,
      subtitle,
      promptSpec,
      category,
      modelId,
      framework,
    };
    const validation = validateCreateAppInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onCreateApp(input);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-app-modal-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-indigo-500" />
            <h2 id="create-app-modal-title" className="text-base font-bold tracking-tight">
              Synthesize New AI Studio Application
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            aria-label="Close synthesis modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6" noValidate>
          <div>
            <label
              htmlFor="create-app-title"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Application Title
            </label>
            <input
              id="create-app-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enterprise Contract Clause Inspector"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-app-subtitle"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Architectural Summary
            </label>
            <input
              id="create-app-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Automated legal obligation extraction with strict TypeScript schemas"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.subtitle && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.subtitle}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="create-app-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Domain Category
              </label>
              <select
                id="create-app-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<AppCategory, 'All'>)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Code & Next.js">Code & Next.js</option>
                <option value="Spatial & Vision">Spatial & Vision</option>
                <option value="Multimodal Live">Multimodal Live</option>
                <option value="Audio & Speech">Audio & Speech</option>
                <option value="Grounding & Data">Grounding & Data</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="create-app-model"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Primary Model
              </label>
              <select
                id="create-app-model"
                value={modelId}
                onChange={(e) => setModelId(e.target.value as GeminiModelId)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                <option value="imagen-3.0-generate-002">imagen-3.0-generate-002</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="create-app-framework"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Target Stack
              </label>
              <select
                id="create-app-framework"
                value={framework}
                onChange={(e) =>
                  setFramework(e.target.value as CreateAppInput['framework'])
                }
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Next.js 15 App Router">Next.js 15 App Router</option>
                <option value="Next.js 15 + WebRTC">Next.js 15 + WebRTC</option>
                <option value="Next.js 15 + Three.js">Next.js 15 + Three.js</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="create-app-prompt"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              System Prompt & Functional Specification
            </label>
            <textarea
              id="create-app-prompt"
              rows={4}
              value={promptSpec}
              onChange={(e) => setPromptSpec(e.target.value)}
              placeholder="Describe the exact inputs, JSON response schema, Next.js server route behavior, and latency constraints..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.promptSpec && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.promptSpec}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ingredient-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              <span>Compile & Launch App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
