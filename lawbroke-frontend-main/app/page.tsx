import Header from "components/Header";
import Hero from "components/Hero";
import Features from "components/Features";
import Section from "components/Section";
import Link from "next/link";
import Footer from "components/Footer";
import Customers from "components/Customers";
import Accordion from "components/Accordion";
import Download from "components/Download";
import DashboardPreview from "../components/DashboardPreview";
import CasePredictionDashboard from "components/CasePredictionDashboard";


export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main>
        <Hero />
        <Features />
        <Section
          leftHalf={
  <>
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
      Take control of your legal journey
    </h2>
    <p className="text-xl font-light mb-6">
      LawBroke gives you data-driven tools to compare lawyers, and decide which action to take next.
    </p>
    <Link
  href="/FindLawyer"
  className="
    w-fit px-6 py-3 rounded
    bg-gray-900 text-white
    hover:bg-gray-800
    dark:bg-[#f5f5f5] dark:text-gray-900 dark:hover:bg-[#e5e5e5]
    font-semibold transition
  "
>
  Find Lawyer
</Link>

  </>
}
        rightHalf={<DashboardPreview />}

        />


       

<Section
  leftHalf={<CasePredictionDashboard />}
  rightHalf={
    <div className="flex flex-col justify-center items-start max-w-xl">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
        Predict outcomes with confidence
      </h2>
      <p className="text-xl font-light text-gray-900 dark:text-white mb-6">
        Estimate your compensation, timing, and costs before you commit, using LawBroke’s data-driven case predictor.
      </p>
    </div>
  }
/>

        <Customers />
        <Section
          leftHalf={
  <div className="flex flex-col justify-end">
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
      Designed for transparency
    </h2>
    <p className="text-xl font-light mb-6">
      Empower yourself with clear, public court data to make fair and informed choices about your
      representation.
    </p>
  </div>
}
          rightHalf={<Accordion />
            
          }
        />
       
      </main>
      <Footer />
    </div>
  );
}
