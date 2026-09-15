import Image from "next/image";
import { ArkRideMark } from "@/components/brand/ArkRideMark";
import { WaitlistDialog } from "@/components/waitlist/WaitlistDialog";
import { LogoIntro } from "@/components/waitlist/LogoIntro";

/**
 * The pre-launch waitlist page — the site's root until launch.
 *
 * DESKTOP (xl, ≥1280px) is the design frame, value for value. The frame is a
 * 1440 × 1458 canvas on #F9F9F9 and every element below is absolutely placed at
 * the coordinates the file gives it, measured from the frame's top-left:
 *
 *   logo        (79.14, 59)     106 × 33   the website mark at 0.86885 scale
 *   hero group  (289, 117)      863 wide   tag, headline, copy, form row
 *   join button 183 × 40 at (340, 281) in the hero, the design's own
 *               button, centred where the design's form row sat. The form
 *               itself opens in a dialog: see WaitlistDialog
 *   cards       (373, 593) (213, 740) (408, 887)   232 × 113.47, radius 17.35
 *   phone       (576, 448)      864 × 937  under the footer, which covers it
 *   footer      (0, 1237)       black, 221 tall (the frame clips it at 1458)
 *
 * Figma's constraints decide what moves when the window is not 1440 wide. The
 * hero and the phone are CENTER-constrained and the logo is LEFT, so those are
 * honoured. The cards say LEFT too, but pinning them to the window edge while
 * the phone they sit beside moves with the centre pulls the composition apart
 * on a wide screen, so they travel with the phone instead. Past 1440 the
 * phone pins to the right edge rather than the centre, because a centred image
 * would end the hand in a hard vertical line mid-window. At exactly 1440 every
 * one of these readings is the same page.
 *
 * Browser and Figma disagree about where a line box puts its glyphs for Mona
 * Sans and Geist at small sizes, by 0.6-1.3px. Where that was measured against
 * the render, the text carries a matching nudge and a note.
 *
 * Two site-wide rules from globals.css are overridden here because the design
 * does not use them. Headings get -0.02em tracking, a 1.15 line-height and
 * balanced wrapping from an UNLAYERED rule, which beats any utility — hence the
 * `!` on those three properties. The body's tabular numerals are switched off.
 *
 * BELOW xl there is no frame in the file. The same content stacks in the same
 * order in one column, with type sized for a phone; nothing above changes.
 */

const CARDS = [
  {
    title: "Faster Pickups",
    body: "Get matched with nearby drivers quickly, so you spend less time waiting and more time getting where you need to be",
    icon: "/waitlist/icons/energy.svg",
    // The energy glyph is a 13.73 frame; the people glyph a 15 frame. Each
    // sits where the file puts it inside the 26.02 butter circle.
    iconClass: "left-[5.78px] top-[5.78px] h-[13.73px] w-[13.73px]",
    place: "xl:left-[373px] xl:top-[593px]",
  },
  {
    title: "Safer Rides",
    body: "Ride with confidence knowing Ark Ride is built around safer pickups, trusted drivers, and a smoother experience from start to finish",
    icon: "/waitlist/icons/people-safe.svg",
    iconClass: "left-[5.04px] top-[4.65px] h-[15px] w-[15px]",
    place: "xl:left-[213px] xl:top-[740px]",
  },
  {
    title: "A Brighter City",
    body: "More than just getting from one place to another, Ark Ride connects people, drivers, and communities to keep the city moving.",
    icon: "/waitlist/icons/people-safe.svg",
    iconClass: "left-[5.04px] top-[4.65px] h-[15px] w-[15px]",
    place: "xl:left-[408px] xl:top-[887px]",
  },
] as const;

/**
 * Set this to Ark Ride's X profile. The design draws the button but links nowhere.
 *
 * The ring is the file's 1.5px INSIDE stroke drawn as an inset shadow, not a
 * border: Chrome floors border widths to whole device pixels, so a 1.5px border
 * renders as 1px on a standard display, while a shadow spread does not snap.
 */
const X_URL = process.env.NEXT_PUBLIC_ARKRIDE_X_URL;

