import { EnvironmentId } from '@/react/portainer/environments/types';

export const queryKeys = {
  list: (environmentId: EnvironmentId) =>
    ['environments', environmentId, 'kubernetes', 'jobs'] as const,
};