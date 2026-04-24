import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ProjectType = 'web' | 'system_web' | 'system_app' | 'university';
export type ProjectStatus = 'active' | 'inactive' | 'suspended';
export type HealthStatus = 'online' | 'offline';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  url: string;
  admin_url: string;
  api_key: string;
  status: ProjectStatus;
  health: HealthStatus;
  last_ping: string;
  next_payment: string;
  metrics?: {
    users: number;
    sales: number;
    errors: number;
  };
}
