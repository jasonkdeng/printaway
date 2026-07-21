"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type AccountControlProps = {
  account: { accountId: string; email: string | null } | null;
};

const controlClassName = "inline-flex min-h-11 items-center border border-graphite px-3 text-sm text-bone hover:border-aluminum hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet";

export function AccountControl({ account }: AccountControlProps) {
  if (!account) {
    return <Link className={controlClassName} href="/api/auth/signin/google?callbackUrl=%2Fcart">Sign in with Google</Link>;
  }

  return (
    <div className="flex items-center gap-2">
      {account.email ? <span className="max-w-40 truncate text-xs text-aluminum" title={account.email}>{account.email}</span> : null}
      <button className={controlClassName} onClick={() => {
        window.sessionStorage.removeItem("printaway-cart-v1");
        window.sessionStorage.removeItem("printaway-account-cart-subject-v1");
        void signOut({ callbackUrl: "/" });
      }} type="button">Sign out</button>
    </div>
  );
}
