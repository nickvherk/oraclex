export function OracleXLogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${className}`}>
      <img
        src="/oraclex-logo.png"
        alt="OracleX logo"
        className="block size-full object-contain"
      />
    </span>
  );
}
