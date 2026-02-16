"use client";

import Image from "next/image";

export default function AccordionReplacement() {
  return (
    <div className="w-[90%] mx-auto rounded-lg overflow-hidden">

      <Image
        src="/images/gav.png"
        alt="Isogav Trans"
        width={800}
        height={600}
        className="object-cover w-full h-auto"
      />
    </div>
  );
}
