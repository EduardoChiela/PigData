/**
 * Mock piloto Toledo - PR.
 * Espelha campos de docs/espacos.md, busca-locacao.md, comodidades.md, mapa-busca.md.
 * Camada A = ACIT verificado; B = cadastrado sem selo forte.
 */

/** Nome visível na UI — comercial a definir (docs/nomenclatura.md). Codinome do repo: PigData. */
export const APP_NAME = "Espaços ACIT";

export const PILOT_CITY = "Toledo";
export const PILOT_STATE = "PR";
export const PILOT_CITY_LABEL = "Toledo - PR";
export const PILOT_MAP_CENTER = { lat: -24.7136, lng: -53.7431 };

export type Availability = "livre" | "parcial" | "indisponivel";
export type PeriodId = "manha" | "tarde" | "noite" | "dia_inteiro";
export type SpaceClass =
  | "Salão de festas"
  | "Coworking"
  | "Espaço corporativo"
  | "Área externa / Chácara"
  | "Espaço para casamento";
export type EventType =
  | "Formatura"
  | "Casamento"
  | "Corporativo"
  | "Confraternização"
  | "Feira"
  | "Show"
  | "Aniversário";

export type AmenityOffer = {
  itemId: string;
  name: string;
  included: boolean;
  price: number;
};

export type SpaceOutlet = {
  voltage: 127 | 220;
  quantity: number;
};

export type Space = {
  slug: string;
  name: string;
  city: string;
  state: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  /** Camada A no mapa */
  acitVerified: boolean;
  capacity: number;
  rentalAreaM2: number;
  basePrice: number;
  hourlyPrice?: number;
  allowsFullDayRental: boolean;
  allowsHourlyRental: boolean;
  hasWindows: boolean;
  windowCount: number;
  outlets: SpaceOutlet[];
  allowsPets: boolean;
  classes: SpaceClass[];
  eventTypes: EventType[];
  amenities: AmenityOffer[];
  rules: string;
  image: string;
  /** Datas ISO em que o espaço está ocupado o dia todo (mock de agenda) */
  busyDates: string[];
  /** Datas com só um período livre (mock) */
  partialDates: string[];
  blurb: string;
};

export const periods: { id: PeriodId; label: string }[] = [
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
  { id: "dia_inteiro", label: "Dia inteiro" },
];

export const regions = [
  "Centro",
  "Jardim Porto Alegre",
  "Vila Industrial",
  "Panorama",
  "Vila Becker",
  "Jardim Coopagro",
  "Vila Nova",
  "Jardim Santa Maria",
  "Tocantins",
  "Jardim Pancera",
] as const;

export const eventTypes: EventType[] = [
  "Formatura",
  "Casamento",
  "Corporativo",
  "Confraternização",
  "Feira",
  "Show",
  "Aniversário",
];

export const spaceClasses: SpaceClass[] = [
  "Salão de festas",
  "Coworking",
  "Espaço corporativo",
  "Área externa / Chácara",
  "Espaço para casamento",
];

/** Catálogo mestre de comodidades (docs/comodidades.md) — sem preço global */
export const amenityCatalog = [
  { itemId: "cascata-chocolate", name: "Cascata de chocolate" },
  { itemId: "pula-pula", name: "Pula-pula" },
  { itemId: "algodao-pipoca", name: "Algodão doce / pipoca" },
  { itemId: "totem-recarga", name: "Totem de recarga em cada mesa" },
  { itemId: "wifi-dedicado", name: "Wi-Fi dedicado de alta velocidade" },
  { itemId: "cafe-liberado", name: "Café liberado o dia todo" },
  { itemId: "cabine-video", name: "Cabine isolada pra ligação/vídeo" },
  { itemId: "suporte-tecnico", name: "Suporte técnico no local" },
  { itemId: "coffee-break", name: "Coffee break" },
  { itemId: "streaming", name: "Transmissão ao vivo / streaming do evento" },
  { itemId: "gerador", name: "Gerador silencioso" },
  { itemId: "iluminacao-cenica", name: "Iluminação cênica programável" },
  { itemId: "copa-buffet", name: "Copa de apoio para buffet terceirizado" },
  { itemId: "cobertura-chuva", name: "Cobertura de emergência pra chuva" },
  { itemId: "camarim", name: "Camarim com espelho iluminado (making-of)" },
  { itemId: "guarda-volumes", name: "Guarda-volumes com serviço" },
] as const;

