import { Vehicle } from "@/common/model";
import { request, authRequest } from "./api";

interface LoginResponse {
  user: {
    id: number;
    email: string;
    nome: string;
  };
  token: string;
  refreshToken: string;
}

interface BemResponse {
  id: number;
  imei: string;
  name: string | null;
}

async function login(email: string, senha: string): Promise<LoginResponse> {
  return request("/api/cliente/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  }) as Promise<LoginResponse>;
}

async function fetchVehicles(accessToken: string): Promise<Vehicle[]> {
  const data = await authRequest("/api/bem/vehicles", accessToken) as BemResponse[];

  return data.map((item) => ({
    id: item.id,
    imei: item.imei,
    name: item.name ?? item.imei,
  }));
}

export { login, fetchVehicles };
export type { LoginResponse };
