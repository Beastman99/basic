// app/Articles/page.tsx

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getAllArticles } from "@/lib/mdx";

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
      <main className="flex flex-col px-4 py-10 max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Articles</h1>
        <ul className="space-y-6">
          {articles.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <Link href={`/articleslugs/${slug}`}>
                <div className="group cursor-pointer">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:underline">
                    {frontmatter.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {frontmatter.meta_description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
