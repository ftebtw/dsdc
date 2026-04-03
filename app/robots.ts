import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/portal/", "/studio/"],
      },
    ],
    sitemap: "https://dsdc.ca/sitemap.xml",
    host: "https://dsdc.ca",
  };
}
