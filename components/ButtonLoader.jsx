'use client';

export default function ButtonLoader({ isLoading, children, disabled, ...props }) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`flex items-center justify-center gap-2 transition-all ${
        isLoading ? 'opacity-80 cursor-not-allowed' : ''
      } ${props.className || ''}`}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {isLoading ? props.loadingText || 'Loading...' : children}
    </button>
  );
}