export default function WaitlistPage() {
  const xBadge = (
    <Image
      src="/waitlist/icons/x.svg"
      alt=""
      width={20}
      height={20}
      unoptimized
      className="h-5 w-5"
    />
  );
  const xButtonClass =
    "mt-6 flex h-[34px] w-[34px] items-center justify-center rounded-[17px] shadow-[inset_0_0_0_1.5px_#fff] xl:absolute xl:left-[1326px] xl:top-[103px] xl:mt-0";

  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col overflow-x-hidden bg-[#F9F9F9] text-black [font-variant-numeric:normal]"
    >
      <section className="relative px-5 pt-8 sm:px-8 xl:h-[1237px] xl:overflow-hidden xl:p-0">
        <ArkRideMark
          id="waitlist-logo"
          title="Ark Ride"
          className="h-[33.016px] w-[106px] xl:absolute xl:top-[59px] xl:left-[79.14px] [html[data-intro]_&]:opacity-0"
        />

        <div className="mt-10 flex flex-col items-center xl:absolute xl:top-0 xl:left-1/2 xl:-ml-[720px] xl:mt-0 xl:block xl:h-full xl:w-[1440px] [html[data-intro]_&]:transition-[opacity,translate] [html[data-intro]_&]:duration-300 [html[data-intro]_&]:ease-[cubic-bezier(0.42,0,0.58,1)] [html[data-intro=hold]_&]:translate-y-6 [html[data-intro=hold]_&]:opacity-0">
          <div className="flex w-full flex-col items-center text-center xl:absolute xl:top-[117px] xl:left-[289px] xl:z-10 xl:block xl:h-[321px] xl:w-[863px]">
            <p className="inline-flex h-[25px] items-center rounded-[4px] bg-[#FEEE8F] px-3 font-(family-name:--font-inter) text-[12px] leading-[13.2px] font-semibold text-[#020617] uppercase xl:absolute xl:top-0 xl:left-[331px]">
              Launching SEPTEMBER, 2026
            </p>

            <h1 className="mt-6 max-w-[765px] font-(family-name:--font-mona-sans) text-[32px] leading-[38px]! font-bold tracking-normal! text-wrap! text-black sm:text-[40px] sm:leading-[46px]! xl:absolute xl:top-[61px] xl:left-[53px] xl:mt-0 xl:w-[765px] xl:max-w-none xl:text-[48px] xl:leading-[55px]!">
              The city moves fast, Your ride should too.
            </h1>

            <p className="mt-5 max-w-[538px] font-(family-name:--font-geist) text-[16px] leading-[24px] font-normal text-[#767676] sm:text-[18px] sm:leading-[26px] xl:absolute xl:top-[207px] xl:left-[166.5px] xl:mt-0 xl:w-[538px]">
              {/*
                The design breaks after "and". In the browser the first line
                with "a" measures 536px, which fits the 538px box, so the
                break is explicit at xl rather than left to the wrap.
              */}
              Join the first wave of Ark Ride safer pickups, clearer prices, and
              <br className="hidden xl:inline" /> a ride that keeps pace with
              your day.
            </p>

            <WaitlistDialog className="mt-8 xl:absolute xl:top-[281px] xl:left-[340px] xl:mt-0" />
          </div>
        </div>

        {/*
          Cards and phone share their own 1440 canvas. It is centred like the
          hero up to 1440; past that it pins to the right edge instead, so the
          hand keeps running off the side of the window the way it runs off
          the frame, rather than ending in a hard vertical edge mid-screen. The
          cards move with it because they are drawn against the phone.

          One `left: max(50% - 720px, 100% - 1440px)` does both: it is 0 at
          1440, the centring term below it, and the right-pinning term above
          it. (Two breakpoint classes cannot: Tailwind will not order an
          arbitrary px breakpoint against the rem-based xl one.)
        */}
        <div className="flex flex-col items-center xl:absolute xl:top-0 xl:left-[max(50%_-_720px,100%_-_1440px)] xl:block xl:h-full xl:w-[1440px] [html[data-intro]_&]:transition-[opacity,translate] [html[data-intro]_&]:duration-300 [html[data-intro]_&]:ease-[cubic-bezier(0.42,0,0.58,1)] [html[data-intro=hold]_&]:translate-y-6 [html[data-intro=hold]_&]:opacity-0">
          <ul className="mt-12 grid w-full max-w-[720px] gap-3 sm:grid-cols-3 xl:contents">
            {CARDS.map((card) => (
              <li
                key={card.title}
                className={`relative rounded-[17.35px] bg-white py-[22px] pr-[56px] pl-[22.4px] text-left xl:absolute xl:z-10 xl:h-[113.47px] xl:w-[232px] xl:overflow-hidden xl:p-0 ${card.place}`}
              >
                <h2 className="font-(family-name:--font-mona-sans) text-[15px] leading-[18px]! font-semibold tracking-normal! text-wrap! text-black xl:absolute xl:top-[24.72px] xl:left-[22.4px] xl:text-[11.5639px] xl:leading-[12.2866px]! xl:whitespace-nowrap">
                  {card.title}
                </h2>
                <p className="mt-2 font-(family-name:--font-geist) text-[13px] leading-[18px] font-normal text-[#767676] xl:absolute xl:top-[47.7px] xl:left-[22.4px] xl:mt-0 xl:w-[152.5px] xl:text-[8.6729px] xl:leading-[12.2866px]">
                  {card.body}
                </p>
                <span className="absolute top-[18px] right-[18px] h-[26.02px] w-[26.02px] rounded-full bg-[#FEEE8F] xl:top-[17.35px] xl:right-auto xl:left-[179.96px]">
                  <Image
                    src={card.icon}
                    alt=""
                    width={15}
                    height={15}
                    unoptimized
                    className={`absolute ${card.iconClass}`}
                  />
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mt-10 aspect-[864/789] w-full max-w-[560px] overflow-hidden xl:absolute xl:top-[448px] xl:left-[576px] xl:mt-0 xl:aspect-auto xl:h-[937px] xl:w-[864px] xl:max-w-none xl:overflow-visible">
            <Image
              src="/waitlist/phone-hand.jpg"
              alt="The Ark Ride app open on a phone, offering to book a ride or become a driver"
              fill
              priority
              unoptimized
              sizes="(min-width: 1280px) 864px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <footer className="relative bg-black text-white xl:h-[221px] xl:overflow-hidden [html[data-intro]_&]:transition-[opacity,translate] [html[data-intro]_&]:duration-300 [html[data-intro]_&]:ease-[cubic-bezier(0.42,0,0.58,1)] [html[data-intro=hold]_&]:translate-y-6 [html[data-intro=hold]_&]:opacity-0">
        <div className="relative z-10 flex flex-col items-center px-5 pt-10 pb-8 text-center xl:left-1/2 xl:-ml-[720px] xl:block xl:h-full xl:w-[1440px] xl:p-0">
          <div className="xl:absolute xl:top-[27px] xl:left-[474px] xl:w-[491px]">
            <h2 className="font-(family-name:--font-mona-sans) text-[24px] leading-[32px]! font-semibold tracking-normal! text-wrap! text-white xl:text-[28px] xl:leading-[55px]!">
              Your next ride starts here.
            </h2>
            <p className="relative mt-2 font-(family-name:--font-geist) text-[15px] leading-[24.75px] font-normal xl:top-[1px] xl:mt-0">
              Add your name and we’ll be in touch.
            </p>
          </div>

          {X_URL ? (
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ark Ride on X"
              className={`${xButtonClass} transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
            >
              {xBadge}
            </a>
          ) : (
            <span aria-hidden className={xButtonClass}>
              {xBadge}
            </span>
          )}
        </div>

        {/*
          The strip is a 52px band of the illustration: the file shows image
          rows 521.7–577.2 of 1024 at full image width. The asset is rows
          512–740, so the band starts 9.716 image px down — 0.63255% of the
          strip's WIDTH at this scale, which is exactly what a percentage
          margin resolves against. Below xl the band simply covers.
        */}
        <div className="relative h-[52px] overflow-hidden xl:absolute xl:inset-x-0 xl:top-[171px]">
          <Image
            src="/waitlist/footer-strip.webp"
            alt=""
            width={1536}
            height={228}
            unoptimized
            className="absolute inset-0 h-full w-full max-w-none object-cover xl:static xl:mt-[-0.63255%] xl:ml-[0.02698%] xl:block xl:h-auto xl:w-full xl:object-fill"
          />
          <p className="absolute top-[13px] left-5 font-(family-name:--font-geist) text-[16px] leading-[26.4px] font-medium whitespace-nowrap text-white xl:left-[calc(50%-621px)]">
            @ 2026 - All rights reserved.
          </p>
        </div>
      </footer>
      <LogoIntro targetId="waitlist-logo" />
    </main>
  );
}
