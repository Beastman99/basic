import React from "react";
import FeatureCard from "./FeatureCard";
import { FaGavel, FaBalanceScale, FaHandshake } from "react-icons/fa";
import { MdOutlineHowToVote } from "react-icons/md";

const Features = () => {
  const features = [
    {
      icon: FaGavel,
      title: "Lawyer Match",
      description: "Find lawyers with a proven track record relevant to your specific issue.",
    },
    {
      icon: FaBalanceScale,
      title: "Case Predictor",
      description: "Estimate your potential legal outcomes and using past case data.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <p className="mt-8 text-xl text-gray-600 dark:text-gray-300 font-light">
            Empowering you with data-backed legal confidence. Use them to understand,
            plan, and choose the best legal pathways at no cost.
          </p>
        </div>
        <div className="mt-10">
          {/* ✅ Force 2 columns on desktop for a clean 2x2 layout */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
