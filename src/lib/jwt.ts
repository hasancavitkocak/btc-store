import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  username: string;
  firstName: string;
  lastName: string;
  picture: string;
  language: string;
  roles: string[];
  iss: string;
  exp: number;
  jti: string;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJwt(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
