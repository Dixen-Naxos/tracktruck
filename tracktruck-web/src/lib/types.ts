// Core domain types.

export type DriverStatus = "en-service" | "disponible" | "repos" | "conges";

export type SkillFamily = "Permis" | "Habilitation" | "Matériel" | "Opérationnel" | "Zone";

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
  matricule: string;
  firstName: string;
  lastName: string;
  status: DriverStatus;
  rating: number;
  missions: number;
  since: string;
  phone: string;
  email: string;
  vehicle: string;
  license: string;
  expiry: string;
  skills: string[];
  zones: string[];
  availability: Availability;
  nextLeave: string;
  onTimeRate: number;
  incidents30d: number;
  avatarTone: number;
  initials: string;
  recent: RecentMission[];
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

export type ViewKey = "carte" | "chauffeurs" | "commandes" | "dashcam" | "signalements";
