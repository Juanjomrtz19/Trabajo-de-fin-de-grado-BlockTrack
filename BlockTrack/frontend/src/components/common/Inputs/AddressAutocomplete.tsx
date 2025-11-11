import { useEffect, useMemo, useRef, useState } from "react";

type Suggestion = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (chosen: Suggestion) => void;
  placeholder?: string;
  className?: string;
};

export default function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  placeholder = "Escribe una dirección…",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const region = import.meta.env.VITE_LOCATIONIQ_REGION || "eu1";
  const key = import.meta.env.VITE_LOCATIONIQ_KEY;

  const doSearch = useMemo(
    () => async (q: string) => {
      if (!key || !q.trim()) {
        setItems([]);
        return;
      }

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      try {
        const url = `https://${region}.locationiq.com/v1/search?key=${encodeURIComponent(
          key
        )}&q=${encodeURIComponent(
          q
        )}&format=json&limit=5&addressdetails=1&normalizeaddress=1`;
        const res = await fetch(url, {
          signal: ac.signal,
          headers: { "Accept-Language": "es" },
        });
        if (!res.ok) throw new Error("Geocoding error");
        const data = (await res.json()) as any[];
        const mapped: Suggestion[] = data.map((d, i) => ({
          id: String(d.place_id ?? i),
          label: d.display_name,
          lat: Number(d.lat),
          lon: Number(d.lon),
        }));
        setItems(mapped);
        setOpen(true);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.error(e);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [key, region]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (value && value.length >= 3) doSearch(value);
      else {
        setItems([]);
        setOpen(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value, doSearch]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
        onFocus={() => value.length >= 3 && items.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // deja tiempo a click
      />
      {open && (
        <div className="mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Sin resultados
            </div>
          )}
          {!loading &&
            items.map((s) => (
              <button
                key={s.id}
                type="button"
                className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(s);
                  onChange(s.label);
                  setOpen(false);
                }}
              >
                {s.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
