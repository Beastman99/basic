"use client";

import React from "react";

export default function DashboardPreview() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg shadow-lg bg-[#1b1b1b] p-6 border border-gray-700">
      <h2 className="text-xl text-white font-bold mb-4">Best Matched Lawyers</h2>
      <div className="space-y-4">
        {[
          { 
            name: "Sarah Hudson", 
            field: "Criminal Law", 
            years: 9, 
            rating: 8.4, 
            match: 73,
            img: "/images/woman_attorney.webp"
          },
          { 
            name: "David Lee", 
            field: "Family Law", 
            years: 7, 
            rating: 7.9, 
            match: 89,
            img: "/images/man_attorney.webp"
          },
          { 
            name: "John Goldstein", 
            field: "Civil Law", 
            years: 12, 
            rating: 5.2, 
            match: 64,
            img: "https://ui-avatars.com/api/?name=John+Goldstein&background=1b1b1b&color=ffffff&rounded=true"
          },
        ].map((barrister) => (
          <div
            key={barrister.name}
            className="bg-[#f5f5f0] rounded p-4 flex flex-col sm:grid sm:grid-cols-[2fr,1fr,1fr] items-center sm:items-start gap-4 shadow hover:bg-gray-100 transition"
          >
            {/* left column */}
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-[#1b1b1b]">{barrister.name}</h3>
              <p className="text-sm text-[#1b1b1b]">
                {barrister.field} • {barrister.years} yrs experience
              </p>
            </div>

            {/* middle column */}
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1b1b1b]">
                Match
              </span>
              <div className="text-2xl font-bold text-[#1b1b1b]">{barrister.match}%</div>
            </div>

            {/* right column */}
            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              <img 
                src={barrister.img} 
                alt={`${barrister.name} profile`} 
                className="w-16 h-16 rounded-full border border-gray-400 object-cover aspect-square"
              />
              <button
                className="text-xs sm:text-sm px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition w-full sm:w-auto"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
