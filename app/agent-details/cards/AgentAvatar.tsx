interface AgentAvatarProps {
  agentName: string
}
import Image from 'next/image';

export default function AgentAvatar({ agentName }: AgentAvatarProps) {
    const firstLetter = agentName.charAt(0).toUpperCase();
  return (
   <div className='flex flex-col text-center agent-avatar-wrapper bg-white rounded-xl px-12 py-6 gap-3 w-[20%]'>
                  <p className='text-center text-[18px]'>Agent Name</p>
                  <div className='rounded-full bg-blue-600 text-white agent-avatar-fistleter m-auto'>{firstLetter}</div>
                  <div className='text-[24px] font-semibold'>
                      {agentName}
                  </div>
   </div>
  )
}

