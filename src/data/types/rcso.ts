export type RcsoLevel = 1 | 2 | 3;

export interface RcsoTrack {
  name: string;
  subjects: string[];
  level: RcsoLevel;
}

export interface RcsoOlympiad {
  number: number;
  name: string;
  catalogName: string;
  url?: string;
  tracks: RcsoTrack[];
}

export interface RcsoOrder {
  date: Date;
  number: string;
  url: string;
}

export interface RcsoCatalog {
  year: number;
  order: RcsoOrder;
  olympiads: RcsoOlympiad[];
}
