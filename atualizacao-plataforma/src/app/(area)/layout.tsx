import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { initials, splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";
import { isDemo } from "@/lib/env";
import { courseCompletion } from "@/lib/extras";
import Loading from "./loading";

async function AreaShell({ children }: { children: React.ReactNode }) {
  const data = await loadAreaData();
  const { live } = splitLives(data.lives);
  const { total, done } = courseCompletion(data);
  return (
    <>
      <AppShell
        name={data.viewer.fullName}
        initials={initials(data.viewer.fullName)}
        avatarUrl={data.viewer.avatarUrl}
        liveNow={Boolean(live)}
        demo={isDemo}
        isAdmin={data.viewer.role === "admin"}
        communityUrl={data.communityUrl}
        coursePercent={total ? Math.round((done / total) * 100) : 0}
      >
        <main>{children}</main>
      </AppShell>
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
