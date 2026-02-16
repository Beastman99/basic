// components/Hero.tsx
"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="text-center my-32 mx-4 sm:mx-8 md:mx-16 lg:mx-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-sans text-3xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl dark:text-white mb-6">
          LawBroke
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 font-light">
          Australia&apos;s Legal Brokerage.
        </p>

        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">
            Start with one of these:
          </p>

          {/* Buttons: full-width on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-md border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-base font-medium"
              aria-label="Go to Lawyer Match"
            >
              Lawyer Match
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-md bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition text-base font-medium"
              aria-label="Join the Case Predictor waitlist"
            >
              Case Predictor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
