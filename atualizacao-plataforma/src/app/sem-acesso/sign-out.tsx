"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-outline-grad"
      style={{ maxWidth: 420 }}
      onClick={async () => {
        await signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      Entrar com outro e-mail
    </button>
  );
}
