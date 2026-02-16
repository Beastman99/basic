"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function SuccessStoriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center px-4 py-12 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Litigation Funding Success Stories
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl">
          Real examples of how litigation funding empowers individuals and groups to achieve fair outcomes — even against powerful opponents.
        </p>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

  {/* Class Action Example */}
  <div className="border rounded-lg p-6 dark:bg-gray-900 dark:border-gray-700 shadow space-y-2">
    <h2 className="text-xl font-bold">Spotless Class Action (Australia)</h2>
    <p className="text-gray-600 dark:text-gray-300 text-sm">
      Funded by Omni Bridgeway, this shareholder class action reached a AUD $95 million settlement after misleading market statements.
    </p>
    <a
      href="https://omnibridgeway.com/insights/press-releases/all-press-releases/press-release/2017/02/24/class-action-against-spotless-filed-in-the-federal-court"
      className="text-green-700 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Read more
    </a>
  </div>

  {/* Mass Tort / Bushfire */}
  <div className="border rounded-lg p-6 dark:bg-gray-900 dark:border-gray-700 shadow space-y-2">
    <h2 className="text-xl font-bold">7-Eleven Underpayment Class Action (Australia)</h2>
    <p className="text-gray-600 dark:text-gray-300 text-sm">
      Funded by Litigation Lending Services, this wage underpayment class action recovered $98 million for thousands of 7-Eleven workers underpaid in their franchise network.
    </p>
    <a
      href="https://www.thenewdaily.com.au/finance/finance-news/2022/04/06/7-eleven-settlement"
      className="text-green-700 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Read more
    </a>
  </div>

  {/* Intellectual Property / Commercial Example */}
  <div className="border rounded-lg p-6 dark:bg-gray-900 dark:border-gray-700 shadow space-y-2">
    <h2 className="text-xl font-bold">Commercial Funding Support (US)</h2>
    <p className="text-gray-600 dark:text-gray-300 text-sm">
      Burford Capital provided critical funding to a business facing year-end obligations, allowing it to preserve its litigation strategy while maintaining day-to-day operations.
    </p>
    <a
      href="https://www.burfordcapital.com/what-we-do/case-studies/case-study-providing-cash-to-company-with-year-end-obligations/"
      className="text-green-700 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Read more
    </a>
  </div>

  {/* Crowd-funded Class Action */}
  <div className="border rounded-lg p-6 dark:bg-gray-900 dark:border-gray-700 shadow space-y-2">
    <h2 className="text-xl font-bold">Gina Miller Brexit Challenge (UK)</h2>
    <p className="text-gray-600 dark:text-gray-300 text-sm">
      Raised over £300,000 on CrowdJustice to challenge the government on Article 50, winning in the Supreme Court.
    </p>
    <a
      href="https://www.wired.com/story/brexit-court-case-gina-miller-crowdfunded-justice/"
      className="text-green-700 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      Read more
    </a>
  </div>
</div>


        {/* Returns Section */}
        <section className="mt-16 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Returns in Litigation Funding
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Litigation funding is a high-risk, high-reward investment category, with court-approved commissions typically ranging from 20% to 40% of settlement proceeds, or 2–5x invested capital in successful cases. Returns vary based on risk, case duration, and jurisdiction oversight.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

  {/* Class Actions */}
  <div className="p-6 rounded border shadow dark:border-gray-700 dark:bg-gray-900 space-y-2 flex flex-col items-center">
    <div className="text-3xl font-extrabold text-green-600">30%</div>
    <div className="text-sm text-gray-400 dark:text-gray-500 mb-2">Typical Commission</div>
    <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
      Class actions regularly achieve total damages into hundreds of millions. Some funders report
      <span className="font-semibold text-green-600"> 3–5× </span> returns on invested funds.
    </p>
  </div>

  {/* Commercial Disputes */}
  <div className="p-6 rounded border shadow dark:border-gray-700 dark:bg-gray-900 space-y-2 flex flex-col items-center">
    <div className="text-3xl font-extrabold text-green-600">3×</div>
    <div className="text-sm text-gray-400 dark:text-gray-500 mb-2">Return on Investment</div>
    <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
      Smaller capital but predictable outcomes depending on settlement timing and contract enforceability.
    </p>
  </div>

  {/* Personal Injury / Mass Tort */}
  <div className="p-6 rounded border shadow dark:border-gray-700 dark:bg-gray-900 space-y-2 flex flex-col items-center">
    <div className="text-3xl font-extrabold text-green-600">25%</div>
    <div className="text-sm text-gray-400 dark:text-gray-500 mb-2">Capped Recovery Share</div>
    <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
      Catastrophic injury claims can produce consistent outcomes, with funders capped to fair recovery rates under court supervision.
    </p>
  </div>

</div>

        </section>
        <div className="mt-12 text-center">
  <a
    href="/signup"
    className="inline-block px-6 py-3 rounded bg-green-700 hover:bg-green-800 text-white font-semibold transition"
  >
    Register to Get Started
  </a>
</div>

      </main>
      <Footer />
    </div>
  );
}
