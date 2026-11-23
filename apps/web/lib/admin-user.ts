'use client';

import { useEffect, useState } from 'react';

// Prototype only: the signed-in person comes from the sign-up screen (kept in sessionStorage),
// with a sample fallback when someone opens a screen directly.
export type AdminUser = { name: string; email: string };

const FALLBACK: AdminUser = { name: 'Priya Raman', email: 'priya@company.com' };

export function useAdminUser(): AdminUser {
  const [user, setUser] = useState<AdminUser>(FALLBACK);
  useEffect(() => {
    try {
      const name = sessionStorage.getItem('afpi-signup-name');
      const email = sessionStorage.getItem('afpi-signup-email');
      setUser({ name: name || FALLBACK.name, email: email || FALLBACK.email });
    } catch {}
  }, []);
  return user;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}
