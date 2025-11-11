import prisma from "../config/prisma";
import { lleva } from "../models/lleva";
import { Remesa } from "../models/remesa";
// rateLimiter.ts (global)
const RATE_MS = 600;
let chain: Promise<any> = Promise.resolve();
let lastStart = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function rateLimit<T>(task: () => Promise<T>): Promise<T> {
  chain = chain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, lastStart + RATE_MS - now);
    if (wait) await sleep(wait);
    lastStart = Date.now();
    return task();
  });
  return chain;
}

/*
Funcion para calcular el numero de KMs que hay que hacer para que una remesa sea 
entregada a su destinatario

la respuesta es un objeto con duracion en segundos y distancia en metros
*/
type KmsRemesa = {
  distance: number; // kilómetros por carretera
  duration: number; // minutos estimados
};

interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Obtiene de la base de datos los transportistas que estan conduciendo un vehiculo y disponibles.
 * @returns
 */
export const transportistasConCoche = async () => {
  const transportistas = await prisma.conduce.findMany({
    where: {
      transportista: {
        is: {
          estaDeBaja: false,
          documentacionValidad: true,
          disponibilidaActual: true,
        },
      },
    },
    include: {
      transportista: { include: { usuario: true } },
      transporte: true,
    },
  });

  return transportistas;
};

/**
 * Obtiene la ruta entre dos puntos con detalles de los pasos.
 * @param origen El punto de origen
 * @param destino El punto de destino
 * @returns Un objeto con la polilínea, las duraciones y el tiempo total en segundos
 */
export const getRouteWithSteps = async (
  origen: Coordenadas,
  destino: Coordenadas
) => {
  const region = process.env.VITE_LOCATIONIQ_REGION || "eu1";
  const key = process.env.VITE_LOCATIONIQ_KEY;

  const url =
    `https://${region}.locationiq.com/v1/directions/driving/` +
    `${origen.lng},${origen.lat};${destino.lng},${destino.lat}` +
    `?key=${key}&overview=full&geometries=polyline&steps=false&annotations=duration,distance`;

  const res = await fetch(url);
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) throw new Error("No route returned");
  const durations: number[] = route.legs?.[0]?.annotation?.duration || [];
  const polyline: string = route.geometry;
  const totalS: number = route.duration;

  return { polyline, durations, totalS };
};

/**
 * Selecciona los transportistas disponibles para una remesa dada.
 * @param transportistasConCoche Los transportistas disponibles con coche
 * @param puntoTrayectoInicial El punto de inicio del trayecto
 * @param puntoTrayectoFinal El punto de destino del trayecto
 * @returns Una lista de transportistas seleccionados
 */
export const seleccionarTransportistasParaRemesa = async (
  transportistasConCoche: any[],
  puntoTrayectoInicial: Coordenadas,
  puntoTrayectoFinal: Coordenadas
) => {
  const HORAS_MAXIMO_CONDUCCION = 5;

  let transportistasSeleccionados: any[] = [];

  const ruta = await getRouteWithSteps(
    puntoTrayectoInicial,
    puntoTrayectoFinal
  );
  const totalHoras = ruta.totalS / 3600;
  const transportistasNecesarios = Math.ceil(
    totalHoras / HORAS_MAXIMO_CONDUCCION
  );

  const checkpoints = getCheckpointsCada5h(ruta.polyline, ruta.durations);

  if (transportistasConCoche.length < transportistasNecesarios) {
    throw new Error(
      `No hay suficientes conductores disponibles. Necesarios: ${transportistasNecesarios}, disponibles: ${transportistasConCoche.length}`
    );
  }
  transportistasSeleccionados = await asignarTransportistas(
    checkpoints,
    transportistasConCoche
  );

  return transportistasSeleccionados;
};

/**
 * Decodifica una polilínea de Google Maps.
 * @param str La polilínea codificada
 * @returns Una lista de coordenadas
 */
function decodePolyline(str: string): [number, number][] {
  let i = 0,
    lat = 0,
    lng = 0,
    out: [number, number][] = [];
  while (i < str.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    out.push([lat / 1e5, lng / 1e5]);
  }
  return out;
}

/**
 * Interpola linealmente entre dos puntos.
 * @param a El primer punto
 * @param b El segundo punto
 * @param t El factor de interpolación (0 a 1)
 * @returns El punto interpolado
 */
