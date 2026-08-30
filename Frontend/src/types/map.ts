export type LocationType = 'retail' | 'supermarket' | 'market' | 'other';

export interface MarketLocation {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  coords: [number, number];
}