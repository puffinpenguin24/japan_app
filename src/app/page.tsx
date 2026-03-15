"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Baby, Filter, Heart, MapPin, Sparkles, Sun, Snowflake,
  Users, Clock, Lightbulb, AlertTriangle, Database, FileText
} from "lucide-react";
import { getFilteredItineraries } from "@/lib/dataSources";
import { validateItineraryLogic, TravelConstraints } from "@/utils/itineraryLogic";

// Types
type TravelerType = "Kids <5" | "Teens" | "Couples" | "Friends";
type Season = "Summer" | "Winter";
type DurationOption = 5 | 10 | 15;

// Map UI types to Logic Gate types
const travelerTypeMap: Record<TravelerType, TravelConstraints['travelerType']> = {
  "Kids <5": "family_young_kids",
  "Teens": "family_teenagers",
  "Couples": "friends_couples",
  "Friends": "friends_couples"
};

const crimson = "#DC143C";

const travelerTypeConfig: Record<TravelerType, { label: string; icon: React.ElementType; description: string }> = {
  "Kids <5": { label: "Families with Little Kids", icon: Baby, description: "Stroller-friendly routes, short hops, and play time." },
  "Teens": { label: "Families with Teens", icon: Sparkles, description: "Anime, arcades, snow, and city energy." },
  "Couples": { label: "Couples", icon: Heart, description: "Onsen retreats, lantern alleys, and slow mornings." },
  "Friends": { label: "Friends", icon: Users, description: "Shared plates, nightlife, and flexible plans." },
};

const seasonConfig: Record<Season, { label: string; icon: React.ElementType }> = {
  Summer: { label: "Summer", icon: Sun },
  Winter: { label: "Winter", icon: Snowflake },
};

