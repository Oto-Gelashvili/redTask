export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  age: number;
  preferredVenue: PreferredVenue | null;
  profileComplete: boolean;
}

interface PreferredVenue {
  id: number;
  slug: string;
  name: string;
  city: string;
  formats: {
    id: number;
    slug: string;
    name: string;
    priceUplift: number;
  }[];
}
