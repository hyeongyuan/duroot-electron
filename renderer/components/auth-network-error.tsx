interface AuthNetworkErrorProps {
  onRetry: () => void;
}

export function AuthNetworkError({ onRetry }: AuthNetworkErrorProps) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="w-full max-w-[280px] text-center">
        <p className="text-sm font-medium text-[#c9d1d9]">
          Network connection issue
        </p>
        <p className="mt-2 text-xs leading-5 text-[#768390] whitespace-pre-line">
          {`We could not verify your GitHub session.\nCheck your network and try again.`}
        </p>
        <button
          type="button"
          className="mt-4 h-8 rounded-md border border-[#444c56] bg-[#2d333b] px-3 text-xs text-[#c9d1d9] hover:bg-[#373e47] cursor-pointer"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
