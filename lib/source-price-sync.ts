import { prisma } from "@/lib/prisma";
import { getFallbackMetadataMap, setFallbackMetadata } from "@/lib/product-metadata-fallback";

interface ParsedSourcePrice {
  regularPriceKrw: number | null;
  salePriceKrw: number | null;
  saleEndsAt: string | null;
  saleDetected: boolean;
}

interface FxRates {
  usd: number;
  aed: number;
}

export interface ProductSyncResult {
  productId: string;
  name: string;
  sourceUrl: string;
  status: "updated" | "skipped" | "failed";
  message: string;
  oldPriceUsd: number;
  newPriceUsd: number;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function parseDateToken(token: string) {
  const normalized = token.trim().replace(/[^\d.\/-]/g, "");
  const parts = normalized.split(/[.\/-]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 3) return null;
  let year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 100) year += 2000;
  const iso = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}T23:59:59.000Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function extractSaleEndDate(text: string) {
  const patterns = [
    /(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})\s*[~\-to]+\s*(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/gi,
    /(until|마감|종료|까지)\s*(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/gi,
    /(세일|할인)[^0-9]{0,16}(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})\s*[~\-]+\s*(\d{2,4}[./-]\d{1,2}[./-]\d{1,2})/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null = pattern.exec(text);
    while (match) {
      const maybeEnd = parseDateToken(match[3] || match[2] || match[1] || "");
      if (maybeEnd) return maybeEnd;
      match = pattern.exec(text);
    }
  }
  return null;
}

