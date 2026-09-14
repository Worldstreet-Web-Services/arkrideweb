import Image from "next/image";
import { ArkRideMark } from "@/components/brand/ArkRideMark";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

/**
 * The pre-launch waitlist page — the site's root until launch.
 *
 * A 1440 × 1024 scene — the Lagos pickup illustration edge to edge — with a
 * 613 × 748 white panel hung from the top edge at x=107. Every measurement
 * below is the design's own; the comments give the one it came from so the
 * next person can check rather than trust.
 *
 *   panel      613 × 748 at (107, 0), white, clips its content
 *   logo       122 × 38  at (40, 34)     — the exported mark, ArkRideMark
 *   tag        209 × 25  at (40, 124)    — 6/12 padding, radius 4, butter
 *   headline   430 wide  at (40, 183)    — Mona Sans 700, 48/55, black
 *   paragraph  430 wide  at (40, 374)    — Geist 400, 18/26, #767676
 *   car        42.43 × 17.47 at (222, 378), inline in the paragraph's
 *              first line, over the run of spaces the copy reserves for it
 *   form       538 × 64  at (38, 484)    — see WaitlistForm
 *   footer     528 wide  at (40, 689)    — Inter 400, 16/26.4, #334155
 *
 * The gaps are differences of those y values: 52 under the logo, 34 under the
 * tag, 26 under the headline, 32 above the form. The footer sits at a fixed
 * 33px from the panel's bottom edge, which is what `mt-auto` + `pb-[33px]`
 * reproduces.
 *
 * Three site-wide rules are switched off here because the design does not
 * use them. globals.css styles every heading OUTSIDE a cascade layer, so those
 * declarations beat any utility and the overrides below have to be `!`:
 * a -0.02em tracking (the design's headline is tracked at 0, and the tight
 * value costs it 13px of width), a 1.15 line-height (55.2px at 48px, which
 * pushes everything beneath the headline down by a pixel), and balanced
 * wrapping (the design wraps naturally). The body's tabular numerals are off
 * too — the design's "2026" is proportional.
 *
 * There is no phone frame in the design, so below `md` the panel becomes the
 * page — full width, full height, the same order — and the headline steps
 * down to 36/42 so it wraps in three lines rather than five. Every desktop
 * value is scoped to `md:` and is not affected.
 */
export default function WaitlistPage() {
  return (
    <main
      id="main"
      className="relative min-h-dvh w-full overflow-hidden bg-black"
    >
      <Image
        src="/waitlist/lagos-pickup.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <section
        aria-labelledby="waitlist-heading"
        className="relative flex min-h-dvh w-full flex-col bg-white px-5 pt-8 pb-8 text-black [font-variant-numeric:normal] md:absolute md:top-0 md:left-[107px] md:h-[748px] md:min-h-0 md:w-[613px] md:overflow-hidden md:px-10 md:pt-[34px] md:pb-[33px]"
      >
        <ArkRideMark className="h-[38px] w-[122px] md:-ml-px" title="Ark Ride" />

        <p className="mt-10 inline-flex h-[25px] w-fit items-center rounded-[4px] bg-secondary px-3 py-1.5 font-(family-name:--font-inter) text-[12px] leading-[13.2px] font-semibold text-[#020617] uppercase md:mt-[52px]">
          Launching SEPTEMBER, 2026
        </p>

        <h1
          id="waitlist-heading"
          className="mt-6 w-full font-(family-name:--font-mona-sans) text-[36px] leading-[42px]! font-bold tracking-normal! text-wrap! text-black md:mt-[34px] md:w-[430px] md:text-[48px] md:leading-[55px]!"
        >
          The city moves fast, Your ride should too.
        </h1>

        <p className="mt-5 w-full font-(family-name:--font-geist) text-[18px] leading-[26px] font-normal text-[#767676] md:mt-[26px] md:h-[78px] md:w-[430px]">
          Join the first wave of{" "}
          <Image
            src="/waitlist/car.png"
            alt=""
            width={510}
            height={210}
            sizes="43px"
            className="ml-[4px] -mr-px inline-block h-[17.47px] w-[42.43px] align-middle"
          />{" "}
          Ark Ride safer pickups, clearer prices, and a ride that keeps pace
          with your day.
        </p>

        <WaitlistForm />

        <p className="mt-auto w-full pt-10 font-(family-name:--font-inter) text-[16px] leading-[26.4px] font-normal text-[#334155] md:h-[26px] md:w-[528px] md:pt-0">
          @ 2026 - All rights reserved.
        </p>
      </section>
    </main>
  );
}
