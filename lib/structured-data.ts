import { site } from "@/content/site";
import type { Faq } from "@/content/faqs";
import { services, type Service } from "@/content/services";

export const areaServed = [
  { "@type": "AdministrativeArea", name: "Bucks County" },
  { "@type": "AdministrativeArea", name: "Montgomery County" },
  { "@type": "AdministrativeArea", name: "Lehigh Valley, PA" },
] as const;

export function countyServiceJsonLd(areaName: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: site.name,
    url: site.url,
    email: site.email,
    areaServed: { "@type": "AdministrativeArea", name: areaName },
    founder: {
      "@type": "Person",
      name: site.founder.name,
      jobTitle: `${site.founder.role}, ${site.founder.organization}`,
    },
    parentOrganization: {
      "@type": "Organization",
      name: site.holdingCompany,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: site.name,
    url: site.url,
    email: site.email,
    description: site.description,
    areaServed: [...areaServed],
    founder: {
      "@type": "Person",
      name: site.founder.name,
      jobTitle: `${site.founder.role}, ${site.founder.organization}`,
    },
    parentOrganization: {
      "@type": "Organization",
      name: site.holdingCompany,
    },
  };
}

function publishedPrice(service: Service): Record<string, unknown> {
  switch (service.priceLabel) {
    case "Free":
      return { price: "0", priceCurrency: "USD" };
    case "Quoted":
      return { description: "Quoted" };
    case "$2,500\u2013$7,500":
      return {
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: "2500",
          maxPrice: "7500",
          priceCurrency: "USD",
        },
      };
    case "From $10,000":
      return {
        priceSpecification: {
          "@type": "PriceSpecification",
          minPrice: "10000",
          priceCurrency: "USD",
        },
      };
    case "From $1,500/mo":
      return {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          minPrice: "1500",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      };
    default:
      throw new Error(`No published price mapping for ${service.priceLabel}`);
  }
}

/** ProfessionalService plus the published service list. Rendered on /services. */
export function servicesOfferJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: new URL("/services", site.url).toString(),
    email: site.email,
    areaServed: [...areaServed],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        name: service.name,
        url: new URL(`/services#${service.slug}`, site.url).toString(),
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.brief,
        },
        ...publishedPrice(service),
      })),
    },
  };
}

export function faqJsonLd(items: readonly Faq[], answerText?: (item: Faq) => string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerText ? answerText(item) : item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, site.url).toString(),
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  description: string;
  date: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: new URL(post.path, site.url).toString(),
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}
