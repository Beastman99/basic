"use client";
import Link from "next/link";
import React from "react";

const CasePredictionDashboard: React.FC = () => {
  return (
    <div className="w-full max-w-xl rounded-2xl shadow-xl border border-gray-300 dark:border-gray-600 p-6 bg-white dark:bg-[#f5f5f0] space-y-6 transition-colors">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#1b1b1b] dark:text-black">
          Estimated Case Outcome
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-700">
          Based on LawBroke’s data-driven case analysis
        </p>
      </div>
      <div className="bg-green-50 border border-green-300 rounded-lg p-4 space-y-1">
        <span className="text-xs text-green-800 uppercase font-medium">
          Predicted Compensation
        </span>
        <div className="text-3xl font-bold text-green-900">$19,564.00</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-gray-500 dark:text-gray-700">Case Type</div>
          <div className="font-medium text-[#1b1b1b] dark:text-[#1b1b1b]">
            Personal Injury
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500 dark:text-gray-700">Recommended Approach</div>
          <div className="font-medium text-[#1b1b1b] dark:text-[#1b1b1b]">
            Litigation
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500 dark:text-gray-700">Next Steps</div>
          <div className="font-medium text-[#1b1b1b] dark:text-[#1b1b1b]">
            Choose Lawyer
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500 dark:text-gray-700">Estimated Duration</div>
          <div className="font-medium text-[#1b1b1b] dark:text-[#1b1b1b]">
            6 months
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="text-gray-500 dark:text-gray-700">Estimated Legal Costs</div>
          <div className="font-medium text-[#1b1b1b] dark:text-[#1b1b1b]">$7,600</div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <Link
  href="/FindLawyer"
  className="flex-1 rounded-xl px-4 py-2 border border-[#1b1b1b] dark:border-[#1b1b1b]
  bg-white text-[#1b1b1b] dark:bg-[#f5f5f0] dark:text-[#1b1b1b]
  hover:bg-[#1b1b1b] hover:text-white
  dark:hover:bg-[#1b1b1b] dark:hover:text-white
  transition font-semibold text-base text-center"
>
  Choose Lawyer
</Link>

      </div>
    </div>
  );
};

export default CasePredictionDashboard;
