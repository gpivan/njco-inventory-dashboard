import { useEffect, useState } from 'react';
import { fetchUser, type AuthUser } from './api';

export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  return user;
}

// "jane.doe@gmail.com" -> "Jane Doe": fallback when Google gave no display name
const nameFromEmail = (email: string) =>
  email.split('@')[0].split(/[._-]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export const displayName = (u: AuthUser) => u.name || nameFromEmail(u.email);

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
