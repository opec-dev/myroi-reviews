"use client";

import { useEffect, useState } from "react";
import { destinationStorageKey, ReviewDestination } from "@/lib/demo-data";

export function ReviewDestinationChooser({ initialDestinations }: { initialDestinations: ReviewDestination[] }) {
  const [destinations, setDestinations] = useState(initialDestinations);
  useEffect(() => {
    function load() {
      const saved = localStorage.getItem(destinationStorageKey);
      if (saved) try { setDestinations(JSON.parse(saved) as ReviewDestination[]); } catch { /* use defaults */ }
    }
    load(); window.addEventListener("storage", load); window.addEventListener("myroi:destinations-updated", load);
    return () => { window.removeEventListener("storage", load); window.removeEventListener("myroi:destinations-updated", load); };
  }, []);
  return <div className="review-buttons">{destinations.filter((item) => item.enabled).map((destination) =>
    <a href={destination.reviewUrl} key={destination.id} target="_blank" rel="noopener noreferrer">
      <span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>
      Review us on {destination.name}<b>↗</b>
    </a>
  )}</div>;
}
