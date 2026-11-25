import Link from "next/link";
import { notFound } from "next/navigation";
import { Flash, type FlashParams } from "@/components/admin/flash";
import { adminLives } from "@/lib/admin";
import { LiveForm } from "../live-form";

export default async function AdminLive({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  const [{ id }, { ok, erro }, lives] = await Promise.all([params, searchParams, adminLives()]);
  const live = lives.find((l) => l.id === id);
  if (!live) notFound();
  return (
    <>
      <nav className="breadcrumb"><Link href="/admin/lives">Lives</Link> <span>›</span> <span>{live.title}</span></nav>
      <div className="admin-head">
        <h1 className="page-title">{live.title}</h1>
      </div>
      <Flash ok={ok} erro={erro} />
      <div style={{ maxWidth: 640 }}>
        <LiveForm live={live} />
      </div>
    </>
  );
}
