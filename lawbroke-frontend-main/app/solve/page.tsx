// app/solve/page.tsx
"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // avoid SSG issues for this page

type Barrister = {
  barrister_name: string;
  inferred_field_of_law: string;
  num_cases: number;
  most_recent_year: number;
  reasoning_score_by_field?: string;
  address?: string;
  phone?: string;
};

type PredictionResult = {
  probabilities: Record<string, number>;
  reasoning?: string[];
};

async function fetchJsonOrThrow(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  if (!ct.includes("application/json"))
    throw new Error(`Non-JSON response (${ct}). First 200 chars:\n${text.slice(0, 200)}`);

  return JSON.parse(text);
}

function SolveContent() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const state = sp.get("state") || "NSW";

  const [loading, setLoading] = useState(true);
  const [matchedField, setMatchedField] = useState<string | null>(null);
  const [barristers, setBarristers] = useState<Barrister[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedBarristers = useMemo(() => {
    if (!matchedField) return barristers;
    return [...barristers].sort((a, b) => {
      try {
        const sa = JSON.parse(a.reasoning_score_by_field || "{}")[matchedField] || 0;
        const sb = JSON.parse(b.reasoning_score_by_field || "{}")[matchedField] || 0;
        return sb - sa;
      } catch {
        return 0;
      }
    });
  }, [barristers, matchedField]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        if (!q.trim()) {
          setError("No query provided.");
          setLoading(false);
          return;
        }
        if (state !== "NSW") {
          setError(`${state} support is coming soon.`);
          setLoading(false);
          return;
        }

        // 1) Infer field
        const mf = await fetchJsonOrThrow("/api/match-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: q }),
        });
        const field = mf.field || "General Law";
        if (!cancelled) setMatchedField(field);

        // 2) Get barristers
        const params = new URLSearchParams({ field });
        const barrData = await fetchJsonOrThrow(`/api/barristers?${params.toString()}`);
        if (!cancelled) setBarristers(barrData);

        // 3) Get prediction
        const pred = await fetchJsonOrThrow("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: q, jurisdiction: state }),
        });
        if (!cancelled) setPrediction(pred);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [q, state]);

  return (
    <main className="flex flex-col items-center py-12 px-4 w-full">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
        Results
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl text-center">
        Query: <span className="font-medium">{q}</span>
      </p>

      {loading && <p className="text-gray-700 dark:text-gray-300">Crunching…</p>}
      {error && (
        <pre className="text-red-600 dark:text-red-400 whitespace-pre-wrap text-sm max-w-3xl">
          {error}
        </pre>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          {/* Left: FindLawyer-style */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Top Barristers{matchedField ? ` · ${matchedField}` : ""}
            </h2>
            <div className="space-y-4">
              {sortedBarristers.length === 0 && (
                <p className="text-gray-700 dark:text-gray-300">No barristers found.</p>
              )}
              {sortedBarristers.map((b, i) => {
                let rating = "–";
                try {
                  if (b.reasoning_score_by_field && matchedField) {
                    const parsed = JSON.parse(b.reasoning_score_by_field);
                    const sc = parsed[matchedField];
                    if (typeof sc === "number") rating = `${Math.round(sc * 100)}%`;
                  }
                } catch {
                  rating = "–";
                }
                return (
                  <div key={i} className="p-4 border rounded dark:border-gray-700 shadow dark:bg-gray-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {b.barrister_name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">🧠 Rating: {rating}</p>
                    {b.address && <p className="text-gray-700 dark:text-gray-300">📍 {b.address}</p>}
                    {b.phone && <p className="text-gray-700 dark:text-gray-300">📞 {b.phone}</p>}
                    <p className="text-gray-700 dark:text-gray-300">
                      Cases: {b.num_cases ?? 0} · Last Active: {b.most_recent_year || "–"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right: Case Predictor-style */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Case Prediction
            </h2>

            {!prediction && (
              <p className="text-gray-700 dark:text-gray-300">
                No prediction yet.
              </p>
            )}

            {prediction && (
              <div className="space-y-3">
                {Object.entries(prediction.probabilities).map(([outcome, prob]) => (
                  <div key={outcome}>
                    <div className="flex justify-between text-gray-800 dark:text-gray-100">
                      <span className="font-medium">{outcome}</span>
                      <span>{prob}%</span>
                    </div>
                    <div className="bg-gray-200 h-2 rounded">
                      <div
                        className="h-2 rounded bg-blue-500"
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>
                ))}

                {prediction.reasoning?.length ? (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Model Reasoning</h3>
                    <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {prediction.reasoning.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
        <SolveContent />
      </Suspense>
      <Footer />
    </div>
  );
}
