"use client";

import React from "react";

export default function CasePredictionResult() {
  // you could pass these in via props later if you want
  const prediction = {
    successChance: 75,
    costs: "$12,000 – $22,000",
    timeframe: "4 to 8 months",
    compensation: "$25,000 – $45,000",
    recommended: "Engaging a barrister specialising in unfair dismissal within the next 2 weeks.",
  };

  return (
    <div className="max-w-xl mx-auto bg-[#f5f5f0] rounded-lg p-6 shadow border border-gray-300">
      <h2 className="text-xl font-bold text-[#1b1b1b] mb-4">Your Case Prediction</h2>

      <div className="space-y-3 text-[#1b1b1b]">
        <div className="flex justify-between">
          <span className="font-semibold">Likely Outcome:</span>
          <span className="font-bold">{prediction.successChance}%</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Estimated Legal Costs:</span>
          <span>{prediction.costs}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Estimated Time to Resolution:</span>
          <span>{prediction.timeframe}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Likely Compensation:</span>
          <span className="font-bold">{prediction.compensation}</span>
        </div>

        <div className="mt-4 text-sm italic">
          {prediction.recommended}
        </div>

        <button className="mt-4 text-sm px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition">
          Find Barrister
        </button>
      </div>
    </div>
  );
}
