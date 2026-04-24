export type DriverStatus = "en-service" | "disponible" | "repos" | "conges";

export type SkillFamily =
  | "Permis"
  | "Habilitation"
  | "Matériel"
  | "Opérationnel"
  | "Zone";

export interface Skill {
  id: string;
  label: string;
  family: SkillFamily;
  desc: string;
}

export interface Availability {
  mon: 0 | 1;
  tue: 0 | 1;
  wed: 0 | 1;
  thu: 0 | 1;
  fri: 0 | 1;
  sat: 0 | 1;
  sun: 0 | 1;
}

export interface RecentMission {
  id: string;
  date: string;
  route: string;
  status: "Livrée" | "En cours" | "Annulée";
  kms: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  skills: string[];
  zones: string[];
  avatarTone: number;
  initials: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  status: "en-route" | "livraison" | "retour" | "arret";
  load: number;
  eta: string;
  from: string;
  to: string;
}

export interface StatusMeta {
  label: string;
  dot: string;
  text: string;
  bg: string;
}

export interface UserBase {
  email: string;
}

export type DriverUser = UserBase & {
  role: "driver";
  firstName: string;
  lastName: string;
  phone: string;
  skills: string[];
  zones: string[];
};

export type ThemeMode = "light" | "dark";
export type MapStyle = "schematic" | "realistic";
export type SidebarVariant = "expanded" | "compact";

export interface Tweaks {
  theme: ThemeMode;
  map: MapStyle;
  sidebar: SidebarVariant;
}

export type ToastKind = "info" | "success" | "warn";
export interface ToastItem {
  id: number;
  kind: ToastKind;
  msg: string;
}

export type ViewKey =
  | "carte"
  | "chauffeurs"
  | "commandes"
  | "dashcam"
  | "signalements";

export interface Order {
  id: string;
  nomClient: string;
  produit: string;
  quantite: number;
  dateDebutCommande: string;
  dateLivraisonVoulue: string;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export type IncidentType = "external" | "delivery_delayed" | "vehicle_breakdown";

export interface Incident {
  id: string;
  type: IncidentType;
  position: { lat: number; lng: number };
  timestamp: string;
  comment?: string;
}

export interface DashcamVideo {
  id: string;
  assetPath: string;
  timestamp: string;
  driver: { id: string; firstName: string; lastName: string } | null;
  truckId?: string;
  deliveryId?: string;
  retained: boolean;
  retentionNote?: string;
}
