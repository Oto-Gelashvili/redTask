export interface Format {
  id: number;
  slug: string;
  name: string;
  priceUplift: number;
}

export interface AgeRating {
  code: string;
  minAge: number;
  description: string;
}

export interface Genre {
  id: number;
  slug: string;
  name: string;
}

export interface Language {
  id: number;
  slug: string;
  name: string;
  code: string;
}

export interface Venue {
  id: number;
  slug: string;
  name: string;
  city: string;
}
