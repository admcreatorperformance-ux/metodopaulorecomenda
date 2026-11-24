import { Suspense } from "react";
import { Header } from "@/components/header";
import { initials, splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";
import { isDemo } from "@/lib/env";
import Loading from "./loading";

async function AreaShell({ children }: { children: React.ReactNode }) {
  const data = await loadAreaData();
  const { live } = splitLives(data.lives);
  return (
    <>
      <Header name={data.viewer.fullName} initials={initials(data.viewer.fullName)} liveNow={Boolean(live)} demo={isDemo} />
      <main>{children}</main>
      {isDemo && <span className="demo-flag">MODO DEMO</span>}
    </>
  );
}

export default function AreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <AreaShell>{children}</AreaShell>
    </Suspense>
  );
}