function lerp(a: Coordenadas, b: Coordenadas, t: number): Coordenadas {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/**
 * Calcula la distancia entre dos puntos en kilómetros utilizando la fórmula de Haversine
 * @param a El primer punto
 * @param b El segundo punto
 * @returns La distancia entre los dos puntos en kilómetros
 */
function haversineKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Convierte un valor desconocido a un número
 * @param v El valor a convertir
 * @returns El número convertido o undefined si no es válido
 */
const toNum = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Obtiene los checkpoints cada 5 horas a partir de la polilínea y las duraciones
 * @param polyline La polilínea que representa la ruta
 * @param durations Las duraciones de cada segmento de la ruta
 * @returns Una lista de checkpoints
 */
export function getCheckpointsCada5h(polyline: string, durations: number[]) {
  const coordsArr = decodePolyline(polyline).map(([lat, lng]) => ({
    lat,
    lng,
  }));
  const checkpoints: Coordenadas[] = [];
  const totalS = durations.reduce((a, b) => a + b, 0);
  const horas = Math.ceil(totalS / 18000); // nº de puntos de 5h (incluye el final si cuadra exacto)

  for (let k = 1; k <= horas; k++) {
    const target = k * 18000; // segundos desde el inicio
    let acc = 0;
    for (let i = 0; i < durations.length; i++) {
      const seg = durations[i];
      if (acc + seg >= target || i === durations.length - 1) {
        const remaining = Math.max(0, target - acc);
        const t = seg > 0 ? Math.min(1, remaining / seg) : 1;
        const a = coordsArr[i];
        const b = coordsArr[i + 1] || a;
        checkpoints.push(lerp(a, b, t));
        break;
      }
      acc += seg;
    }
  }
  return checkpoints;
}

type Transportista = {
  id: number;
  zonaOperativaLat?: number | string;
  zonaOperativaLng?: number | string;
};

/**
 * Obtiene la dirección a partir de las coordenadas
 * @param param0 Las coordenadas
 * @param opts Opciones adicionales
 * @returns La dirección formateada
 */
export async function reverseGeocodeLabel(
  { lat, lng }: { lat: number; lng: number },
  opts?: { zoom?: number; attempts?: number }
): Promise<string> {
  const region = process.env.VITE_LOCATIONIQ_REGION ?? "eu1";
  const key = process.env.VITE_LOCATIONIQ_KEY!;
  const zoom = opts?.zoom ?? 16;
  const attempts = opts?.attempts ?? 2;

  return rateLimit(async () => {
    for (let i = 0; i < attempts; i++) {
      const res = await fetch(
        `https://${region}.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lng}&format=json&accept-language=es&zoom=${zoom}&normalizeaddress=1`
      );

      if (res.ok) {
        const data = await res.json();
        const a = data?.address ?? {};
        const street = [a.road, a.house_number]
          .filter(Boolean)
          .join(" ")
          .trim();
        const poi = a.amenity || a.tourism || a.shop || a.leisure || a.building;
        const locality =
          a.neighbourhood ||
          a.suburb ||
          a.village ||
          a.town ||
          a.city ||
          a.county;
        return (
          street || poi || locality || data?.display_name || `${lat},${lng}`
        );
      }

      if (res.status === 429) {
        const ra = Number(res.headers.get("Retry-After"));
        await sleep((ra ? ra * 1000 : 1000) * (i + 1)); // backoff suave
        continue;
      }

      throw new Error(`Reverse geocoding ${res.status}`);
    }
    return `${lat},${lng}`; // último recurso
  });
}
/**
 * Asigna transportistas a los checkpoints
 * @param checkpoints Los checkpoints a los que se asignarán los transportistas
 * @param candidatos Los transportistas candidatos a ser asignados
 * @param radioKm El radio en kilómetros para la asignación
 * @returns Una lista de asignaciones de transportistas a checkpoints
 */
export async function asignarTransportistas(
  checkpoints: Coordenadas[],
  candidatos: Transportista[],
  radioKm = 50
) {
  const pool = [...candidatos];
  const asignaciones: {
    checkpoint: Coordenadas;
    transportista?: Transportista;
    distanciaKm?: number;
    dentroDeRadio?: boolean;
    direccion?: string;
  }[] = [];

  for (const cp of checkpoints) {
    const conDist = pool
      .map((t) => {
        const lat = toNum(t.zonaOperativaLat);
        const lng = toNum(t.zonaOperativaLng);
        if (lat == null || lng == null) return null;
        const d = haversineKm(cp, { lat, lng });
        return { t, d };
      })
      .filter((x): x is { t: Transportista; d: number } => !!x)
      .sort((a, b) => a.d - b.d);

    const dentro = conDist.find((x) => x.d <= radioKm);

    //si no hay, coge el más cercano de todos (fallback)
    const elegido = dentro?.t ?? conDist[0]?.t;
    const distancia = dentro?.d ?? conDist[0]?.d;

    let dir = await reverseGeocodeLabel(cp);

    if (elegido) {
      asignaciones.push({
        checkpoint: { ...cp },
        direccion: dir,
        transportista: elegido,
        distanciaKm: distancia,
        dentroDeRadio: distancia! <= radioKm,
      });
      const idx = pool.findIndex((c) => c.id === elegido.id);
      if (idx >= 0) pool.splice(idx, 1);
    } else {
      asignaciones.push({
        checkpoint: cp,
        direccion: dir,
        transportista: undefined,
        distanciaKm: undefined,
        dentroDeRadio: false,
      });
    }
  }

  return asignaciones;
}

/**
 * Obtiene la fecha y hora de mañana a las 12:00
 * @returns La fecha y hora de mañana a las 12:00
 */
function getTomorrowAtNoon(): Date {
  const now = new Date();
  // mañana (en la zona local del proceso)
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    12,
    0,
    0,
    0
  );
  return tomorrow;
}

