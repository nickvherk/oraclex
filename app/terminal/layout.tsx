import { AuthenticatedTerminal } from "@/components/terminal/authenticated-terminal";

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedTerminal>{children}</AuthenticatedTerminal>;
}
