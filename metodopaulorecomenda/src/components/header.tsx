"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/actions";
import { Brand } from "./brand";
import { BellIcon, SearchIcon } from "./icons";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/modulos", label: "Módulos" },
  { href: "/ao-vivo", label: "Ao vivo" },
  { href: "/#comunidade", label: "Comunidade" },
  { href: "/gravacoes", label: "Gravações" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/modulos" && pathname.startsWith("/aula/"));
}

export function Header({ name, initials, liveNow, demo }: { name: string; initials: string; liveNow: boolean; demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV.map((item) => (
    <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
      {item.label}
    </Link>
  ));

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <Brand />
          <nav className="nav" aria-label="Principal">
            {links}
          </nav>
          <div className="header__tools">
            <form action="/busca" className="search" role="search">
              <SearchIcon />
              <label htmlFor="busca-topo" className="sr-only">
                Buscar aulas
              </label>
              <input id="busca-topo" name="q" type="search" placeholder="Buscar aulas" autoComplete="off" />
            </form>
            <Link href="/ao-vivo" className="icon-btn" aria-label={liveNow ? "Notificações: tem live agora" : "Notificações"}>
              <BellIcon />
              {liveNow && <span className="icon-btn__dot" />}
            </Link>
            <details className="avatar-menu">
              <summary aria-label="Menu da conta">
                <span className="avatar-ring">
                  <span>{initials}</span>
                </span>
              </summary>
              <div className="avatar-menu__panel">
                <p>
                  <strong>{name}</strong>
                  Aluno do Método Paulo Recomenda
                </p>
                <Link href="/busca">Buscar aulas</Link>
                {!demo && (
                  <form action={async () => { await signOut(); router.replace("/login"); router.refresh(); }}>
                    <button type="submit">Sair</button>
                  </form>
                )}
              </div>
            </details>
          </div>
        </div>
        <nav className="mobile-nav" aria-label="Principal (celular)">
          {links}
        </nav>
      </div>
    </header>
  );
}