/**
 * Suma minutos a una fecha
 * @param d La fecha original
 * @param minutes Los minutos a sumar
 * @returns La nueva fecha con los minutos sumados
 */
function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

/**
 * Formatea la hora en formato "HH:mm" para la zona horaria de Europa/Madrid
 * @param d La fecha a formatear
 * @returns La hora formateada
 */
function formatHourEuropeMadrid(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(d);
}

/**
 * Crea las entradas para la tabla de lleva
 * @param transportistasSeleccionados Son los transportistas que haran la ruta de la remesa
 * @param puntoInicio
 * @param puntoFinal
 * @param remesa
 * @returns
 */
export const crearEntradasLLeva = async (
  transportistasSeleccionados: any[],
  puntoInicio: Coordenadas,
  puntoFinal: Coordenadas,
  remesa: any
): Promise<lleva[]> => {
  let entradasLleva: lleva[] = [];
  let contador = 0;
  let inicioLocal: Coordenadas;
  let finalLocal: Coordenadas;
  let dirInicio: string;
  let dirFin: string;
  const SLOT_MINUTES = 300;
  const base = getTomorrowAtNoon();

  for (const ts of transportistasSeleccionados) {
    if (contador === 0) {
      inicioLocal = puntoInicio;
      dirInicio = remesa.dirEnvio;
    } else {
      inicioLocal = transportistasSeleccionados[contador - 1].checkpoint;
      dirInicio = transportistasSeleccionados[contador - 1].direccion;
    }

    if (contador === transportistasSeleccionados.length - 1) {
      finalLocal = puntoFinal;
      dirFin = remesa.dirRecogida;
    } else {
      finalLocal = ts.checkpoint;
      dirFin = ts.direccion;
    }

    let conduceId = await prisma.conduce.findUnique({
      where: { transportistaId: ts.transportista.id },
      select: { id: true },
    });

    const scheduled = addMinutes(base, contador * SLOT_MINUTES);
    entradasLleva.push({
      remesaId: remesa.id ?? -1,
      orden: contador,
      conduceId: conduceId?.id ?? -1,
      latInicio: inicioLocal.lat,
      lngInicio: inicioLocal.lng,
      latFin: finalLocal.lat,
      lngFin: finalLocal.lng,
      distanciaKm: ts.distanciaKm ?? null,
      fecha: scheduled,
      hora: formatHourEuropeMadrid(scheduled),
      dirInicio: dirInicio,
      dirFin: dirFin,
      status: "PENDIENTE",
    });

    contador++;
  }

  return entradasLleva;
};

/**
 * Obtiene los transportistas cercanos a un punto específico
 * @param punto Las coordenadas del punto de interés
 */
export const obtenerTransportistaCercanoaUnPunto = async (
  punto: Coordenadas
) => {
  const transportistas: any[] = await transportistasConCoche();
  let transportistaId: number | null = null;
  let menorDistancia: number | null = 100000000;

  for (const transportista of transportistas) {
    let puntoTransportista: Coordenadas = {
      lat: Number(transportista.transportista.zonaOperativaLat),
      lng: Number(transportista.transportista.zonaOperativaLng),
    };

    let distanciaKms: number = haversineKm(punto, puntoTransportista);

    if (distanciaKms < menorDistancia) {
      menorDistancia = distanciaKms;
      transportistaId = transportista.transportistaId;
    }

    if (distanciaKms <= 50) {
      transportistaId = transportista.transportistaId;
      break;
    }
  }

  return transportistaId;
};
