import { LivePanel } from "@/components/live-panel";
import { splitLives } from "@/lib/course";
import { loadAreaData } from "@/lib/data";

export const metadata = { title: "Ao vivo | Método Paulo Recomenda" };

export default async function AoVivoPage() {
  const data = await loadAreaData();
  const { live, upcoming } = splitLives(data.lives);
  return (
    <div className="container page-pad">
      <h1 className="page-title">
        Lives e <span className="accent-pink">mentorias</span>
      </h1>
      <p className="page-lead">Ative o lembrete das lives que você não quer perder.</p>
      <div style={{ maxWidth: 520, marginTop: 32 }}>
        <LivePanel live={live} upcoming={upcoming.slice(0, 20)} reminders={data.reminders} />
      </div>
    </div>
  );
}
