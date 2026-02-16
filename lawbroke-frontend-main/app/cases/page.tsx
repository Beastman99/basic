'use client';

import { useEffect, useState } from 'react';

type Case = {
  case_citation: string;
  field_of_law: string;
  issues_of_law: string;
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test-cases')
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4 text-sm">Loading cases...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Test Cases</h1>
      {cases.map((c, idx) => (
        <div key={idx} className="border p-4 rounded shadow bg-white dark:bg-gray-900">
          <h2 className="font-bold">{c.case_citation}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Field of Law:</strong> {c.field_of_law}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Issues:</strong> {c.issues_of_law}
          </p>
        </div>
      ))}
    </div>
  );
}

