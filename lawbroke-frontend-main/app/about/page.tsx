"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center px-4 py-12 max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">About LawBroke</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-left max-w-3xl">
          LawBroke is an independent legal data platform designed to empower everyday Australians with fair, transparent, and data-driven tools. Our mission is to help you make informed legal decisions with confidence, whether you need to choose a lawyer, compare funding options, or estimate case outcomes.
        </p>

        {/* Rating Explanation Section */}
        <section className="w-full text-left space-y-6 mt-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">How We Match Lawyers</h2>
          
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>Number of Court Cases</strong> — more appearances means greater experience. We count all publicly recorded court cases.
            </li>
            <li>
              <strong>Experience Range</strong> — the spread between earliest and most recent matters shows professional continuity.
            </li>
            <li>
              <strong>Reasoning Score</strong> — using NLP (natural language processing), we assess how closely the lawyer’s arguments align with final judicial reasoning.
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            These components are fed into our backend, then converted to a public-facing dashboard for you to easily interpret and sort by your preferences.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Why this matters</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Traditional legal directories list qualifications — but rarely measure <strong>performance in court</strong>. We believe legal consumers deserve:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Objective, data-backed insights</li>
            <li>Transparency about courtroom performance</li>
            <li>Better decision-making for fairer outcomes</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Important notes</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>LawBroke, its tools and results are not legal advice</li>
            <li>Currently focused on NSW and publicly available court data</li>
            <li>Fields like Family Law may have lower public data volume, so comparisons may vary</li>
            <li>Ratings will continue to evolve as more data and improved models become available</li>
          </ul>

          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Questions or feedback? We’d love to hear from you — contact us anytime at lawbrokeplatform@gmail.com
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
