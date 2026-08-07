"use client";

import { signOut } from "next-auth/react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

import { googleSignInControlClassName, headerOutlinedControlClassName } from "./header-control-styles";

type AccountControlProps = {
  account: { accountId: string; email: string | null } | null;
  authenticationAvailable: boolean;
};

export function AccountControl({ account, authenticationAvailable }: AccountControlProps) {
  if (!account) {
    if (!authenticationAvailable) return null;
    return <GoogleSignInButton className={googleSignInControlClassName} label="Sign in with Google" />;
  }

  return (
    <div className="flex items-center gap-2">
      {account.email ? <span className="max-w-40 truncate text-xs text-aluminum" title={account.email}>{account.email}</span> : null}
      <button className={headerOutlinedControlClassName} onClick={() => {
        window.sessionStorage.removeItem("printaway-cart-v1");
        window.sessionStorage.removeItem("printaway-account-cart-subject-v1");
        void signOut({ callbackUrl: "/" });
      }} type="button">Sign out</button>
    </div>
  );
}
