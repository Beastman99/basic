"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";

type PredictionResult = {
  probabilities: Record<string, number>;
  reasoning?: string[];
};

export default function CaseCalculatorPage() {
  const [summary, setSummary] = useState("");
  const [jurisdiction, setJurisdiction] = useState("NSW");
  const [remedies, setRemedies] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const toggleRemedy = (remedy: string) => {
    setRemedies(prev =>
      prev.includes(remedy) ? prev.filter(r => r !== remedy) : [...prev, remedy]
    );
  };

  const handleSubmit = async () => {
    setPrediction({
      probabilities: {
        "Appeal Allowed": 72,
        "Dismissed": 28,
      },
      reasoning: [
        "The reasoning turned heavily on procedural fairness issues.",
        "Past cases with similar facts trended toward allowing appeal.",
      ],
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Case Predictor
        </h1>

        <div className="w-full max-w-xl">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarise your case: key facts, issues, remedy if known..."
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
            Predict
          </button>
        </div>

        {prediction && (
          <div className="mt-10 w-full max-w-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Prediction
            </h2>

            {Object.entries(prediction.probabilities).map(([outcome, prob]) => (
              <div key={outcome} className="mb-2">
                <p className="text-gray-800 dark:text-gray-100 font-medium">
                  {outcome}: {prob}%
                </p>
                <div className="bg-gray-200 h-2 rounded">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${prob}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Model Reasoning</h3>
              <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300 mt-2">
                {prediction.reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
