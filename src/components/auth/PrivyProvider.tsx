"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";

/**
 * Privy, mounted only when it is configured.
 *
 * `NEXT_PUBLIC_PRIVY_APP_ID` is the one value here that genuinely belongs in
 * the bundle — it is a public client identifier, and the SDK runs in the
 * browser. The app SECRET stays server-side and is never referenced by this
 * app at all: verification happens on the ArkRide API, against Privy's public
 * key.
 *
 * When the id is absent this renders children untouched rather than throwing,
 * so a deployment without Privy still serves a working password sign-in.
 */
export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) return <>{children}</>;

  return (
    <Privy
      appId={appId}
      config={{
        // Email and phone first: this is Lagos, and a wallet-first prompt asks
        // most riders for something they do not have.
        loginMethods: ["email", "sms", "google", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#f3ba3f",
          logo: undefined,
        },
        embeddedWallets: {
          // Every account gets a wallet, because fares settle in naira today
          // but the product is heading for KASH. Creating it at sign-up means
          // no migration later for people who joined early.
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </Privy>
  );
}
