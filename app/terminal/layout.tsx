import { TerminalShell } from "@/components/terminal/terminal-shell";

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TerminalShell>{children}</TerminalShell>;
}
