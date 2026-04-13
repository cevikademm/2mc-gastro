import { BLOG_POSTS, type BlogPost } from './posts';

let cache: BlogPost[] | null = null;
let cacheAt = 0;
const TTL = 60_000;

export async function loadAllPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;
  try {
    const { supabase } = await import('../../lib/supabase');
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('date_published', { ascending: false });
    if (error) throw error;
    const dbPosts: BlogPost[] = (data || []).map((r: any) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      excerpt: r.excerpt || '',
      category: r.category || 'Genel',
      tags: r.tags || [],
      author: r.author || '2MC Gastro',
      datePublished: (r.date_published || r.created_at || '').slice(0, 10),
      readingMinutes: r.reading_minutes || 5,
      image: r.image || '/logo-2mc-gastro.jpeg',
      body: r.body || '',
      faq: r.faq || [],
    }));
    const seen = new Set(dbPosts.map((p) => p.slug));
    const merged = [...dbPosts, ...BLOG_POSTS.filter((p) => !seen.has(p.slug))];
    cache = merged;
    cacheAt = now;
    return merged;
  } catch {
    return BLOG_POSTS;
  }
}

export async function loadPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const all = await loadAllPosts();
  return all.find((p) => p.slug === slug);
}
