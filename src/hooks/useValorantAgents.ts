import { useState, useEffect } from 'react';
import { ValorantAgent, ValorantApiResponse } from '../types/valorant';

export function useValorantAgents() {
  const [agents, setAgents] = useState<ValorantAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        const data: ValorantApiResponse = await response.json();

        if (data.status === 200) {
          setAgents(data.data);
        } else {
          setError('Failed to fetch agents');
        }
      } catch (err) {
        setError('Error fetching agents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  return { agents, loading, error };
}
