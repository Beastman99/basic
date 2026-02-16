import Image from "next/image";
import Link from "next/link";

const Download: React.FC = () => (
  <section className="container mx-auto py-24 px-4 md:px-6">
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-1/2 order-1 p-4 flex justify-center md:justify-start items-center">
        <Image
          src="/images/isotrans.png"
          alt="Isometric illustration showing litigation funding for investors"
          width={2000}
          height={2000}
          className="w-4/5 h-auto mx-auto"
        />
      </div>
      <div className="w-full md:w-1/2 order-2 flex justify-center md:justify-end">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
            Decentralised litigation funding
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-300 mb-6 font-light">
            Back cases for as little as $199 and earn returns while promoting justice. Our tools make it easy and
            transparent.
          </p>
          <Link
            href="/signup"
            className="w-fit bg-green-700 text-white px-6 py-3 rounded-md text-base font-semibold hover:bg-green-800 transition"
          >
            Invest
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default Download;
