"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/actions";
import { Brand } from "./brand";
import {
  AwardIcon, BellIcon, CloseIcon, FilmIcon, GridIcon, HistoryIcon, HomeIcon, LiveIcon, LogoutIcon, MenuIcon, SearchIcon,
  SettingsIcon, UserIcon, UsersIcon,
} from "./icons";
import { ProgressBar } from "./progress-bar";

type Item = { href: string; label: string; icon: React.ReactNode; external?: boolean; badge?: string };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/modulos") return pathname.startsWith("/modulos") || pathname.startsWith("/aula/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface ShellProps {
  name: string;
  initials: string;
  avatarUrl: string | null;
  liveNow: boolean;
  demo: boolean;
  isAdmin: boolean;
  communityUrl: string | null;
  coursePercent: number;
  children: React.ReactNode;
}

export function AppShell({ name, initials, avatarUrl, liveNow, demo, isAdmin, communityUrl, coursePercent, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Fecha o menu do celular ao trocar de página.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reação à navegação
  useEffect(() => setOpen(false), [pathname]);

  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Estudar",
      items: [
        { href: "/", label: "Início", icon: <HomeIcon /> },
        { href: "/modulos", label: "Módulos", icon: <GridIcon /> },
        { href: "/historico", label: "Histórico", icon: <HistoryIcon /> },
        { href: "/certificado", label: "Certificado", icon: <AwardIcon /> },
      ],
    },
    {
      title: "Ao vivo",
      items: [
        { href: "/ao-vivo", label: "Lives", icon: <LiveIcon />, badge: liveNow ? "AO VIVO" : undefined },
        { href: "/gravacoes", label: "Gravações", icon: <FilmIcon /> },
        communityUrl
          ? { href: communityUrl, label: "Comunidade", icon: <UsersIcon />, external: true }
          : { href: "/#comunidade", label: "Comunidade", icon: <UsersIcon /> },
      ],
    },
    {
      title: "Conta",
      items: [
        { href: "/perfil", label: "Meu perfil", icon: <UserIcon /> },
        ...(isAdmin ? [{ href: "/admin", label: "Painel admin", icon: <SettingsIcon /> }] : []),
      ],
    },
  ];

  const logout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className={`shell${open ? " shell--open" : ""}`}>
      <aside className="sidebar" aria-label="Navegação da área de membros">
        <div className="sidebar__top">
          <Brand />
          <Link href="/" className="sidebar__mark" aria-label="Método Paulo Recomenda, início">PR</Link>
          <button type="button" className="sidebar__close" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <CloseIcon />
          </button>
        </div>
        <nav className="sidebar__nav">
          {groups.map((g) => (
            <div key={g.title} className="sidebar__group">
              <p className="sidebar__label">{g.title}</p>
              {g.items.map((it) =>
                it.external ? (
                  <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" className="sidebar__link" title={it.label}>
                    {it.icon}
                    <span>{it.label}</span>
                  </a>
                ) : (
                  <Link key={it.label} href={it.href} className="sidebar__link" title={it.label} aria-current={isActive(pathname, it.href) ? "page" : undefined}>
                    {it.icon}
                    <span>{it.label}</span>
                    {it.badge && <em className="sidebar__badge">{it.badge}</em>}
                  </Link>
                ),
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar__card">
          <p className="sidebar__card-title">Seu progresso no método</p>
          <div className="sidebar__card-row">
            <ProgressBar percent={coursePercent} label="Progresso no curso" />
            <b>{coursePercent}%</b>
          </div>
          <Link href={coursePercent === 100 ? "/certificado" : "/"} className="sidebar__cta">
            {coursePercent === 100 ? "Ver meu certificado" : "Continuar de onde parei"}
          </Link>
        </div>
        {!demo && (
          <button type="button" className="sidebar__link sidebar__logout" onClick={logout} title="Sair">
            <LogoutIcon />
            <span>Sair</span>
          </button>
        )}
      </aside>
      <button type="button" className="shell__overlay" aria-label="Fechar menu" tabIndex={-1} onClick={() => setOpen(false)} />

      <div className="shell__main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}>
            <MenuIcon />
          </button>
          <div className="topbar__brand">
            <Brand />
          </div>
          <Link href="/" className="sidebar__mark topbar__mark" aria-label="Método Paulo Recomenda, início">PR</Link>
          <form action="/busca" className="search topbar__search" role="search">
            <SearchIcon />
            <label htmlFor="busca-topo" className="sr-only">Buscar aulas</label>
            <input id="busca-topo" name="q" type="search" placeholder="Buscar aulas, módulos e materiais" autoComplete="off" />
          </form>
          <div className="topbar__tools">
            <Link href="/busca" className="icon-btn topbar__search-btn" aria-label="Buscar aulas">
              <SearchIcon />
            </Link>
            <Link href="/ao-vivo" className="icon-btn" aria-label={liveNow ? "Notificações: tem live agora" : "Notificações"}>
              <BellIcon />
              {liveNow && <span className="icon-btn__dot" />}
            </Link>
            <Link href="/perfil" className="avatar-ring" aria-label={`Meu perfil: ${name}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" />
              ) : (
                <span>{initials}</span>
              )}
            </Link>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
