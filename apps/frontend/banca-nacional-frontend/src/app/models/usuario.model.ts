export interface Usuario {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  estado: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  nombres: string;
  apellidos: string;
  rol: string;
}
