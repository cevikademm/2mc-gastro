#!/usr/bin/env node
// Scaffold a new blog post entry in src/content/blog/posts.ts
// Usage: node scripts/new-blog-post.mjs "slug-buraya" "Başlık Buraya"

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_FILE = resolve(ROOT, 'src/content/blog/posts.ts');

const slug = process.argv[2];
const title = process.argv[3];

if (!slug || !title) {
  console.error('Usage: node scripts/new-blog-post.mjs "slug" "Başlık"');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('Slug yalnızca küçük harf, rakam ve tire içermelidir.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const template = `  {
    slug: '${slug}',
    title: '${title.replace(/'/g, "\\'")}',
    description:
      'TODO: 150-160 karakterlik meta description. Anahtar kelimeyi başa koyun.',
    excerpt:
      'TODO: 1-2 cümlelik giriş metni. Okuyucunun devamını merak edeceği bir kanca yazın.',
    category: 'TODO',
    tags: ['TODO'],
    author: '2MC Gastro',
    datePublished: '${today}',
    readingMinutes: 8,
    image: '/logo-2mc-gastro.jpeg',
    body: \`## Giriş

TODO: Açılış paragrafı. Okuyucu neden bu yazıyı okumalı?

## Ana Bölüm 1

TODO: İçerik.

## Ana Bölüm 2

TODO: İçerik.

## Sonuç

TODO: Özet + CTA.\`,
    faq: [
      {
        question: 'TODO: Soru 1?',
        answer: 'TODO: Yanıt.',
      },
    ],
  },`;

let src = readFileSync(POSTS_FILE, 'utf8');

if (src.includes(`slug: '${slug}'`)) {
  console.error(`Slug "${slug}" zaten mevcut.`);
  process.exit(1);
}

const marker = 'BLOG_POSTS: BlogPost[] = [';
const idx = src.indexOf(marker);
if (idx === -1) {
  console.error('BLOG_POSTS array bulunamadı.');
  process.exit(1);
}

const insertAt = idx + marker.length;
src = src.slice(0, insertAt) + '\n' + template + src.slice(insertAt);

writeFileSync(POSTS_FILE, src, 'utf8');
console.log(`✅ Blog post scaffold eklendi: ${slug}`);
console.log(`📝 Düzenle: src/content/blog/posts.ts`);
console.log(`🌐 URL: /blog/${slug}`);
