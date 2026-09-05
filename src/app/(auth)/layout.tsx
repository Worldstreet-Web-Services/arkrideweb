import Image from "next/image";
import Link from "next/link";
import { ArkLogo } from "@/components/brand/ArkLogo";

/**
 * Shell for every sign-in and sign-up page.
 *
 * THE RIGHT PANEL
 *
 * It used to be a near-empty ink rectangle with two blurred circles and a
 * paragraph pinned to the bottom — a lot of screen carrying almost nothing.
 *
 * It now carries the Lagos traffic illustration the mobile app uses on its
 * role-select screen. That artwork is already in the brand palette — cream
 * ground, amber sun, black cars, one of them plated ARK — so it needs no
 * treatment to sit alongside the amber. It also has deep negative space at the
 * top, which is where the headline goes; the composition was built for exactly
 * this.
 *
 * The vehicle renders in the same asset folder were rejected: keke-green.png,
 * car-green.png and ark-vehicle.png are all bright emerald, left over from the
 * palette the brand moved away from, and would fight the amber.
 *
 * Hidden below `lg`. On a phone the form should have the whole screen, and a
 * 719KB illustration is not worth a rider's mobile data to decorate it.
 *
 * The panel is STICKY and exactly one viewport tall. A grid item stretches to
 * the row height by default, so on a long form — driver sign-up runs well past
 * the fold — the artwork was being stretched to the full scroll height and
 * dragged up the screen with the fields. Pinning it means the form scrolls
 * against a fixed image, which is the behaviour the split layout implies.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-dvh flex-col px-5 py-8 sm:px-10">
        <Link
          href="/"
          className="inline-flex w-fit rounded-pill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArkLogo className="h-7 w-auto text-text" title="ArkRide home" />
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-96">{children}</div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#F6F1E7] lg:sticky lg:top-0 lg:block lg:h-dvh lg:self-start">
        {/*
          Bottom-anchored: the road runs off the lower edge, so the scene reads
          as continuing past the panel rather than floating inside it.
        */}
        <Image
          src="/brand/lagos-traffic.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 0px"
          className="object-cover object-bottom"
        />

        <div className="relative flex h-full flex-col justify-start p-12 xl:p-16">
          <p className="max-w-90 text-4xl font-bold leading-[1.08] tracking-tight text-[#152531] text-balance">
            Move at the speed of now.
          </p>
        </div>
      </aside>
    </div>
  );
}
