
import Image from 'next/image';
import {LoganimationsIcon} from "../../chat-ui-backup/components/icons"

export default function WelcomeAgent() {
return (
<div className="max-w-6xl w-full grid grid-cols-[40%_60%] gap-10 items-center">
      <div className="flex justify-center">
              <Image
                src="/dashboard-main1.svg"
                alt="I Call Summary Illustration"
                width={349}
                height={282}
                className="w-full max-w-md"
              />
      </div>
      <div className="container mx-auto p-4">
        {/* <h1 className="text-2xl font-bold mb-4">Agent Statistics Dashboard</h1> */}
            <div className="flex flex-col items-left justify-center">
              <LoganimationsIcon width={73} />
              <div className="text-4xl font-bold w-2xl otitle mt-4 mb-4">
                Welcome to<br></br>
                Comprehensive Agent Statistics <br></br>and Analytics
              </div>
              <p className="osubtitle text-base mb-6">
                Monitor calls, ratings, and anomalies to drive smarter<br></br> performance decisions
              </p>
            </div>
      </div>
      </div>
    )
}