export default function Home() {
  const [selectedTravelerType, setSelectedTravelerType] = useState<TravelerType>("Kids <5");
  const [selectedSeason, setSelectedSeason] = useState<Season>("Summer");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(5);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Hybrid data: Local itineraries + RAG (knowledge_base PDFs)
  const { itineraries: filteredItineraries, sourcesUsed, knowledgeBySourceId } = useMemo(
    () =>
      getFilteredItineraries({
        travelerType: selectedTravelerType,
        season: selectedSeason,
        duration: selectedDuration,
      }),
    [selectedTravelerType, selectedSeason, selectedDuration]
  );

  // Handle Logic Gates (The "G" in RAG - Grounding/Guardrails)
  useEffect(() => {
    const constraints: TravelConstraints = {
      duration: selectedDuration === 15 ? 10 : selectedDuration as 5 | 10,
      travelerType: travelerTypeMap[selectedTravelerType],
      season: selectedSeason.toLowerCase() as 'summer' | 'winter'
    };

    const allActivities = filteredItineraries.flatMap(itinerary => itinerary.days);
    const validation = validateItineraryLogic(constraints, allActivities);
    
    setWarnings(validation.warnings);
  }, [selectedTravelerType, selectedSeason, selectedDuration, filteredItineraries]);

  const currentTravelerConfig = travelerTypeConfig[selectedTravelerType];
  const currentSeasonConfig = seasonConfig[selectedSeason];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-full max-w-xs border-r border-neutral-200 bg-white/95 px-6 py-8 shadow-sm lg:block">
          <div className="mb-8 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: crimson }}>
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-neutral-500 text-nowrap">JAPAN TRAVEL APP</p>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Japan-Go!</h1>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Traveler Type</h2>
            <div className="space-y-2">
              {(Object.keys(travelerTypeConfig) as TravelerType[]).map((type) => {
                const config = travelerTypeConfig[type];
                const Icon = config.icon;
                const isActive = selectedTravelerType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTravelerType(type)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${isActive ? "border-transparent bg-neutral-900 text-white shadow-md" : "border-neutral-200 hover:border-neutral-400"}`}
                  >
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">{type}</p>
                      <p className={`text-[11px] mt-0.5 ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Season</h2>
            <div className="flex gap-2">
              {(Object.keys(seasonConfig) as Season[]).map((season) => {
                const Icon = seasonConfig[season].icon;
                return (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full border text-xs font-bold ${selectedSeason === season ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600"}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {season}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Duration</h2>
            <div className="flex gap-2">
              {[5, 10, 15].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDuration(d as DurationOption)}
                  className={`flex-1 py-2 rounded-full border text-xs font-bold ${selectedDuration === d ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600"}`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-5 py-6 lg:px-10">
          
          {/* LOGIC GATE WARNINGS */}
          {warnings.length > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Travel Insights & Constraints</h3>
              </div>
              <ul className="space-y-2">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Selection Status Bar + Hybrid Data Sources */}
          <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3">
             <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="flex items-center gap-2 text-sm font-bold"><currentTravelerConfig.icon className="h-4 w-4"/> {selectedTravelerType}</span>
                  <span className="hidden sm:inline text-neutral-300">|</span>
                  <span className="flex items-center gap-2 text-sm font-bold"><currentSeasonConfig.icon className="h-4 w-4"/> {selectedSeason}</span>
                  <span className="hidden sm:inline text-neutral-300">|</span>
                  <span className="flex items-center gap-2 text-sm font-bold"><Clock className="h-4 w-4"/> {selectedDuration} Days</span>
                </div>
             </div>
             <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Data sources (hybrid)</span>
                <span className="flex items-center gap-1.5 rounded-full bg-neutral-800 text-white px-3 py-1.5 text-xs font-semibold">
                  <Database className="h-3.5 w-3.5" /> Local plans
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-neutral-800 text-white px-3 py-1.5 text-xs font-semibold">
                  <FileText className="h-3.5 w-3.5" /> Knowledge base (PDFs)
                </span>
             </div>
          </div>

          <section className="space-y-8">
            {/* Render Itineraries if found */}
            {filteredItineraries.map((itinerary) => (
              <article key={itinerary.id} className="rounded-3xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{itinerary.title}</h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 text-white px-2.5 py-1 text-[10px] font-semibold">
                      <Database className="h-3 w-3" /> {itinerary.sourceType === "local" ? "Local plan" : "From PDFs"}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">{itinerary.summary}</p>
                  {/* Grounded in knowledge_base (RAG sources) */}
                  {itinerary.sources && itinerary.sources.length > 0 && (
                    <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Grounded in knowledge base (PDFs)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {itinerary.sources.map((sourceId) => {
                          const entry = knowledgeBySourceId[sourceId];
                          if (!entry) return null;
                          return (
                            <div key={sourceId} className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 min-w-0 max-w-md">
                              <p className="text-xs font-semibold text-neutral-800">{entry.title}</p>
                              {entry.snippet && (
                                <p className="text-[11px] text-neutral-600 mt-1 italic">&ldquo;{entry.snippet}&rdquo;</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="space-y-8">
                    {itinerary.days.map((day) => (
                      <div key={day.day} className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold text-sm">
                            D{day.day}
                          </div>
                          <div className="w-px h-full bg-neutral-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-8">
                          <h4 className="font-bold text-lg mb-1">{day.title}</h4>
                          <div className="flex gap-4 text-xs text-neutral-500 mb-4">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {day.location}</span>
                            {day.timeOfDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {day.timeOfDay}</span>}
                          </div>
                          <ul className="space-y-2 mb-4">
                            {day.activities.map(act => (
                              <li key={act} className="text-sm text-neutral-700 flex items-start gap-2">
                                <span className="mt-2 h-1 w-1 rounded-full bg-neutral-400 shrink-0" />
                                {act}
                              </li>
                            ))}
                          </ul>
                          <div className="bg-neutral-50 p-4 rounded-2xl flex gap-3 border border-neutral-100">
                             <Lightbulb className="h-5 w-5 text-amber-500 shrink-0"/>
                             <div>
                                <p className="text-[10px] font-bold uppercase text-neutral-400">Pro Tip</p>
                                <p className="text-xs text-neutral-600 italic">{day.proTip}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            {/* Empty State: Shown when no grounded itineraries match filters */}
            {filteredItineraries.length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Filter className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Expert Route Synthesis Required</h3>
                <p className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Our RAG engine currently prioritizes 5 and 10-day verified routes to ensure 100% geographical accuracy. 
                  <br /><br />
                  <span className="font-semibold text-neutral-800 italic">Demo Tip:</span> Try selecting <span className="underline">10 Days</span> to see our grounded Kansai-Kanto family itinerary!
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}