import Image from 'next/image';
import AgentDetailsPage from './AgentDetailsPage';

interface Agent {
  agent_id: number;
  agent_name: string;
  total_calls: number;
  avg_agent_rating: number;
  avg_sentiment_rating: number;
  total_anomalies: number;
  detected_audiofiles : [];
}

export const metadata = {
  title: 'Agent Statistics Dashboard',
  description: 'Agent statistics dashboard',
};

async function fetchAgentStatistics(): Promise<Agent[]> {
  try {
    const response = await fetch(
      'https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/agent_statistics',
      {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      return [];
    }
    const data: Agent[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export default async function AgentDetails() {
  const initialAgents = await fetchAgentStatistics();
  return (
    <div className="hidden-1 ot-dashbord-main-container pt-8">
      <div className="ot-min-h-screen flex items-top justify-center mt-12">
            <AgentDetailsPage initialAgents={initialAgents} />
      </div>
    </div>
  );
}


