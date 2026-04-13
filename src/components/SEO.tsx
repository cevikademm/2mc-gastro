import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, buildHreflangs } from '../lib/seo';

type Props = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object | object[];
};

const MANAGED = 'data-seo-managed';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(MANAGED, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
}

function clearManagedJsonLd() {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED}]`)
    .forEach((n) => n.remove());
}

function addJsonLd(data: object) {
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.setAttribute(MANAGED, '1');
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

export default function SEO({
  title,
  description,
  image,
  canonical,
  noindex,
  type = 'website',
  jsonLd,
}: Props) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const img = image || DEFAULT_OG_IMAGE;
    const path = canonical || location.pathname + location.search;
    const canonicalUrl = path.startsWith('http') ? path : `${SITE_URL}${path}`;

    document.title = fullTitle;

    if (description) upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    if (description) upsertMeta('property', 'og:description', description);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:image', img);
    if (description) upsertMeta('name', 'twitter:description', description);

    upsertLink('canonical', canonicalUrl);

    // hreflang
    document.head
      .querySelectorAll(`link[rel="alternate"][${MANAGED}]`)
      .forEach((n) => n.remove());
    buildHreflangs(location.pathname).forEach(({ hreflang, href }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      link.setAttribute(MANAGED, '1');
      document.head.appendChild(link);
    });

    // JSON-LD
    clearManagedJsonLd();
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      arr.forEach(addJsonLd);
    }
  }, [title, description, image, canonical, noindex, type, jsonLd, location.pathname, location.search]);

  return null;
}
