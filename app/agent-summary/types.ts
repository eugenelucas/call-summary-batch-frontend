// types.ts
export interface Agent {
  agent_id: number
  agent_name: string
  total_calls: number
  avg_agent_rating: number
  avg_sentiment_rating: number
  avg_duration_seconds: number
  total_anomalies: number
  detected_audiofiles: string[]
}