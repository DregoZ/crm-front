export interface Usuario {
  id: string;
  nombre: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
