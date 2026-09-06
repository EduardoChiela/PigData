import {
  amenityCatalog,
  eventTypes,
  spaceClasses,
  type EventType,
  type SpaceClass,
} from "@/lib/mock-data";

export type InfraAttrId =
  | "estacionamento"
  | "acessibilidade"
  | "ar-condicionado"
  | "wifi-basico"
  | "cozinha";

export const infraAttributes: { id: InfraAttrId; label: string }[] = [
  { id: "estacionamento", label: "Estacionamento" },
  { id: "acessibilidade", label: "Acessibilidade" },
  { id: "ar-condicionado", label: "Ar-condicionado" },
  { id: "wifi-basico", label: "Wi-Fi básico" },
  { id: "cozinha", label: "Cozinha / apoio" },
];

export type DraftAmenity = {
  itemId: string;
  offered: boolean;
  included: boolean;
  price: number | "";
};

export type SpaceRegistrationDraft = {
  source: "google" | "manual" | null;
  googlePlaceId?: string;
  googleMapsUri?: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  openingHours: string;
  lat: number;
  lng: number;
  capacity: number | "";
  rentalAreaM2: number | "";
  classes: SpaceClass[];
  eventTypes: EventType[];
  allowsFullDay: boolean;
  allowsHourly: boolean;
  hasWindows: boolean;
  windowCount: number | "";
  outlets127: number | "";
  outlets220: number | "";
  allowsPets: boolean;
  infra: InfraAttrId[];
  amenities: DraftAmenity[];
  photoUrls: string[];
  basePrice: number | "";
  hourlyPrice: number | "";
  rules: string;
};

export type PublishedSpaceListing = {
  id: string;
  slug: string;
  name: string;
  address: string;
  image: string;
  capacity: number;
  basePrice: number;
  classes: SpaceClass[];
  eventTypes: EventType[];
  status: "aguardando_homologacao";
  createdAt: string;
  ownerId: string;
};

const LISTINGS_KEY = "agora.mock.ownerListings";

export const MOCK_GOOGLE_PLACES = [
  {
    placeId: "mock-place-jardim",
    name: "Salão Jardim das Flores",
    address: "Rua das Flores, 123 — Centro, Toledo - PR",
    phone: "(45) 99999-1200",
    website: "https://salaojardim.example.com",
    openingHours: "Seg–Sáb, 09h–22h",
    lat: -24.7138,
    lng: -53.742,
    googleMapsUri: "https://maps.google.com/?q=Salão+Jardim+Toledo",
  },
  {
    placeId: "mock-place-porto",
    name: "Espaço Porto Alegre Eventos",
    address: "Av. Porto Alegre, 890 — Jardim Porto Alegre, Toledo - PR",
    phone: "(45) 98888-4500",
    website: "",
    openingHours: "Todos os dias, 08h–23h",
    lat: -24.725,
    lng: -53.75,
    googleMapsUri: "https://maps.google.com/?q=Espaço+Porto+Toledo",
  },
  {
    placeId: "mock-place-hub",
    name: "Hub Criativo Toledo",
    address: "Rua Independência, 55 — Centro, Toledo - PR",
    phone: "(45) 3030-7788",
    website: "https://hubtoledo.example.com",
    openingHours: "Seg–Sex, 08h–19h",
    lat: -24.712,
    lng: -53.7415,
    googleMapsUri: "https://maps.google.com/?q=Hub+Criativo+Toledo",
  },
] as const;

export const PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1519167758481-83f29da8c2b4?auto=format&fit=crop&w=800&q=80&sig=reg1",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80&sig=reg2",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80&sig=reg3",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd58670?auto=format&fit=crop&w=800&q=80&sig=reg4",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80&sig=reg5",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80&sig=reg6",
] as const;

export function emptyDraft(): SpaceRegistrationDraft {
  return {
    source: null,
    name: "",
    address: "",
    phone: "",
    website: "",
    openingHours: "",
    lat: -24.7136,
    lng: -53.7431,
    capacity: "",
    rentalAreaM2: "",
    classes: [],
    eventTypes: [],
    allowsFullDay: true,
    allowsHourly: false,
    hasWindows: true,
    windowCount: "",
    outlets127: "",
    outlets220: "",
    allowsPets: false,
    infra: [],
    amenities: amenityCatalog.map((a) => ({
      itemId: a.itemId,
      offered: false,
      included: true,
      price: "",
    })),
    photoUrls: [],
    basePrice: "",
    hourlyPrice: "",
    rules: "",
  };
}

export function draftFromGooglePlace(
  place: (typeof MOCK_GOOGLE_PLACES)[number],
): Partial<SpaceRegistrationDraft> {
  return {
    source: "google",
    googlePlaceId: place.placeId,
    googleMapsUri: place.googleMapsUri,
    name: place.name,
    address: place.address,
    phone: place.phone,
    website: place.website,
    openingHours: place.openingHours,
    lat: place.lat,
    lng: place.lng,
  };
}

export function searchMockPlaces(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [...MOCK_GOOGLE_PLACES];
  return MOCK_GOOGLE_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q),
  );
}

export function slugifyName(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || `espaco-${Date.now()}`
  );
}

export function listOwnerListings(ownerId: string): PublishedSpaceListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LISTINGS_KEY);
    const all: PublishedSpaceListing[] = raw
      ? (JSON.parse(raw) as PublishedSpaceListing[])
      : [];
    return all.filter((l) => l.ownerId === ownerId);
  } catch {
    return [];
  }
}

export function publishSpaceDraft(
  ownerId: string,
  draft: SpaceRegistrationDraft,
): PublishedSpaceListing {
  const listing: PublishedSpaceListing = {
    id: `listing-${Date.now()}`,
    slug: `${slugifyName(draft.name)}-${Date.now().toString(36).slice(-4)}`,
    name: draft.name.trim(),
    address: draft.address.trim(),
    image: draft.photoUrls[0] ?? PHOTO_PRESETS[0],
    capacity: Number(draft.capacity) || 0,
    basePrice: Number(draft.basePrice) || 0,
    classes: draft.classes,
    eventTypes: draft.eventTypes,
    status: "aguardando_homologacao",
    createdAt: new Date().toISOString(),
    ownerId,
  };
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(LISTINGS_KEY);
    const all: PublishedSpaceListing[] = raw
      ? (JSON.parse(raw) as PublishedSpaceListing[])
      : [];
    all.unshift(listing);
    window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(all));
  }
  return listing;
}

export { amenityCatalog, eventTypes, spaceClasses };
