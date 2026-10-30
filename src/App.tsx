import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Code2,
  Compass,
  FolderGit2,
  GitFork,
  Layers,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  Sun,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { INITIAL_STUDIO_APPS } from './data/starterApps';
import type {
  ActiveSection,
  AppCategory,
  CreateAppInput,
  ModelConfig,
  SortOption,
  StudioApp,
} from './types/studio';
import {
  buildCustomStudioApp,
  createForkedApp,
  filterAndSortApps,
} from './utils/studioLogic';
import { AppArtwork } from './components/AppArtwork';
import { WorkbenchModal } from './components/WorkbenchModal';
import { CreateAppModal } from './components/CreateAppModal';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { DeploymentPipelineView } from './components/DeploymentPipelineView';

const CATEGORIES: AppCategory[] = [
  'All',
  'Spatial & Vision',
  'Multimodal Live',
  'Code & Next.js',
  'Audio & Speech',
  'Grounding & Data',
];

export default function App() {
  const [apps, setApps] = useState<StudioApp[]>(INITIAL_STUDIO_APPS);
  const [activeSection, setActiveSection] = useState<ActiveSection>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [savedAppIds, setSavedAppIds] = useState<string[]>([
    'spatial-understanding-3d',
    'prompt-to-nextjs-architect',
  ]);
  const [activeWorkbenchAppId, setActiveWorkbenchAppId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [heroPromptDraft, setHeroPromptDraft] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showTransientStatus = (message: string) => {
    setStatusBanner(message);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const filteredGalleryApps = useMemo(
    () =>
      filterAndSortApps(apps, {
        category: selectedCategory,
        searchQuery,
        sortBy,
      }),
    [apps, selectedCategory, searchQuery, sortBy]
  );

  const workspaceApps = useMemo(
    () => apps.filter((app) => app.isCustom || savedAppIds.includes(app.id)),
    [apps, savedAppIds]
  );

  const activeWorkbenchApp = useMemo(
    () => apps.find((a) => a.id === activeWorkbenchAppId) ?? null,
    [apps, activeWorkbenchAppId]
  );

  const handleToggleBookmark = (appId: string, appTitle: string) => {
    setSavedAppIds((prev) => {
      const exists = prev.includes(appId);
      if (exists) {
        showTransientStatus(`Removed "${appTitle}" from Workspace bookmarks.`);
        return prev.filter((id) => id !== appId);
      }
      showTransientStatus(`Bookmarked "${appTitle}" to Workspace.`);
      return [...prev, appId];
    });
  };

  const handleForkApp = (sourceApp: StudioApp) => {
    const forked = createForkedApp(sourceApp, apps.length);
    setApps((prev) => [forked, ...prev]);
    setSavedAppIds((prev) => [forked.id, ...prev]);
    setActiveWorkbenchAppId(forked.id);
    showTransientStatus(`Forked "${sourceApp.title}" into Workspace as "${forked.title}".`);
  };

  const handleCreateCustomApp = (input: CreateAppInput) => {
    const created = buildCustomStudioApp(input, apps.length + 1);
    setApps((prev) => [created, ...prev]);
    setSavedAppIds((prev) => [created.id, ...prev]);
    setIsCreateModalOpen(false);
    setHeroPromptDraft('');
    setActiveWorkbenchAppId(created.id);
    showTransientStatus(`Synthesized "${created.title}" with Next.js 15 TypeScript routes.`);
  };

  const handleDeleteCustomApp = (appId: string, appTitle: string) => {
    setApps((prev) => prev.filter((app) => app.id !== appId));
    setSavedAppIds((prev) => prev.filter((id) => id !== appId));
    if (activeWorkbenchAppId === appId) {
      setActiveWorkbenchAppId(null);
    }
    showTransientStatus(`Deleted custom application "${appTitle}".`);
  };

  const handleSaveModelConfig = (appId: string, updatedConfig: ModelConfig) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, defaultConfig: { ...updatedConfig } } : app
      )
    );
    showTransientStatus('Updated model parameters and system instruction contract.');
  };

  const handleHeroQuickSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-950/90">
        {/* Zone 1: Brand Wordmark (single text element) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('gallery');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-white"
        >
          AI Studio Apps
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav
          aria-label="Primary platform navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('gallery');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'gallery'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            Starter Gallery
          </a>
          <a
            href="#workspace"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('workspace');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'workspace'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            Workspace ({workspaceApps.length})
          </a>
          <a
            href="#architecture"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('architecture');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'architecture'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            Architecture
          </a>
          <a
            href="#pipeline"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('pipeline');
            }}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'pipeline'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : ''
            }`}
          >
            CI/CD Pipeline
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="ingredient-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create App</span>
          </button>
        </div>
      </header>

      {/* Workspace Utility Strip & Mobile Navigation */}
      <div className="border-b border-slate-200 bg-slate-100/70 px-6 py-2.5 dark:border-slate-900 dark:bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 md:hidden" role="navigation" aria-label="Mobile view switcher">
            {(
              [
                ['gallery', 'Gallery'],
                ['workspace', `Workspace (${workspaceApps.length})`],
                ['architecture', 'Architecture'],
                ['pipeline', 'CI/CD'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 ${
                  activeSection === key
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>Next.js 15 App Router</span>
            <span aria-hidden="true">·</span>
            <span>@google/genai ^2.4.0</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 AA Verified</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {statusBanner && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300"
              >
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{statusBanner}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsDarkMode((d) => !d)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Surface</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Dark Surface</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {activeSection === 'gallery' && (
          <>
            {/* Hero Section with Prompt-to-App Synthesis Bar */}
            <section
              aria-labelledby="hero-heading"
              className="ingredient-gradient-surface relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 lg:p-10 dark:border-slate-800/90 dark:bg-slate-900/50"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                <div className="space-y-4 lg:col-span-7">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Compass className="h-4 w-4" />
                    <span>Google AI Studio Reference Gallery & Next.js Workbench</span>
                  </div>
                  <h1
                    id="hero-heading"
                    className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.15] dark:text-white"
                    style={{ textWrap: 'balance' }}
                  >
                    Build, inspect, and deploy multimodal Gemini applications in Next.js
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Explore production-ready starter applications powered by Gemini 2.5 Pro, Flash, and Live WebRTC streaming. Inspect strict TypeScript Server Actions, test prompts in the interactive sandbox, or fork directly to your GitHub deployment pipeline.
                  </p>

                  <form
                    onSubmit={handleHeroQuickSynthesize}
                    className="pt-2 flex flex-col gap-3 sm:flex-row"
                  >
                    <label htmlFor="hero-prompt-input" className="sr-only">
                      Describe an AI Studio application to synthesize
                    </label>
                    <div className="relative flex-1">
                      <Terminal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="hero-prompt-input"
                        type="text"
                        value={heroPromptDraft}
                        onChange={(e) => setHeroPromptDraft(e.target.value)}
                        placeholder="Describe a custom Next.js + Gemini app (e.g., 3D CAD Tolerance Inspector)..."
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700/90 dark:bg-slate-950/90 dark:text-slate-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="ingredient-gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95 whitespace-nowrap shrink-0"
                    >
                      <Code2 className="h-4 w-4" />
                      <span>Synthesize Next.js App</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Featured Spotlight Preview Card */}
                <div className="lg:col-span-5">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <AppArtwork variant="spatial" className="h-40 w-full" />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Featured Reference Architecture</span>
                        <span className="font-mono tabular-nums">gemini-2.5-pro · 640 ms</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Spatial Understanding 3D & Volumetric Bounding
                      </h2>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        Extract normalized 2D bounding coordinates and 3D oriented bounding volumes with interactive Three.js camera projection.
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveWorkbenchAppId('spatial-understanding-3d')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Launch Interactive Sandbox</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const spatial = apps.find((a) => a.id === 'spatial-understanding-3d');
                            if (spatial) handleForkApp(spatial);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          aria-label="Fork Spatial Understanding 3D"
                        >
                          <GitFork className="h-3.5 w-3.5" />
                          <span>Fork</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Filter, Search & Sort Controls */}
            <section aria-label="Starter applications catalog controls" className="space-y-6">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-center">
                {/* Interactive Segmented Category Filter Tabs */}
                <div
                  className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-900"
                  role="tablist"
                  aria-label="Filter applications by domain category"
                >
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === category
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <label htmlFor="catalog-search-input" className="sr-only">
                      Search starter applications
                    </label>
                    <input
                      id="catalog-search-input"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by capability, model, or stack..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Clear search query"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="catalog-sort-select"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
                    >
                      Sort:
                    </label>
                    <select
                      id="catalog-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="featured">Featured Architecture</option>
                      <option value="latency">Lowest Latency (ms)</option>
                      <option value="complexity">Complexity Tier</option>
                      <option value="alphabetical">Alphabetical (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Starter Apps Grid */}
              {filteredGalleryApps.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <Layers className="mx-auto h-8 w-8 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                    No matching AI Studio applications found
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-600 dark:text-slate-400">
                    No applications matched the category "{selectedCategory}" and search filter "{searchQuery}". Reset filters or synthesize a custom application.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                        setSortBy('featured');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="ingredient-gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Synthesize Custom App</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGalleryApps.map((app) => {
                    const isSaved = savedAppIds.includes(app.id);
                    return (
                      <article
                        key={app.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-indigo-500/60 dark:border-slate-800/90 dark:bg-slate-900/50 dark:hover:border-indigo-500/50"
                      >
                        <div>
                          <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                            <AppArtwork variant={app.artworkVariant} className="h-full w-full" />
                          </div>

                          <div className="p-5">
                            {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <span>{app.category}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{app.avgLatencyMs} ms</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{app.defaultConfig.modelId}</span>
                            </div>

                            <h3 className="mt-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                              {app.title}
                            </h3>

                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                              {app.subtitle}. {app.description}
                            </p>

                            {/* Unboxed Technical Capabilities */}
                            <div className="mt-3.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {app.capabilities.join(' / ')}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer Using Iconic Controls */}
                        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-5 py-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                          <button
                            type="button"
                            onClick={() => setActiveWorkbenchAppId(app.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap shrink-0"
                            aria-label={`Open ${app.title} in Studio Workbench`}
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Open Workbench</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveWorkbenchAppId(app.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                              aria-label={`Inspect Next.js source code for ${app.title}`}
                              title="Inspect Next.js Source"
                            >
                              <Code2 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleForkApp(app)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                              aria-label={`Fork ${app.title} to Workspace`}
                              title="Fork to Workspace"
                            >
                              <GitFork className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(app.id, app.title)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                isSaved
                                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
                                  : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                              }`}
                              aria-label={
                                isSaved
                                  ? `Remove ${app.title} from Workspace bookmarks`
                                  : `Bookmark ${app.title} to Workspace`
                              }
                              title={isSaved ? 'Bookmarked in Workspace' : 'Bookmark App'}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>

                            {app.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomApp(app.id, app.title)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10"
                                aria-label={`Delete custom app ${app.title}`}
                                title="Delete Custom App"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeSection === 'workspace' && (
          <section aria-labelledby="workspace-heading" className="space-y-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Custom Synthesized & Forked Applications
                </p>
                <h2
                  id="workspace-heading"
                  className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Engineering Workspace ({workspaceApps.length})
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  Manage your forked starter applications, custom prompt-synthesized Next.js modules, and tuned model parameter contracts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('pipeline')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FolderGit2 className="h-4 w-4 text-indigo-500" />
                  <span>Configure GitHub Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="ingredient-gradient-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Synthesize New App</span>
                </button>
              </div>
            </div>

            {workspaceApps.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
                <FolderGit2 className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  Your Engineering Workspace is empty
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-600 dark:text-slate-400">
                  Fork a reference starter app from the gallery or synthesize a custom Next.js application to manage it here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('gallery')}
                  className="ingredient-gradient-primary mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                >
                  <span>Browse Starter Gallery</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workspaceApps.map((app) => (
                  <article
                    key={app.id}
                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div>
                      <AppArtwork variant={app.artworkVariant} className="h-36 w-full" />
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{app.isCustom ? 'Custom Workspace Fork' : 'Bookmarked Reference'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{app.defaultConfig.modelId}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Temp {app.defaultConfig.temperature.toFixed(2)}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                          {app.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {app.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                      <button
                        type="button"
                        onClick={() => setActiveWorkbenchAppId(app.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Configure & Run</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(app.id, app.title)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400"
                          aria-label={`Remove ${app.title} from Workspace`}
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        {app.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomApp(app.id, app.title)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10"
                            aria-label={`Delete ${app.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'architecture' && <ArchitectureDocsView />}

        {activeSection === 'pipeline' && <DeploymentPipelineView />}
      </main>

      {/* Quiet Enterprise Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white px-6 py-8 text-xs text-slate-500 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              AI Studio Apps
            </span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Enterprise Next.js 15 & TypeScript Reference Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('gallery');
              }}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Starter Gallery
            </a>
            <a
              href="#workspace"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('workspace');
              }}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Workspace
            </a>
            <a
              href="#architecture"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('architecture');
              }}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Architecture & Security Docs
            </a>
            <a
              href="#pipeline"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('pipeline');
              }}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              GitHub CI/CD Pipeline
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Workbench Modal */}
      {activeWorkbenchApp && (
        <WorkbenchModal
          app={activeWorkbenchApp}
          onClose={() => setActiveWorkbenchAppId(null)}
          onForkApp={handleForkApp}
          onSaveConfig={handleSaveModelConfig}
        />
      )}

      {/* Validated Create Custom App Modal */}
      {isCreateModalOpen && (
        <CreateAppModal
          initialPrompt={heroPromptDraft}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateApp={handleCreateCustomApp}
        />
      )}
    </div>
  );
}
