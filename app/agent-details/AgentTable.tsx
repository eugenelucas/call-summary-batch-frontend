import type { Agent } from './AgentDetailsPage';
import AverageAgentRating from "./cards/AverageAgentRating";
import SentimentScoreGauge from './cards/SentimentScoreGauge';
import TotalNumberofCalls from './cards/TotalNumberofCalls';
import AnomalyChart from './cards/AnomalyChart';
import AgentAvatar from './cards/AgentAvatar';
import Image from 'next/image';

interface AgentTableProps {
  agents: Agent[];
  onBack: () => void;
}

const AgentTable: React.FC<AgentTableProps> = ({ agents, onBack }) => {
  return (
    <div className="container mx-auto p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-4 px-4 py-2 text-blue-600 rounded"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.18131 5.68546L5.12734 8.9011C5.36542 9.18211 5.33092 9.60317 5.05027 9.84156C4.76962 10.0799 4.3491 10.0454 4.11102 9.7644L0.193359 5.4882C0.137024 5.43153 0.0913745 5.36513 0.0586068 5.29221C0.0178584 5.20157 -0.00210677 5.10295 0.000175844 5.00357L0.00018562 5.00295C0.00245399 4.9038 0.0267135 4.80639 0.071208 4.71778C0.0755347 4.7092 0.0800457 4.70071 0.0847379 4.69233C0.11189 4.64368 0.145072 4.59867 0.183495 4.55835L4.20532 0.213664C4.4555 -0.0566061 4.87713 -0.0726201 5.14705 0.177878C5.41696 0.428375 5.43296 0.850553 5.18279 1.12081L2.19266 4.35098H9.33361C9.70165 4.35098 10 4.64972 10 5.01822C10 5.38673 9.70165 5.68547 9.33361 5.68547H2.18131V5.68546Z" fill="url(#paint0_linear_3656_10002)"/>
          <defs>
            <linearGradient id="paint0_linear_3656_10002" x1="1.24996" y1="0.958503" x2="9.70977" y2="9.36583" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E6DCC"/>
              <stop offset="1" stopColor="#4938CF"/>
            </linearGradient>
          </defs>
        </svg>
        Back
      </button>
      {agents.map((agent) => (
        <div key={agent.agent_id} className="flex flex-col gap-3 mb-12"> {/* Added key prop */}
          <div className="flex text-center gap-3">
            <AgentAvatar agentName={agent.agent_name ?? ""} />
            <TotalNumberofCalls totalCall={agent.total_calls ?? 0} />
            <AverageAgentRating score={agent.avg_agent_rating ?? 0} />
            <SentimentScoreGauge sentimentScore={agent.avg_sentiment_rating ?? 0} />
          </div>
          <div className="flex text-left gap-3 px-16 py-4 bg-white items-center mb-12 ">
            <div className="flex flex-col gap-3 w-[18%] ">
              <h3 className="text-[26px] font-bold">Total Anomalies</h3>
              <div>
                Automated anomaly detection. Actionable
                insights at a glance.Strengthen
                quality and compliance.
              </div>
            </div>
            <div className='w-[45%] flex gap-3 items-center'>
              <div className='w-[330px]'>
                <AnomalyChart agent={agent} />
              </div>
              <div className="flex flex-col gap-2 w-[230px]">
                <div className="px-6 py-4 flex gap-2 items-center bg-gray-100 rounded-xl">
                  <span className="AnomalyChart-calls-color"></span>
                  <span>Total Calls</span>
                  <span className="text-[30px] font-bold">{agent.total_calls}</span>
                </div>
                <div className="px-6 py-4 flex gap-2 items-center bg-gray-100 active-color rounded-xl">
                  <span className="AnomalyChart-Anomalies-color"></span>
                  <span>Total Anomalies</span>
                  <span className="text-[30px] font-bold">{agent.total_anomalies}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-12 h-[350px] w-[32%] border-l-2 border-gray-100">
              <h2 className="text-[20px] font-bold">Anomalies detection file name</h2>
              {agent.detected_audiofiles && agent.detected_audiofiles.length > 0 ? (
                <ul className="list-none w-full m-0 p-0 flex flex-col gap-2">
                  {agent.detected_audiofiles.map((file, index) => (
                    <li className="w-full p-3 text-[16px] bg-white rounded-md detected_audiofiles-list" key={index}>{file}</li>
                  ))}
                </ul>
              ) : (
                <div className='text-center flex items-center justify-center h-[100%]'>
                  <Image
                    src="/anomaliesfileEnpty.png"
                    alt="I Call Summary Illustration"
                    width={107}
                    height={128}
                  />
                </div>
              )}
            </div>
          </div>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default AgentTable;