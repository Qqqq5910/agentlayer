import type { ScanOptions, SiteScan } from "../schemas.js";

export type CrawlerName = ScanOptions["crawler"];

export type Crawler = {
  name: CrawlerName;
  scan(options: ScanOptions): Promise<SiteScan>;
};
