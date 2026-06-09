import type { MetadataRoute } from "next";

const routes = [
  "",
  "/pricing",
  "/docs",
  "/docs/api",
  "/security",
  "/integrations",
  "/contact",
  "/demo",
  "/privacy",
  "/terms",
  "/support",
  "/customers",
  "/llms.txt"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `http://localhost:3001${route}`,
    lastModified: new Date("2026-06-01T00:00:00.000Z"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));
}

