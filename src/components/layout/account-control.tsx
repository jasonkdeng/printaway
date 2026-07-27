"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { googleSignInControlClassName, headerOutlinedControlClassName } from "./header-control-styles";

type AccountControlProps = {
  account: { accountId: string; email: string | null } | null;
  authenticationAvailable: boolean;
};

export function AccountControl({ account, authenticationAvailable }: AccountControlProps) {
  if (!account) {
    if (!authenticationAvailable) return null;
    return (
      <Link className={googleSignInControlClassName} href="/api/auth/signin/google?callbackUrl=%2Fcart">
        <svg aria-hidden="true" className="size-3 shrink-0" data-testid="google-logo" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7964 2.7155v2.2582h2.9082c1.7027-1.5673 2.6845-3.8741 2.6845-6.6146Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1809l-2.9082-2.2582c-.8055.54-1.8355.8591-3.0482.8591-2.3441 0-4.3282-1.5845-5.0364-3.7105H.9573v2.3318A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.9636 10.7095A5.41 5.41 0 0 1 3.6818 9c0-.5936.1027-1.1705.2818-1.7095V4.9582H.9573A9 9 0 0 0 0 9c0 1.4527.3477 2.8282.9573 4.0418l3.0063-2.3318Z" />
          <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.44 1.3459l2.5818-2.5818C13.4636.8918 11.4264 0 9 0A9 9 0 0 0 .9573 4.9582l3.0063 2.3318C4.6718 5.1641 6.6559 3.5795 9 3.5795Z" />
        </svg>
        <span>Sign in with Google</span>
      </Link>
    );
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
