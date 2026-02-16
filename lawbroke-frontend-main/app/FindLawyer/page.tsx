// Trigger redeploy

"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";

interface Barrister {
  barrister_name: string;
  inferred_field_of_law: string;
  num_cases: number;
  most_recent_year: number;
  reasoning_score_by_field?: string;
  address: string;
  phone: string;
  distance?: number;
}

export default function FindLawyerPage() {
  const [barristers, setBarristers] = useState<Barrister[]>([]);
  const [userInput, setUserInput] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [state] = useState("NSW"); // NSW hardcoded

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

  useEffect(() => {
    console.log("🧪 API base from env:", process.env.NEXT_PUBLIC_API_BASE);
  }, []);

  const handleMatchField = async () => {
    try {
      const res = await fetch("/api/match-field", {
        method: "POST",
        body: JSON.stringify({ text: userInput }),
        headers: { "Content-Type": "application/json" },
      });
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      const matchedField =
        typeof data.field === "string" && data.field.trim() ? data.field : "General Law";
      console.log("🎯 Matched field:", matchedField);
      setSelectedField(matchedField);
    } catch (err) {
      console.warn("Matcher error:", err);
      setSelectedField("General Law");
    }
  };

  useEffect(() => {
    if (!selectedField || selectedField.trim() === "" || selectedField.length < 2) {
      console.warn("⛔ selectedField is invalid:", selectedField);
      return;
    }

    if (!userInput.trim()) {
      console.warn("⚠️ userInput (summary) is empty — not sending request");
      return;
    }

    const params = new URLSearchParams({
      field: selectedField,
      summary: userInput,
      state: "NSW", // Hardcoded state
    });
    if (postcode) params.append("postcode", postcode);

    console.log("📡 Fetching barristers with:", selectedField);
    const url = `${apiBase}/api/barristers?${params.toString()}`;
    console.log("📡 GET", url);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ API error:", text);
          throw new Error("Failed to fetch barristers");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Got barristers:", data);
        setBarristers(data);
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [selectedField, postcode, userInput]);

  const sortedBarristers = [...barristers].sort((a, b) => {
    try {
      const scoreA = JSON.parse(a.reasoning_score_by_field || "{}")[selectedField ?? ""] || 0;
      const scoreB = JSON.parse(b.reasoning_score_by_field || "{}")[selectedField ?? ""] || 0;
      return scoreB - scoreA;
    } catch {
      return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col items-center py-12 px-4 w-full px-8 mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Lawyer Match
        </h1>

        {/* Role selector */}
        <div className="mb-6 w-full max-w-xl">
          <div className="flex items-center gap-8">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked
                readOnly
                className="w-4 h-4 accent-blue-700"
                aria-checked="true"
                aria-label="Barrister selected"
              />
              <span className="font-medium text-gray-900 dark:text-white">Barrister</span>
            </label>

            <label
              className="inline-flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="Coming soon"
            >
              <input
                type="checkbox"
                disabled
                className="w-4 h-4"
                aria-checked="false"
                aria-label="Solicitor (coming soon)"
              />
              <span className="font-medium text-gray-700 dark:text-gray-300">Solicitor</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(coming soon)</span>
            </label>
          </div>
        </div>

        {/* User input and controls */}
        <div className="mb-10 w-full max-w-xl">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe your legal issue here..."
            className="w-full p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white"
            rows={4}
          />

          <select
            value={state}
            onChange={() => {}} // prevent interaction
            disabled
            className="w-full mt-2 p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white"
          >
            <option value="NSW">NSW</option>
          </select>

          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter your postcode (optional)"
            className="w-full mt-2 p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white"
          />

          <button
            onClick={handleMatchField}
            className="mt-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Search
          </button>
        </div>

        {/* Results */}
        {selectedField && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Top Barristers for {selectedField}
            </h2>

            <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
              {sortedBarristers.map((b, index) => {
                let ratingDisplay = "–";
                try {
                  if (b.reasoning_score_by_field) {
                    const parsed = JSON.parse(b.reasoning_score_by_field);
                    const score = parsed[selectedField ?? ""];
                    if (typeof score === "number") {
                      ratingDisplay = `${Math.round(score * 100)}%`;
                    }
                  }
                } catch {
                  ratingDisplay = "–";
                }

                const isOpen = expanded === index;

                return (
                  <div
                    key={index}
                    className="p-4 border rounded dark:border-gray-700 shadow dark:bg-gray-900"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {b.barrister_name}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                      Match: {ratingDisplay}
                    </p>
                    {b.address && (
                      <p className="text-gray-700 dark:text-gray-300 mb-1">
                        📍 {b.address}
                      </p>
                    )}
                    {b.phone && (
                      <p className="text-gray-700 dark:text-gray-300 mb-1">
                        📞 {b.phone}
                      </p>
                    )}

                    {isOpen && (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 mb-1">
                          Field(s): {b.inferred_field_of_law || "–"}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-1">
                          Cases: {b.num_cases ?? 0}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-1">
                          Last Active: {b.most_recent_year || "–"}
                        </p>
                      </>
                    )}

                    <button
                      onClick={() => setExpanded(isOpen ? null : index)}
                      className="mt-3 w-fit px-4 py-2 rounded 
                        bg-gray-200 hover:bg-gray-300 text-black 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white 
                        font-medium transition"
                    >
                      {isOpen ? "See less" : "See more"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
