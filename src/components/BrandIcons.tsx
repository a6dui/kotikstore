import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const OpenAIIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3428 7.897a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3428 7.897zm16.599-1.8021l-4.7783 2.763a.7712.7712 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.0757.0757 0 0 1-.038-.052V9.575a4.4945 4.4945 0 0 1 7.229-3.48zm2.716 9.4795a4.4992 4.4992 0 0 1-2.3703 1.9728v-5.6749a.7854.7854 0 0 0-.3879-.6813L13.085 8.4367l2.0201-1.1686a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1 .6506 4.782zM15.421 11.238L9.5782 7.8695l2.0201-1.1686a.0757.0757 0 0 1 .071 0l4.8303 2.7866a4.4755 4.4755 0 0 1 1.8315 2.1481v-.4732l-2.909-1.9244zm-7.986 4.6548l-2.02-1.1686a.0757.0757 0 0 1-.038-.0568v-4.72a4.4945 4.4945 0 0 1 4.4945-4.4945 4.4708 4.4708 0 0 1 2.8764 1.0408l-.142.0805-4.783 2.7582a.7948.7948 0 0 0-.3879.6813v5.8791zm1.0838-2.9576l2.909-1.68 2.909 1.68v3.359l-2.909 1.68-2.909-1.68v-3.359z" />
  </svg>
);

export const GeminiIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
      fill="url(#gemini-gradient)"
    />
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC4899" />
        <stop offset="0.35" stopColor="#A855F7" />
        <stop offset="0.7" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
);

export const ClaudeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.41 3.5H6.59C4.88 3.5 3.5 4.88 3.5 6.59v10.82C3.5 19.12 4.88 20.5 6.59 20.5h10.82c1.71 0 3.09-1.38 3.09-3.09V6.59c0-1.71-1.38-3.09-3.09-3.09zm-2.88 12.35l-2.53-4.52-2.53 4.52H7.28l3.66-6.19-3.4-5.46h2.25l2.21 3.79 2.22-3.79h2.24l-3.39 5.46 3.65 6.19h-2.19z" />
  </svg>
);

export const GrokIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const ElevenLabsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
    <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
  </svg>
);

export const CapCutIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.5 7.5L12 2.5L4.5 7.5V16.5L12 21.5L19.5 16.5V7.5ZM12 5.2L17.2 8.7L12 12.2L6.8 8.7L12 5.2ZM6.5 10.5L11 13.5V19.1L6.5 16.1V10.5ZM13 19.1V13.5L17.5 10.5V16.1L13 19.1Z" />
  </svg>
);

export const BrandIconRenderer: React.FC<{ type: string; size?: number; className?: string }> = ({
  type,
  size = 24,
  className = '',
}) => {
  switch (type) {
    case 'chatgpt':
      return <OpenAIIcon size={size} className={className} />;
    case 'gemini':
      return <GeminiIcon size={size} className={className} />;
    case 'claude':
      return <ClaudeIcon size={size} className={className} />;
    case 'grok':
      return <GrokIcon size={size} className={className} />;
    case 'elevenlabs':
      return <ElevenLabsIcon size={size} className={className} />;
    case 'capcut':
      return <CapCutIcon size={size} className={className} />;
    default:
      return null;
  }
};
