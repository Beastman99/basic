import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { getArticleBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  const { getAllArticles } = await import("@/lib/mdx");
  return getAllArticles().map((post) => ({ slug: post.slug }));
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { frontmatter, content } = getArticleBySlug(params.slug);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Header />
      <main className="bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 min-h-screen">
        <section className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-32">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white mb-10">
            {frontmatter.title}
          </h1>

          {frontmatter.date && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-14">
              {new Date(frontmatter.date).toLocaleDateString("en-AU", {
                dateStyle: "long",
              })}
            </p>
          )}

          <div className="space-y-8 text-lg leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic">
  <MDXRemote source={content} />
</div>

        </section>
      </main>
      <Footer />
    </ThemeProvider>
  );
}