const img = (id: string, sig: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80&sig=${sig}`;

function am(
  itemId: (typeof amenityCatalog)[number]["itemId"],
  included: boolean,
  price = 0,
): AmenityOffer {
  const found = amenityCatalog.find((a) => a.itemId === itemId);
  return {
    itemId,
    name: found?.name ?? itemId,
    included,
    price: included ? 0 : price,
  };
}

/** Datas de referência do protótipo (setembro 2026) */
const D = {
  busy1: "2026-09-12",
  busy2: "2026-09-20",
  busy3: "2026-09-27",
  partial1: "2026-09-13",
  partial2: "2026-09-19",
  freeWeekend: "2026-09-14",
};

export const spaces: Space[] = [
  {
    slug: "vila-verde",
    name: "Espaço Vila Verde",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Porto Alegre",
    address: "Rua das Araucárias, 420 — Jardim Porto Alegre",
    lat: -24.7241,
    lng: -53.7512,
    acitVerified: true,
    capacity: 180,
    rentalAreaM2: 320,
    basePrice: 4800,
    hourlyPrice: 650,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 8,
    outlets: [
      { voltage: 127, quantity: 24 },
      { voltage: 220, quantity: 6 },
    ],
    allowsPets: false,
    classes: ["Salão de festas", "Espaço para casamento"],
    eventTypes: ["Casamento", "Formatura", "Aniversário", "Confraternização"],
    amenities: [
      am("iluminacao-cenica", false, 450),
      am("copa-buffet", true),
      am("camarim", false, 280),
      am("guarda-volumes", false, 120),
      am("gerador", false, 600),
    ],
    rules: "Som até 23h. Decoração com fita adesiva apenas em áreas permitidas.",
    image: img("photo-1519167758481-83f29da8c2b4", "vila"),
    busyDates: [D.busy1, D.busy2],
    partialDates: [D.partial1],
    blurb: "Jardim interno e salão climatizado — referência ACIT para casamentos.",
  },
  {
    slug: "salao-corujas",
    name: "Salão das Corujas",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Centro",
    address: "Av. Parigot de Souza, 1100 — Centro",
    lat: -24.7138,
    lng: -53.743,
    acitVerified: true,
    capacity: 250,
    rentalAreaM2: 480,
    basePrice: 5200,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 12,
    outlets: [
      { voltage: 127, quantity: 40 },
      { voltage: 220, quantity: 10 },
    ],
    allowsPets: false,
    classes: ["Salão de festas"],
    eventTypes: ["Formatura", "Show", "Aniversário", "Corporativo"],
    amenities: [
      am("iluminacao-cenica", true),
      am("streaming", false, 800),
      am("copa-buffet", true),
      am("guarda-volumes", false, 150),
    ],
    rules: "Capacidade máxima inclui staff. Não é permitido fogos.",
    image: img("photo-1464366400600-7168b8af9bc3", "corujas"),
    busyDates: [D.busy3],
    partialDates: [D.partial2],
    blurb: "Palco elevado e som profissional no coração de Toledo.",
  },
  {
    slug: "casa-alameda",
    name: "Casa Alameda",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Becker",
    address: "Alameda das Palmeiras, 88 — Vila Becker",
    lat: -24.7055,
    lng: -53.732,
    acitVerified: true,
    capacity: 90,
    rentalAreaM2: 160,
    basePrice: 2900,
    hourlyPrice: 420,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 14,
    outlets: [{ voltage: 127, quantity: 18 }],
    allowsPets: true,
    classes: ["Espaço para casamento", "Área externa / Chácara"],
    eventTypes: ["Casamento", "Aniversário", "Confraternização"],
    amenities: [
      am("cobertura-chuva", false, 350),
      am("cascata-chocolate", false, 250),
      am("algodao-pipoca", false, 180),
      am("copa-buffet", true),
    ],
    rules: "Pets sob supervisão. Churrasqueira sob reserva prévia.",
    image: img("photo-1464146072230-91cabc968266", "alameda"),
    busyDates: [D.busy1],
    partialDates: [],
    blurb: "Casa colonial com quintal arborizado — ideal para cerimônias íntimas.",
  },
  {
    slug: "hub-coopagro",
    name: "Hub Coopagro",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Coopagro",
    address: "Rua dos Tratores, 55 — Jardim Coopagro",
    lat: -24.7312,
    lng: -53.7588,
    acitVerified: true,
    capacity: 60,
    rentalAreaM2: 220,
    basePrice: 1800,
    hourlyPrice: 280,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 6,
    outlets: [
      { voltage: 127, quantity: 30 },
      { voltage: 220, quantity: 4 },
    ],
    allowsPets: false,
    classes: ["Coworking", "Espaço corporativo"],
    eventTypes: ["Corporativo", "Feira", "Confraternização"],
    amenities: [
      am("wifi-dedicado", true),
      am("cafe-liberado", true),
      am("totem-recarga", true),
      am("cabine-video", false, 90),
      am("coffee-break", false, 320),
      am("suporte-tecnico", false, 200),
    ],
    rules: "Credenciamento na recepção. Sem bebidas alcoólicas em horário comercial.",
    image: img("photo-1497366216548-37526070297c", "hub"),
    busyDates: [D.busy2, D.busy3],
    partialDates: [D.partial1],
    blurb: "Salas modulares e café liberado — ponto ACIT para eventos corporativos.",
  },
  {
    slug: "chacara-panorama",
    name: "Chácara Panorama",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Panorama",
    address: "Estrada do Contorno, km 4 — Panorama",
    lat: -24.698,
    lng: -53.72,
    acitVerified: true,
    capacity: 300,
    rentalAreaM2: 1200,
    basePrice: 6500,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 20 },
      { voltage: 220, quantity: 8 },
    ],
    allowsPets: true,
    classes: ["Área externa / Chácara", "Espaço para casamento"],
    eventTypes: ["Casamento", "Aniversário", "Confraternização", "Show"],
    amenities: [
      am("cobertura-chuva", true),
      am("gerador", true),
      am("pula-pula", false, 400),
      am("algodao-pipoca", false, 200),
      am("iluminacao-cenica", false, 550),
    ],
    rules: "Acesso por estrada de terra em dias de chuva. Estacionamento no gramado.",
    image: img("photo-1464366400600-7168b8af9bc3", "panorama"),
    busyDates: [D.busy1, D.busy3],
    partialDates: [],
    blurb: "Área aberta com lago artificial e vista para o horizonte oeste.",
  },
  {
    slug: "atelier-becker",
    name: "Ateliê Becker",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Becker",
    address: "Rua Ernesto Becker, 312 — Vila Becker",
    lat: -24.7072,
    lng: -53.7355,
    acitVerified: false,
    capacity: 40,
    rentalAreaM2: 85,
    basePrice: 1200,
    hourlyPrice: 180,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 5,
    outlets: [{ voltage: 127, quantity: 12 }],
    allowsPets: true,
    classes: ["Espaço corporativo"],
    eventTypes: ["Corporativo", "Aniversário", "Confraternização"],
    amenities: [
      am("wifi-dedicado", true),
      am("cafe-liberado", false, 80),
      am("coffee-break", false, 220),
    ],
    rules: "Ambiente silencioso após 21h. Capacidade sentada: 40.",
    image: img("photo-1497366811353-6870744d04b2", "atelier"),
    busyDates: [D.busy2],
    partialDates: [D.partial2],
    blurb: "Loft iluminado para workshops e celebrações menores.",
  },
  {
    slug: "arena-industrial",
    name: "Arena Vila Industrial",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Industrial",
    address: "Rua das Indústrias, 900 — Vila Industrial",
    lat: -24.7188,
    lng: -53.762,
    acitVerified: true,
    capacity: 400,
    rentalAreaM2: 900,
    basePrice: 7800,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 50 },
      { voltage: 220, quantity: 20 },
    ],
    allowsPets: false,
    classes: ["Salão de festas", "Espaço corporativo"],
    eventTypes: ["Feira", "Show", "Formatura", "Corporativo"],
    amenities: [
      am("streaming", false, 1200),
      am("suporte-tecnico", true),
      am("gerador", true),
      am("guarda-volumes", false, 200),
      am("iluminacao-cenica", false, 700),
    ],
    rules: "Montagem de stands até 1 dia antes. Seguro de eventos obrigatório acima de 200 pessoas.",
    image: img("photo-1540575467063-178a50c2df87", "arena"),
    busyDates: [D.busy1, D.busy2, D.busy3],
    partialDates: [],
    blurb: "Galpão climatizado para feiras e formaturas de grande porte.",
  },
  {
    slug: "jardim-santa-maria",
    name: "Espaço Jardim Santa Maria",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Santa Maria",
    address: "Rua Santa Maria, 210 — Jardim Santa Maria",
    lat: -24.722,
    lng: -53.735,
    acitVerified: false,
    capacity: 120,
    rentalAreaM2: 240,
    basePrice: 3200,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 7,
    outlets: [
      { voltage: 127, quantity: 22 },
      { voltage: 220, quantity: 2 },
    ],
    allowsPets: false,
    classes: ["Salão de festas"],
    eventTypes: ["Aniversário", "Confraternização", "Formatura"],
    amenities: [
      am("cascata-chocolate", false, 280),
      am("pula-pula", false, 350),
      am("algodao-pipoca", false, 160),
      am("copa-buffet", true),
    ],
    rules: "Decoração infantil sob aprovação prévia. Som até 22h30.",
    image: img("photo-1478144592103-25e218a04891", "santamaria"),
    busyDates: [],
    partialDates: [D.partial1],
    blurb: "Salão familiar com área kids e cozinha ampla.",
  },
  {
    slug: "rooftop-centro",
    name: "Rooftop Centro Toledo",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Centro",
    address: "Rua XV de Novembro, 450 — Centro",
    lat: -24.7145,
    lng: -53.7412,
    acitVerified: true,
    capacity: 80,
    rentalAreaM2: 140,
    basePrice: 3600,
    hourlyPrice: 500,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 16 },
      { voltage: 220, quantity: 2 },
    ],
    allowsPets: false,
    classes: ["Espaço corporativo", "Salão de festas"],
    eventTypes: ["Corporativo", "Confraternização", "Aniversário", "Show"],
    amenities: [
      am("iluminacao-cenica", true),
      am("streaming", false, 600),
      am("coffee-break", false, 400),
      am("cobertura-chuva", true),
    ],
    rules: "Elevador de serviço para buffet. Sem fogos ou drones.",
    image: img("photo-1514525253161-7a46d19cd819", "rooftop"),
    busyDates: [D.busy2],
    partialDates: [D.partial2],
    blurb: "Terraço com vista noturna — happy hours e lançamentos.",
  },
  {
    slug: "sitio-tocantins",
    name: "Sítio Tocantins",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Tocantins",
    address: "Linha Tocantins, s/n — Tocantins",
    lat: -24.69,
    lng: -53.71,
    acitVerified: false,
    capacity: 200,
    rentalAreaM2: 800,
    basePrice: 4100,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 14 },
      { voltage: 220, quantity: 4 },
    ],
    allowsPets: true,
    classes: ["Área externa / Chácara"],
    eventTypes: ["Aniversário", "Casamento", "Confraternização"],
    amenities: [
      am("cobertura-chuva", false, 300),
      am("gerador", false, 500),
      am("pula-pula", false, 380),
      am("algodao-pipoca", false, 190),
    ],
    rules: "Check-in a partir das 9h. Limpeza inclusa até 50 convidados.",
    image: img("photo-1500382017468-9049fed747ef", "tocantins"),
    busyDates: [D.busy3],
    partialDates: [],
    blurb: "Pomar e campo para festas ao ar livre com estacionamento amplo.",
  },
  {
    slug: "studio-pancera",
    name: "Studio Pancera",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Pancera",
    address: "Rua Pancera, 77 — Jardim Pancera",
    lat: -24.7265,
    lng: -53.748,
    acitVerified: false,
    capacity: 35,
    rentalAreaM2: 70,
    basePrice: 950,
    hourlyPrice: 140,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 4,
    outlets: [
      { voltage: 127, quantity: 10 },
      { voltage: 220, quantity: 1 },
    ],
    allowsPets: false,
    classes: ["Coworking"],
    eventTypes: ["Corporativo", "Feira"],
    amenities: [
      am("wifi-dedicado", true),
      am("cabine-video", true),
      am("totem-recarga", false, 60),
      am("suporte-tecnico", false, 150),
    ],
    rules: "Reserva mínima de 2h. Sem catering externo sem aviso.",
    image: img("photo-1524758631624-e2822e304c36", "pancera"),
    busyDates: [],
    partialDates: [D.partial1, D.partial2],
    blurb: "Estúdio compacto para gravações, reuniões e pop-ups.",
  },
  {
    slug: "clube-porto-alegre",
    name: "Clube Porto Alegre",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Porto Alegre",
    address: "Av. Porto Alegre, 1500 — Jardim Porto Alegre",
    lat: -24.7255,
    lng: -53.754,
    acitVerified: true,
    capacity: 220,
    rentalAreaM2: 500,
    basePrice: 5500,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 10,
    outlets: [
      { voltage: 127, quantity: 36 },
      { voltage: 220, quantity: 8 },
    ],
    allowsPets: false,
    classes: ["Salão de festas", "Espaço para casamento"],
    eventTypes: ["Casamento", "Formatura", "Aniversário", "Show"],
    amenities: [
      am("iluminacao-cenica", true),
      am("copa-buffet", true),
      am("camarim", true),
      am("guarda-volumes", false, 180),
      am("streaming", false, 900),
    ],
    rules: "Sócios têm prioridade de agenda — datas ACIT validadas na plataforma.",
    image: img("photo-1511795409834-ef04bbd61622", "clube"),
    busyDates: [D.busy1],
    partialDates: [D.partial2],
    blurb: "Salão clássico com pista e cozinha industrial — selo ACIT.",
  },
  {
    slug: "galeria-nova",
    name: "Galeria Vila Nova",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Nova",
    address: "Rua das Acácias, 33 — Vila Nova",
    lat: -24.71,
    lng: -53.728,
    acitVerified: false,
    capacity: 70,
    rentalAreaM2: 150,
    basePrice: 2100,
    hourlyPrice: 300,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 9,
    outlets: [{ voltage: 127, quantity: 20 }],
    allowsPets: true,
    classes: ["Espaço corporativo", "Salão de festas"],
    eventTypes: ["Corporativo", "Feira", "Aniversário", "Confraternização"],
    amenities: [
      am("wifi-dedicado", true),
      am("coffee-break", false, 280),
      am("iluminacao-cenica", false, 320),
    ],
    rules: "Paredes brancas: nada de fita forte. Pets de pequeno porte.",
    image: img("photo-1531058020387-aada0bfaaf68", "galeria"),
    busyDates: [D.busy2],
    partialDates: [],
    blurb: "Galeria de pé-direito alto para exposições e cocktail.",
  },
  {
    slug: "mirante-oeste",
    name: "Mirante Oeste",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Panorama",
    address: "Estrada do Mirante, 12 — Panorama",
    lat: -24.6955,
    lng: -53.7155,
    acitVerified: true,
    capacity: 150,
    rentalAreaM2: 280,
    basePrice: 4400,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 16,
    outlets: [
      { voltage: 127, quantity: 18 },
      { voltage: 220, quantity: 3 },
    ],
    allowsPets: false,
    classes: ["Espaço para casamento", "Área externa / Chácara"],
    eventTypes: ["Casamento", "Aniversário", "Confraternização"],
    amenities: [
      am("cobertura-chuva", true),
      am("iluminacao-cenica", false, 480),
      am("camarim", false, 260),
      am("cascata-chocolate", false, 240),
    ],
    rules: "Cerimônia externa sujeita a previsão do tempo. Plano B coberto incluso.",
    image: img("photo-1522673607200-164d1b6ce486", "mirante"),
    busyDates: [D.busy3],
    partialDates: [D.partial1],
    blurb: "Deck com por do sol — casamentos e jantares ao ar livre.",
  },
  {
    slug: "sala-negocios-centro",
    name: "Sala de Negócios Centro",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Centro",
    address: "Rua Santos Dumont, 200 — Centro",
    lat: -24.7128,
    lng: -53.7445,
    acitVerified: false,
    capacity: 25,
    rentalAreaM2: 45,
    basePrice: 700,
    hourlyPrice: 110,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 2,
    outlets: [
      { voltage: 127, quantity: 8 },
      { voltage: 220, quantity: 1 },
    ],
    allowsPets: false,
    classes: ["Coworking", "Espaço corporativo"],
    eventTypes: ["Corporativo"],
    amenities: [
      am("wifi-dedicado", true),
      am("cafe-liberado", true),
      am("cabine-video", false, 70),
      am("totem-recarga", true),
    ],
    rules: "Horário comercial 8h–19h. Projetor incluso.",
    image: img("photo-1431540015161-0bf268a2e270", "negocios"),
    busyDates: [],
    partialDates: [D.partial2],
    blurb: "Sala executiva no centro para reuniões e treinamentos curtos.",
  },
  {
    slug: "fazenda-urbana",
    name: "Fazenda Urbana Toledo",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Industrial",
    address: "Rua do Campo, 48 — Vila Industrial",
    lat: -24.717,
    lng: -53.7555,
    acitVerified: true,
    capacity: 110,
    rentalAreaM2: 350,
    basePrice: 3800,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 11,
    outlets: [
      { voltage: 127, quantity: 16 },
      { voltage: 220, quantity: 4 },
    ],
    allowsPets: true,
    classes: ["Área externa / Chácara", "Salão de festas"],
    eventTypes: ["Aniversário", "Confraternização", "Casamento", "Feira"],
    amenities: [
      am("cobertura-chuva", true),
      am("gerador", false, 450),
      am("pula-pula", false, 360),
      am("algodao-pipoca", false, 170),
      am("copa-buffet", true),
    ],
    rules: "Horta educativa — não colher sem autorização. Pets na área externa.",
    image: img("photo-1416879595882-3373a0480b5b", "fazenda"),
    busyDates: [D.busy1],
    partialDates: [],
    blurb: "Estufa e pátio para feiras gastronômicas e aniversários.",
  },
  {
    slug: "teatro-comunitario",
    name: "Teatro Comunitário ACIT",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Centro",
    address: "Praça Willy Barth, 1 — Centro",
    lat: -24.7132,
    lng: -53.7422,
    acitVerified: true,
    capacity: 280,
    rentalAreaM2: 420,
    basePrice: 6000,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 30 },
      { voltage: 220, quantity: 12 },
    ],
    allowsPets: false,
    classes: ["Salão de festas", "Espaço corporativo"],
    eventTypes: ["Show", "Formatura", "Corporativo", "Feira"],
    amenities: [
      am("iluminacao-cenica", true),
      am("streaming", true),
      am("suporte-tecnico", true),
      am("guarda-volumes", false, 220),
      am("camarim", true),
    ],
    rules: "Equipe técnica da casa obrigatória para shows. Ensaio incluso 1 turno.",
    image: img("photo-1503095396549-807759245b35", "teatro"),
    busyDates: [D.busy2, D.busy3],
    partialDates: [D.partial1],
    blurb: "Plateia inclinada e camarins — eventos culturais da rede ACIT.",
  },
  {
    slug: "loft-coopagro",
    name: "Loft Coopagro",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Coopagro",
    address: "Rua das Sementes, 19 — Jardim Coopagro",
    lat: -24.7298,
    lng: -53.756,
    acitVerified: false,
    capacity: 55,
    rentalAreaM2: 110,
    basePrice: 1600,
    hourlyPrice: 220,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: true,
    windowCount: 6,
    outlets: [{ voltage: 127, quantity: 14 }],
    allowsPets: false,
    classes: ["Coworking", "Espaço corporativo"],
    eventTypes: ["Corporativo", "Confraternização", "Aniversário"],
    amenities: [
      am("wifi-dedicado", true),
      am("cafe-liberado", false, 90),
      am("coffee-break", false, 250),
      am("totem-recarga", false, 50),
    ],
    rules: "Cozinha compartilhada. Sem fogos nem confete metálico.",
    image: img("photo-1497366754035-f200968a6e72", "loftcoop"),
    busyDates: [],
    partialDates: [],
    blurb: "Loft industrial para kickoffs e encontros de equipes.",
  },
  {
    slug: "capela-jardim",
    name: "Capela & Jardim Horizonte",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Santa Maria",
    address: "Rua Horizonte, 8 — Jardim Santa Maria",
    lat: -24.7205,
    lng: -53.7335,
    acitVerified: true,
    capacity: 100,
    rentalAreaM2: 200,
    basePrice: 4200,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 8,
    outlets: [
      { voltage: 127, quantity: 12 },
      { voltage: 220, quantity: 2 },
    ],
    allowsPets: false,
    classes: ["Espaço para casamento"],
    eventTypes: ["Casamento", "Aniversário"],
    amenities: [
      am("iluminacao-cenica", false, 400),
      am("camarim", true),
      am("cobertura-chuva", true),
      am("cascata-chocolate", false, 260),
    ],
    rules: "Cerimônia religiosa sob agendamento separado. Confete biodegradável apenas.",
    image: img("photo-1519741497674-611481863552", "capela"),
    busyDates: [D.busy1, D.busy2],
    partialDates: [],
    blurb: "Capela compacta e jardim lateral para fotos e recepção.",
  },
  {
    slug: "pavilhao-feira",
    name: "Pavilhão Feira Toledo",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Industrial",
    address: "Av. Industrial, 2200 — Vila Industrial",
    lat: -24.7195,
    lng: -53.765,
    acitVerified: false,
    capacity: 500,
    rentalAreaM2: 1500,
    basePrice: 9000,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 60 },
      { voltage: 220, quantity: 30 },
    ],
    allowsPets: false,
    classes: ["Espaço corporativo"],
    eventTypes: ["Feira", "Corporativo", "Show"],
    amenities: [
      am("gerador", true),
      am("suporte-tecnico", false, 800),
      am("streaming", false, 1500),
      am("guarda-volumes", false, 300),
    ],
    rules: "Montagem industrial sob planta aprovada. Segurança 24h inclusa.",
    image: img("photo-1505373877841-8d25f7d46678", "pavilhao"),
    busyDates: [D.busy1, D.busy2, D.busy3],
    partialDates: [D.partial1, D.partial2],
    blurb: "Pavilhão de grande porte para feiras regionais e convenções.",
  },
  {
    slug: "casa-amarela",
    name: "Casa Amarela Eventos",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Vila Nova",
    address: "Rua Amarela, 101 — Vila Nova",
    lat: -24.7088,
    lng: -53.7265,
    acitVerified: false,
    capacity: 85,
    rentalAreaM2: 175,
    basePrice: 2500,
    allowsFullDayRental: true,
    allowsHourlyRental: false,
    hasWindows: true,
    windowCount: 10,
    outlets: [{ voltage: 127, quantity: 16 }],
    allowsPets: true,
    classes: ["Salão de festas"],
    eventTypes: ["Aniversário", "Confraternização", "Casamento"],
    amenities: [
      am("copa-buffet", true),
      am("pula-pula", false, 320),
      am("algodao-pipoca", false, 150),
      am("cascata-chocolate", false, 230),
    ],
    rules: "Som ambiente até 22h. Pets no quintal apenas.",
    image: img("photo-1600585154340-be6161a56a0c", "amarela"),
    busyDates: [],
    partialDates: [D.partial2],
    blurb: "Casa colorida com quintal para aniversários e chás.",
  },
  {
    slug: "auditorio-oeste",
    name: "Auditório Oeste",
    city: PILOT_CITY,
    state: PILOT_STATE,
    region: "Jardim Coopagro",
    address: "Av. Ministro Cirne Lima, 800 — Jardim Coopagro",
    lat: -24.728,
    lng: -53.76,
    acitVerified: true,
    capacity: 160,
    rentalAreaM2: 300,
    basePrice: 3400,
    hourlyPrice: 450,
    allowsFullDayRental: true,
    allowsHourlyRental: true,
    hasWindows: false,
    windowCount: 0,
    outlets: [
      { voltage: 127, quantity: 28 },
      { voltage: 220, quantity: 6 },
    ],
    allowsPets: false,
    classes: ["Espaço corporativo"],
    eventTypes: ["Corporativo", "Formatura", "Feira"],
    amenities: [
      am("wifi-dedicado", true),
      am("streaming", false, 700),
      am("coffee-break", false, 380),
      am("suporte-tecnico", true),
      am("totem-recarga", true),
    ],
    rules: "Tradução simultânea sob consulta. Microfones lapela inclusos.",
    image: img("photo-1475721027785-f74eccf877e2", "auditorio"),
    busyDates: [D.busy2],
    partialDates: [],
    blurb: "Auditório com projeção 4K e cabine de tradução — rede ACIT.",
  },
];

export type SearchFilters = {
  city?: string;
  date?: string;
  period?: PeriodId | string;
  acitOnly?: boolean;
  pets?: boolean;
  minCapacity?: number;
  minArea?: number;
  maxArea?: number;
  eventType?: EventType | string;
  className?: SpaceClass | string;
  maxPrice?: number;
  /** Se true, inclui indisponíveis (padrão: só livres/parciais — disponibilidade-first) */
  includeUnavailable?: boolean;
};

export function availabilityFor(
  space: Space,
  date?: string,
): Availability {
  if (!date) return "livre";
  if (space.busyDates.includes(date)) return "indisponivel";
  if (space.partialDates.includes(date)) return "parcial";
  return "livre";
}

export function withAvailability(space: Space, date?: string) {
  return { ...space, status: availabilityFor(space, date) };
}

export type ListedSpace = Space & { status: Availability };

/**
 * Busca mock alinhada às regras:
 * - cidade piloto (uma por vez)
 * - só disponíveis por padrão (livre + parcial)
 * - ACIT (camada A) antes dos demais
 * - horário: espaços sem allowsHourlyRental ficam de fora se period for horário futuro
 */
export function filterSpaces(filters: SearchFilters = {}): ListedSpace[] {
  const city = (filters.city ?? PILOT_CITY).toLowerCase();
  const date = filters.date;
  const includeUnavailable = filters.includeUnavailable === true;

  let list = spaces
    .filter((s) => s.city.toLowerCase() === city || s.city.toLowerCase() === "toledo")
    .map((s) => withAvailability(s, date));

  if (!includeUnavailable) {
    list = list.filter((s) => s.status !== "indisponivel");
  }

  if (filters.acitOnly) {
    list = list.filter((s) => s.acitVerified);
  }
  if (filters.pets) {
    list = list.filter((s) => s.allowsPets);
  }
  if (filters.minCapacity != null && filters.minCapacity > 0) {
    list = list.filter((s) => s.capacity >= filters.minCapacity!);
  }
  if (filters.minArea != null && filters.minArea > 0) {
    list = list.filter((s) => s.rentalAreaM2 >= filters.minArea!);
  }
  if (filters.maxArea != null && filters.maxArea > 0) {
    list = list.filter((s) => s.rentalAreaM2 <= filters.maxArea!);
  }
  if (filters.maxPrice != null && filters.maxPrice > 0) {
    list = list.filter((s) => s.basePrice <= filters.maxPrice!);
  }
  if (filters.eventType) {
    list = list.filter((s) =>
      s.eventTypes.includes(filters.eventType as EventType),
    );
  }
  if (filters.className) {
    list = list.filter((s) =>
      s.classes.includes(filters.className as SpaceClass),
    );
  }

  const rank = (s: ListedSpace) => {
    const acit = s.acitVerified ? 0 : 1;
    const avail = s.status === "livre" ? 0 : s.status === "parcial" ? 1 : 2;
    return acit * 10 + avail;
  };

  return list.sort((a, b) => rank(a) - rank(b) || a.basePrice - b.basePrice);
}

export function getSpaceBySlug(slug: string) {
  return spaces.find((s) => s.slug === slug);
}

export function acitAlternatives(slug: string, date?: string) {
  return filterSpaces({ date, acitOnly: true }).filter((s) => s.slug !== slug);
}

export const defaultSearchDate = D.freeWeekend;
