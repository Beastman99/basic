"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";

export default function LegalDirectionPage() {
  const [summary, setSummary] = useState("");
  const [jurisdiction, setJurisdiction] = useState("NSW");
  const [venue, setVenue] = useState<string | null>(null);
  const [similarCases, setSimilarCases] = useState<string[]>([]);

  const handleSubmit = async () => {
    setVenue("NSW Civil and Administrative Tribunal (NCAT)");
    setSimilarCases([
      "Johnston v Blue Mountains Council [2020] NSWLEC 1452 — Planning dispute over dwelling location.",
      "Smith v Local Government NSW [2019] NSWLEC 1331 — Refusal of permit due to environmental constraints.",
      "Chen v Inner West Council [2021] NSWLEC 1223 — Dispute about development consent conditions."
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Legal Direction Advisor
        </h1>

        <div className="w-full max-w-xl">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe your legal issue..."
            className="w-full p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white"
            rows={4}
          />

          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="w-full mt-2 p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white"
          >
            <option value="NSW">NSW</option>
            <option disabled>VIC (coming soon)</option>
            <option disabled>QLD (coming soon)</option>
            <option disabled>SA (coming soon)</option>
            <option disabled>WA (coming soon)</option>
            <option disabled>TAS (coming soon)</option>
          </select>

          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Find Legal Avenue
          </button>
        </div>

        {venue && (
          <div className="mt-10 w-full max-w-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Recommended Venue
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">{venue}</p>

            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Similar Cases</h3>
            <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
              {similarCases.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
