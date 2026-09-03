import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EventProgramming } from "../components/home/EventProgramming";
import { FeaturedEvent } from "../components/home/FeaturedEvent";
import { HomeHeader } from "../components/home/HomeHeader";
import { HomeHero } from "../components/home/HomeHero";
import { LoadingState } from "../components/ui/LoadingState";
import { api } from "../services/api";
import type { Event } from "../types/event";
import { waitForMinimumDuration } from "../utils/minimum-delay";
import "../styles/home-v2.css";

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const startedAt = performance.now();

      try {
        const { data } = await api.get<Event[]>("/events");
        setEvents(data);
      } finally {
        await waitForMinimumDuration(startedAt);
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return events;

    return events.filter((event) =>
      [event.title, event.venueName, event.venueAddress]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [events, search]);

  const featuredEvent = filteredEvents[0];
  const remainingEvents = filteredEvents.slice(1);

  if (loading) {
    return (
      <main className="home-v2">
        <header className="home-v2-header">
          <Link to="/" className="brand">
            ELITE<span>/TICKETS</span>
          </Link>
        </header>
        <LoadingState variant="home" />
      </main>
    );
  }

  return (
    <main className="home-v2">
      <HomeHeader />
      <HomeHero search={search} onSearchChange={setSearch} />

      {featuredEvent && <FeaturedEvent event={featuredEvent} />}

      <EventProgramming
        events={remainingEvents}
        totalCount={filteredEvents.length}
        hasFeatured={Boolean(featuredEvent)}
      />
    </main>
  );
}