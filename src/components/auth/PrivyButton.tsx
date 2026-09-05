"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { privySignInAction } from "@/app/actions/privy";

/**
 * Sign in with Privy.
 *
 * The flow: Privy authenticates in the browser, we take its access and
 * identity tokens straight to a Server Action, and the ArkRide session comes
 * back as httpOnly cookies. Nothing is persisted client-side.
 *
 * Renders nothing when Privy is not configured — an alternative that opens a
 * modal and then fails is worse than an absent button.
 */
export function PrivyButton({
  audience,
  next,
}: {
  audience: "rider" | "driver";
  next: string;
}) {
  const configured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stalled, setStalled] = useState(false);

  // Hooks must run unconditionally, so the config check gates the render
  // below rather than the hook calls.
  const { ready, authenticated, login, getAccessToken, user, logout } = usePrivy();
  const { identityToken } = useIdentityToken();

  /**
   * True once the user has started sign-in from THIS button.
   *
   * Privy's session outlives our own, so someone arriving at /login with a
   * live Privy session but no ArkRide cookie would otherwise be exchanged
   * automatically on page load — signing them in without asking. The exchange
   * only ever follows a deliberate click.
   */
  const initiated = useRef(false);

  const exchange = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Sign-in did not complete. Please try again.");
        return;
      }

      const result = await privySignInAction({
        accessToken,
        identityToken: identityToken ?? undefined,
        audience,
        // Only used when provisioning a brand-new rider; ignored otherwise.
        name: user?.google?.name ?? undefined,
      });

      if (result.error) {
        setError(result.error);
        // Drop the Privy session too. Leaving it signed in while ArkRide is
        // not means the button reads "continue" and then fails again.
        await logout().catch(() => {});
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("We couldn't complete sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [audience, getAccessToken, identityToken, logout, next, router, user]);

  /**
   * Finish the exchange as soon as Privy reports success.
   *
   * `login()` opens a modal and returns immediately — it does not resolve when
   * the user finishes. Without this the flow would stall after the modal
   * closes and demand a second click, which reads as the sign-in having
   * failed.
   */
  useEffect(() => {
    if (!ready || !authenticated || !initiated.current || busy) return;
    initiated.current = false;
    void exchange();
  }, [ready, authenticated, busy, exchange]);

  /**
   * Give up waiting on Privy after 8 seconds.
   *
   * `ready` stays false forever if the SDK cannot reach its API — a blocked
   * request, an offline network, an ad blocker, or (as happened here) a
   * Content-Security-Policy that omits `auth.privy.io`. The button then sits
   * on "Loading…" with no explanation, which reads as the app being broken.
   *
   * Password sign-in is right above it and works regardless, so the honest
   * thing is to say this option is unavailable and let people use that.
   */
  useEffect(() => {
    // No state is cleared when `ready` turns true: every read of `stalled`
    // below is already behind a `!ready` check, so a stale true is invisible.
    // Setting it here would be a synchronous setState inside an effect, which
    // costs an extra render pass for nothing.
    if (ready) return;

    const timer = setTimeout(() => setStalled(true), 8_000);
    return () => clearTimeout(timer);
  }, [ready]);

  const onClick = async () => {
    if (!ready) return;
    initiated.current = true;
    if (authenticated) {
      await exchange();
      return;
    }
    login();
  };

  // The "not configured" case returns here, AFTER every hook has run. Putting
  // this above the hooks changes how many run between renders, which is the
  // one thing the rules of hooks forbid.
  if (!configured) return null;

  // Once Privy has authenticated, the exchange is the remaining step — so the
  // button says so rather than reopening the modal.
  const label = !ready
    ? stalled
      ? "Unavailable right now"
      : "Loading…"
    : busy
      ? "Signing in…"
      : authenticated
        ? "Continue with Privy"
        : "Continue with email or wallet";

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={!ready || busy}
        aria-busy={busy || (!ready && !stalled)}
        className="h-12 w-full rounded-pill border border-border-strong bg-surface text-[15px] font-semibold text-text transition hover:border-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {label}
      </button>

      <div role="alert" className="empty:hidden">
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        {!error && stalled && !ready && (
          <p className="text-xs text-text-muted">
            We couldn&rsquo;t reach the sign-in provider. Use your email and
            password above instead.
          </p>
        )}
      </div>
    </div>
  );
}
