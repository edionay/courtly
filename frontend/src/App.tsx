import { CourtlyMark } from "./shared/ui/CourtlyMark";

export function App() {
  return (
    <main className="min-h-screen grid place-content-center justify-items-center gap-3 p-6 text-center">
      <CourtlyMark />
      <p className="m-0 text-muted-foreground">Application setup is in progress.</p>
    </main>
  );
}
