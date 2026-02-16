// /lib/mdx.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const getAllArticles = () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'content'));

  return files.map((filename) => {
    const slug = filename.replace('.mdx', '');
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), 'content', filename),
      'utf-8'
    );
    const { data } = matter(fileContent);

    return {
      slug,
      frontmatter: data
    };
  });
};

export const getArticleBySlug = (slug: string) => {
  const markdownWithMeta = fs.readFileSync(
    path.join(process.cwd(), 'content', slug + '.mdx'),
    'utf-8'
  );

  const { data, content } = matter(markdownWithMeta);
  return { frontmatter: data, content };
};
