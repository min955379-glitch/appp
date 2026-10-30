import React from 'react';
import {
  Activity,
  AudioWaveform,
  Box,
  Code2,
  Cpu,
  Database,
  FileSpreadsheet,
  Film,
  Layers,
  MapPin,
} from 'lucide-react';
import type { StudioApp } from '../types/studio';

interface AppArtworkProps {
  variant: StudioApp['artworkVariant'];
  className?: string;
}

export const AppArtwork: React.FC<AppArtworkProps> = ({ variant, className = '' }) => {
  switch (variant) {
    case 'spatial':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/90 to-sky-950/80 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <defs>
              <linearGradient id="spatialGrid" x1="0" y1="0" x2="400" y2="225" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" stopOpacity="0.6" />
                <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d="M40 185L135 120L355 120L270 185H40Z" stroke="url(#spatialGrid)" strokeWidth="1.5" />
            <rect x="95" y="52" width="110" height="86" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" />
            <rect x="115" y="38" width="110" height="86" stroke="#818CF8" strokeWidth="1.5" />
            <line x1="95" y1="52" x2="115" y2="38" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="205" y1="52" x2="225" y2="38" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="95" y1="138" x2="115" y2="124" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="205" y1="138" x2="225" y2="124" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="165" cy="88" r="4" fill="#38BDF8" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-sky-300/90 tabular-nums">
              3D_BBOX [0.42, 1.18, 0.85]
            </span>
            <Box className="h-5 w-5 text-sky-400" />
          </div>
        </div>
      );

    case 'nextjs-code':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/90 to-indigo-950/85 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <rect x="36" y="28" width="328" height="168" rx="8" stroke="#60A5FA" strokeWidth="1.2" />
            <line x1="36" y1="56" x2="364" y2="56" stroke="#3B82F6" strokeWidth="1" />
            <rect x="56" y="74" width="120" height="10" rx="2" fill="#6366F1" fillOpacity="0.6" />
            <rect x="56" y="94" width="210" height="8" rx="2" fill="#38BDF8" fillOpacity="0.4" />
            <rect x="72" y="112" width="180" height="8" rx="2" fill="#94A3B8" fillOpacity="0.35" />
            <rect x="72" y="130" width="145" height="8" rx="2" fill="#818CF8" fillOpacity="0.5" />
            <rect x="56" y="152" width="90" height="10" rx="2" fill="#34D399" fillOpacity="0.5" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-indigo-300/90 tabular-nums">
              app/api/studio/route.ts
            </span>
            <Code2 className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
      );

    case 'live-audio':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950/85 to-indigo-950/90 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 225" fill="none">
            <path
              d="M20 112 Q 65 40, 110 112 T 200 112 T 290 112 T 380 112"
              stroke="#2DD4BF"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M20 112 Q 65 170, 110 112 T 200 112 T 290 112 T 380 112"
              stroke="#818CF8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
            />
            <circle cx="200" cy="112" r="36" stroke="#2DD4BF" strokeWidth="1.2" strokeOpacity="0.5" />
            <circle cx="200" cy="112" r="64" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-teal-300/90 tabular-nums">
              PCM_24KHZ · 248ms RTT
            </span>
            <Activity className="h-5 w-5 text-teal-400" />
          </div>
        </div>
      );

    case 'video':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950/80 to-blue-950/90 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <rect x="40" y="34" width="320" height="110" rx="6" stroke="#A78BFA" strokeWidth="1.5" />
            <line x1="40" y1="168" x2="360" y2="168" stroke="#60A5FA" strokeWidth="2" />
            <line x1="115" y1="158" x2="115" y2="178" stroke="#38BDF8" strokeWidth="2" />
            <line x1="210" y1="158" x2="210" y2="178" stroke="#A78BFA" strokeWidth="2" />
            <line x1="295" y1="158" x2="295" y2="178" stroke="#34D399" strokeWidth="2" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-violet-300/90 tabular-nums">
              1M_CONTEXT · 30FPS_INDEX
            </span>
            <Film className="h-5 w-5 text-violet-400" />
          </div>
        </div>
      );

    case 'maps-grounding':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950/85 to-emerald-950/75 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <path d="M45 165 C 120 75, 240 155, 345 55" stroke="#34D399" strokeWidth="2" strokeDasharray="5 5" />
            <circle cx="85" cy="135" r="7" fill="#0EA5E9" />
            <circle cx="215" cy="112" r="7" fill="#6366F1" />
            <circle cx="345" cy="55" r="7" fill="#10B981" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-emerald-300/90 tabular-nums">
              1.2494 N, 103.6361 E
            </span>
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      );

    case 'chameleon-ui':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/85 to-cyan-950/85 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <rect x="40" y="32" width="145" height="72" rx="6" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="200" y="32" width="160" height="72" rx="6" stroke="#818CF8" strokeWidth="1.5" />
            <rect x="40" y="118" width="320" height="58" rx="6" stroke="#2DD4BF" strokeWidth="1.5" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-cyan-300/90 tabular-nums">
              WCAG_AAA · 11.4:1
            </span>
            <Layers className="h-5 w-5 text-cyan-400" />
          </div>
        </div>
      );

    case 'schema-extract':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/85 to-slate-900 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <rect x="44" y="32" width="130" height="145" rx="4" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M190 105 L225 105" stroke="#38BDF8" strokeWidth="2" />
            <rect x="240" y="45" width="118" height="120" rx="6" stroke="#38BDF8" strokeWidth="1.5" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-sky-300/90 tabular-nums">
              SCHEMA_STRICT · 100%
            </span>
            <FileSpreadsheet className="h-5 w-5 text-sky-400" />
          </div>
        </div>
      );

    case 'waveform':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/90 to-blue-950/85 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 225" fill="none">
            {[48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((x, idx) => {
              const h = [36, 68, 96, 52, 110, 74, 42, 88, 116, 60, 82, 46, 32][idx % 13];
              const y = (200 - h) / 2;
              return (
                <rect
                  key={x}
                  x={x}
                  y={y}
                  width="10"
                  height={h}
                  rx="3"
                  fill={idx % 2 === 0 ? '#6366F1' : '#38BDF8'}
                  fillOpacity="0.65"
                />
              );
            })}
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-indigo-300/90 tabular-nums">
              DIARIZATION · +22.4dB SNR
            </span>
            <AudioWaveform className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
      );

    case 'code-sandbox':
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/80 to-emerald-950/75 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <polygon points="200,32 330,95 200,158 70,95" stroke="#6366F1" strokeWidth="1.5" fill="none" />
            <polygon points="200,58 300,108 200,158 100,108" stroke="#34D399" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-emerald-300/90 tabular-nums">
              SANDBOX_ISOLATED · 10K_PATHS
            </span>
            <Cpu className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      );

    case 'telemetry':
    default:
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/85 to-cyan-950/80 ${className}`}
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 400 225" fill="none">
            <polyline
              points="35,155 95,140 155,148 210,65 265,125 320,118 365,90"
              stroke="#38BDF8"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="210" cy="65" r="5" fill="#F59E0B" />
          </svg>
          <div className="relative z-10 flex h-full items-end justify-between p-4">
            <span className="font-mono text-[11px] tracking-tight text-sky-300/90 tabular-nums">
              OTEL_TRACE · P99_9.8MS
            </span>
            <Database className="h-5 w-5 text-sky-400" />
          </div>
        </div>
      );
  }
};
