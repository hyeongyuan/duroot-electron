interface EmptyProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Empty({ title, description, actionLabel, onAction }: EmptyProps) {
  return (
    <div className="px-6 py-20 text-center">
      <p className="text-[#c9d1d9] text-sm font-medium">
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-[#768390] text-xs leading-5">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 h-8 rounded-md border border-[#444c56] bg-[#2d333b] px-3 text-xs text-[#c9d1d9] hover:bg-[#373e47] cursor-pointer"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
