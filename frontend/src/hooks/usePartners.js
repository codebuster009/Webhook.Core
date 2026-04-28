import { useQuery } from '@tanstack/react-query';
import { fetchPartners } from '../services/partners.api.js';

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });
}