function extractNearestKrwAfterLabel(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${escaped}[\\s\\S]{0,80}?([0-9]{1,3}(?:,[0-9]{3})+)\\s*원`,
    "i"
  );
  const match = pattern.exec(text);
  if (!match) return null;
  const numeric = Number((match[1] || "").replace(/,/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric;
}

function extractKrwPrices(text: string) {
  const priceSet = new Set<number>();
  const regexes = [
    /([0-9]{1,3}(?:,[0-9]{3})+)\s*원/g,
    /₩\s*([0-9]{1,3}(?:,[0-9]{3})+)/g,
    /KRW\s*([0-9]{1,3}(?:,[0-9]{3})+)/gi,
  ];
  for (const pattern of regexes) {
    let match: RegExpExecArray | null = pattern.exec(text);
    while (match) {
      const numeric = Number((match[1] || "").replace(/,/g, ""));
      if (Number.isFinite(numeric) && numeric > 0) priceSet.add(numeric);
      match = pattern.exec(text);
    }
  }
  return Array.from(priceSet).sort((a, b) => a - b);
}

function parseSourcePage(html: string, sourceUrl: string): ParsedSourcePrice {
  const compactText = normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
  const host = (() => {
    try {
      return new URL(sourceUrl).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (host.includes("oliveyoung")) {
    const lowered = compactText.toLowerCase();
    const saleDetected =
      lowered.includes("sale") || compactText.includes("세일") || compactText.includes("할인");
    const regularByLabel =
      extractNearestKrwAfterLabel(compactText, "판매가") ||
      extractNearestKrwAfterLabel(compactText, "정가") ||
      extractNearestKrwAfterLabel(compactText, "정상가");
    const saleByLabel =
      extractNearestKrwAfterLabel(compactText, "최저가") ||
      extractNearestKrwAfterLabel(compactText, "할인가") ||
      extractNearestKrwAfterLabel(compactText, "혜택가");
    const prices = extractKrwPrices(compactText);
    const saleEndsAt = saleDetected ? extractSaleEndDate(compactText) : null;
    return {
      regularPriceKrw: regularByLabel || (prices.length ? Math.max(...prices) : null),
      salePriceKrw:
        saleByLabel || (saleDetected && prices.length >= 2 ? Math.min(...prices) : null),
      saleEndsAt,
      saleDetected,
    };
  }

  const lowered = html.toLowerCase();
  const saleDetected =
    lowered.includes("sale") || html.includes("세일") || html.includes("할인");
  const prices = extractKrwPrices(compactText);
  const saleEndsAt = saleDetected ? extractSaleEndDate(compactText) : null;

  if (prices.length === 0) {
    return {
      regularPriceKrw: null,
      salePriceKrw: null,
      saleEndsAt,
      saleDetected,
    };
  }

  if (saleDetected && prices.length >= 2) {
    return {
      regularPriceKrw: Math.max(...prices),
      salePriceKrw: Math.min(...prices),
      saleEndsAt,
      saleDetected,
    };
  }

  return {
    regularPriceKrw: prices[0],
    salePriceKrw: null,
    saleEndsAt,
    saleDetected,
  };
}

async function fetchFxRatesFromKrw(): Promise<FxRates> {
  const response = await fetch("https://open.er-api.com/v6/latest/KRW", {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`FX request failed (${response.status})`);
  }
  const data = (await response.json()) as {
    rates?: { USD?: number; AED?: number };
  };
  const usd = Number(data?.rates?.USD || 0);
  const aed = Number(data?.rates?.AED || 0);
  if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(aed) || aed <= 0) {
    throw new Error("Invalid FX rates for USD/AED");
  }
  return { usd, aed };
}

async function syncOneProduct(
  product: {
    id: string;
    name: string;
    price: number;
    sourceUrl: string;
  },
  fx: FxRates
): Promise<ProductSyncResult> {
  try {
    const sourceHost = (() => {
      try {
        return new URL(product.sourceUrl).hostname.toLowerCase();
      } catch {
        return "";
      }
    })();
    if (!sourceHost.includes("oliveyoung")) {
      throw new Error("Only Olive Young source URLs are supported for this sync.");
    }

    const sourceResponse = await fetch(product.sourceUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NoorSeoulPriceSync/1.0; +https://noorseoul.local)",
      },
    });
    if (!sourceResponse.ok) {
      throw new Error(`Source page request failed (${sourceResponse.status})`);
    }
    const html = await sourceResponse.text();
    const parsed = parseSourcePage(html, product.sourceUrl);
    if (!parsed.regularPriceKrw) {
      throw new Error("Could not find KRW price on source page");
    }

    const now = Date.now();
    const saleDeadlineMs = parsed.saleEndsAt ? new Date(parsed.saleEndsAt).getTime() : null;
    const saleIsActive = Boolean(
      parsed.saleDetected &&
        parsed.salePriceKrw &&
        parsed.salePriceKrw > 0 &&
        (!saleDeadlineMs || saleDeadlineMs >= now)
    );

    const effectiveKrw = saleIsActive ? parsed.salePriceKrw! : parsed.regularPriceKrw;
    const usdPrice = roundCurrency(effectiveKrw * fx.usd);
    const aedPrice = roundCurrency(effectiveKrw * fx.aed);
    const regularUsd = roundCurrency(parsed.regularPriceKrw * fx.usd);
    const regularAed = roundCurrency(parsed.regularPriceKrw * fx.aed);

    const originalPrice = saleIsActive ? regularUsd : null;
    const originalPriceAed = saleIsActive ? regularAed : undefined;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: usdPrice,
        originalPrice,
      },
    });

    await setFallbackMetadata(product.id, {
      priceAed: aedPrice,
      originalPriceAed,
      sourcePriceCurrency: "KRW",
      saleEndsAt: saleIsActive ? parsed.saleEndsAt || undefined : undefined,
      sourceLastSyncedAt: new Date().toISOString(),
      sourceSyncError: "",
    });

    return {
      productId: product.id,
      name: product.name,
      sourceUrl: product.sourceUrl,
      status: "updated",
      message: saleIsActive
        ? `Updated with active sale${parsed.saleEndsAt ? ` until ${parsed.saleEndsAt}` : ""}`
        : "Updated with regular price (no active sale)",
      oldPriceUsd: product.price,
      newPriceUsd: usdPrice,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await setFallbackMetadata(product.id, {
      sourcePriceCurrency: "KRW",
      sourceLastSyncedAt: new Date().toISOString(),
      sourceSyncError: message,
    });
    return {
      productId: product.id,
      name: product.name,
      sourceUrl: product.sourceUrl,
      status: "failed",
      message,
      oldPriceUsd: product.price,
      newPriceUsd: product.price,
    };
  }
}

export async function syncProductPricesFromSourceUrls(options?: {
  productId?: string;
  limit?: number;
}) {
  const metadataMap = await getFallbackMetadataMap();
  const products = await prisma.product.findMany({
    where: options?.productId ? { id: options.productId } : undefined,
    select: {
      id: true,
      name: true,
      price: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const candidates = products
    .map((product) => ({
      ...product,
      sourceUrl: (metadataMap[product.id]?.sourceUrl || "").trim(),
    }))
    .filter((product) => Boolean(product.sourceUrl));

  const limited =
    typeof options?.limit === "number" && options.limit > 0
      ? candidates.slice(0, options.limit)
      : candidates;

  if (limited.length === 0) {
    return {
      ok: true,
      totalCandidates: 0,
      updated: 0,
      failed: 0,
      skipped: candidates.length,
      results: [] as ProductSyncResult[],
      message: "No products have source URLs configured.",
    };
  }

  const fx = await fetchFxRatesFromKrw();
  const results: ProductSyncResult[] = [];
  for (const product of limited) {
    const result = await syncOneProduct(product, fx);
    results.push(result);
  }

  const updated = results.filter((result) => result.status === "updated").length;
  const failed = results.filter((result) => result.status === "failed").length;
  return {
    ok: true,
    totalCandidates: limited.length,
    updated,
    failed,
    skipped: candidates.length - limited.length,
    rates: fx,
    results,
  };
}
