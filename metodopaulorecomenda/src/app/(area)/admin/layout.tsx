import { AdminTabs } from "@/components/admin/admin-tabs";
import { requireAdmin } from "@/lib/admin";
import { isDemo } from "@/lib/env";

export const metadata = { title: "Painel admin | Método Paulo Recomenda", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container admin">
      <span className="kicker">Painel admin</span>
      {isDemo && (
        <p className="flash flash--ok" style={{ marginTop: 14 }}>
          Modo demonstração: as mudanças aparecem na área, mas somem quando o servidor reinicia. Nada é gravado no banco.
        </p>
      )}
      <div style={{ height: 14 }} />
      <AdminTabs />
      {children}
    </div>
  );
}
