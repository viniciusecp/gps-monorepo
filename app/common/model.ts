export interface Vehicle {
  id: number;
  imei: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  vehicles: Vehicle[];
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  speed: number;
}
