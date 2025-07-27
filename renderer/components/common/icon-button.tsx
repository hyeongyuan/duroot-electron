interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  tooltip?: string;
}

export function IconButton({ onClick, children, tooltip }: IconButtonProps) {
  return (
    <div
      className={`${tooltip ? 'tooltip' : ''} before:bg-[#373e47] before:text-xs after:bg-[#373e47]'} tooltip-bottom`}
      data-tip={tooltip}
    >
      <button
        className="bg-[#373e47] hover:bg-[#3d444e] border border-[#444c56] p-[4px] rounded"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
