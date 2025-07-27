export function IconButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="bg-[#373e47] hover:bg-[#3d444e] border border-[#444c56] p-[4px] rounded"
      onClick={onClick}
    >
      {children}
    </button> 
  );
}
