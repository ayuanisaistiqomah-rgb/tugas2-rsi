// Bentuk data menu yang dikirim ke client (hasil JOIN dengan STALLS).
export interface MenuItemWithStallDto {
  id: number;
  stallId: number;
  stallName: string;
  stallLocation: string | null;
  name: string;
  price: number;
  isAvailable: boolean;
}