interface SpinnerProps {
  /** 'sm' = 16px, 'md' = 24px (default), 'lg' = 40px, 'page' = full viewport */
  size?: 'sm' | 'md' | 'lg' | 'page';
  label?: string;
}

const sizeMap = {
  sm:   'w-4 h-4 border-2',
  md:   'w-6 h-6 border-2',
  lg:   'w-10 h-10 border-[3px]',
  page: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({ size = 'md', label }: SpinnerProps) {
  const spinnerEl = (
    <span
      role="status"
      aria-label={label ?? 'Loading…'}
      className={`
        inline-block rounded-full border-solid
        border-blue-200 border-t-blue-600
        animate-spin shrink-0
        ${sizeMap[size]}
      `}
    />
  );

  if (size === 'page') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
        {spinnerEl}
        {label && (
          <p className="text-sm font-medium text-slate-500">{label}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {spinnerEl}
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}
