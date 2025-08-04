interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

export function IconButton({ onClick, children, tooltip, disabled }: IconButtonProps) {
  return (
    <div
      className="tooltip tooltip-bottom"
      data-tip={tooltip}
    >
      <button
        className="bg-[#373e47] hover:bg-[#3d444e] border border-[#444c56] p-[4px] rounded"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
}
