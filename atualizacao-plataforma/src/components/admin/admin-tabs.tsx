"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TABS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/modulos", label: "Módulos e aulas" },
  { href: "/admin/lives", label: "Lives" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export function AdminTabs() {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  // No celular, deixa a aba atual visível na barra que rola para o lado.
  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);
  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href) || (href === "/admin/modulos" && pathname.startsWith("/admin/aulas"));
  return (
    <nav ref={nav} className="admin-tabs" aria-label="Painel admin">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
