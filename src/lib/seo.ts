export const SITE = {
  author: "Dylan Steele",
  email: "mailto:dylansteele57@gmail.com",
  jobTitle: "Senior Frontend Engineer",
  name: "Dylan Steele",
  url: "https://dsteele.dev",
  description:
    "Senior frontend engineer building accessible web applications, design systems, content platforms, and financial product systems.",
  sameAs: [
    "https://github.com/dills122",
    "https://www.linkedin.com/in/dssteele122/",
    "https://shwimp.studio/",
  ],
  knowsAbout: [
    "Frontend architecture",
    "Accessibility",
    "Design systems",
    "Astro",
    "Angular",
    "Vue",
    "Financial technology",
    "Banking software",
    "Lending software",
    "Insurance technology",
    "Content platforms",
    "Legacy migration",
  ],
};

export const basePath = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const absoluteUrl = (path = "") => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${basePath}${cleanPath}`, SITE.url).toString();
};

export const defaultKeywords = [
  "Dylan Steele",
  "Dylan Steele frontend engineer",
  "Dylan Steele fintech",
  "senior frontend engineer",
  "frontend architecture",
  "accessible web applications",
  "design systems",
  "financial technology",
  "banking applications",
  "lending applications",
  "insurance applications",
  "Astro developer",
];

export const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${absoluteUrl()}#person`,
  name: SITE.name,
  alternateName: "dills122",
  email: SITE.email,
  jobTitle: SITE.jobTitle,
  url: absoluteUrl(),
  sameAs: SITE.sameAs,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Central Pennsylvania",
    addressRegion: "PA",
    addressCountry: "US",
  },
  knowsAbout: SITE.knowsAbout,
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${absoluteUrl()}#website`,
  name: "Dylan Steele",
  alternateName: "dsteele.dev",
  description: SITE.description,
  url: absoluteUrl(),
  inLanguage: "en-US",
  publisher: {
    "@id": `${absoluteUrl()}#person`,
  },
};
