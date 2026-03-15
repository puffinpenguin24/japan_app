/**
 * Hybrid data source layer: Local (curated JSON) + RAG (knowledge_base PDFs).
 * Itineraries can come from local data and be grounded in RAG sources.
 */

import localItineraries from "@/data/itineraries.json";
// Use in-src copy so Next.js bundles it (knowledge_base/ is outside src)
import kbIndex from "@/data/knowledgeBaseIndex.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataSourceType = "local" | "rag";

export type ItineraryDay = {
  day: number;
  title: string;
  location: string;
  timeOfDay?: string;
  activities: string[];
  proTip: string;
};

export type Itinerary = {
  id: string;
  travelerType: string;
  season: string;
  durationDays: number;
  title: string;
  summary: string;
  sources?: string[];
  days: ItineraryDay[];
  /** Set by data layer: where this itinerary came from */
  sourceType: DataSourceType;
};

export type KnowledgeBaseEntry = {
  id: string;
  title: string;
  file: string;
  snippet?: string;
};

export type FilterState = {
  travelerType: string;
  season: string;
  duration: number;
};

export type HybridResult = {
  itineraries: Itinerary[];
  /** Which data sources were used */
  sourcesUsed: { local: boolean; rag: boolean };
  /** Resolved KB entries for grounding (id -> entry) */
  knowledgeBySourceId: Record<string, KnowledgeBaseEntry>;
};

// ---------------------------------------------------------------------------
// Knowledge base (RAG source)
// ---------------------------------------------------------------------------

const kbEntries = kbIndex as KnowledgeBaseEntry[];

export function getKnowledgeBaseIndex(): KnowledgeBaseEntry[] {
  return kbEntries;
}

export function getKnowledgeById(): Record<string, KnowledgeBaseEntry> {
  return kbEntries.reduce(
    (acc, entry) => {
      acc[entry.id] = entry;
      return acc;
    },
    {} as Record<string, KnowledgeBaseEntry>
  );
}

// ---------------------------------------------------------------------------
// Local data source
// ---------------------------------------------------------------------------

export function getLocalItineraries(): Itinerary[] {
  return (localItineraries as Omit<Itinerary, "sourceType">[]).map((item) => ({
    ...item,
    sourceType: "local" as DataSourceType,
  }));
}

// ---------------------------------------------------------------------------
// Hybrid: filter and return combined view
// ---------------------------------------------------------------------------

export function getFilteredItineraries(filters: FilterState): HybridResult {
  const local = getLocalItineraries();
  const knowledgeBySourceId = getKnowledgeById();

  const itineraries = local.filter((item) => {
    const matchTraveler = item.travelerType === filters.travelerType;
    const matchSeason = item.season === filters.season;
    const matchDuration = item.durationDays === filters.duration;
    return matchTraveler && matchSeason && matchDuration;
  });

  const hasRagGrounding = itineraries.some(
    (it) => it.sources && it.sources.length > 0
  );

  return {
    itineraries,
    sourcesUsed: {
      local: itineraries.length > 0,
      rag: hasRagGrounding,
    },
    knowledgeBySourceId,
  };
}
