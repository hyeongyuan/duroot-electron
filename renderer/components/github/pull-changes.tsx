interface PullChangesProps {
  additions: number;
  deletions: number;
  className?: string;
}

export function PullChanges({ additions, deletions, className = '' }: PullChangesProps) {
  return (
    <div className={`flex items-center gap-1 text-[11px] font-semibold tabular-nums ${className}`.trim()}>
      <span className="text-[#3fb950]">+{additions}</span>
      <span className="text-[#f85149]">-{deletions}</span>
    </div>
  );
}
