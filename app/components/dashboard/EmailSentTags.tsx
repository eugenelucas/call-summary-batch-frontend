// EmailSentTags.tsx
import { Mail, AlertCircle, Bell } from "lucide-react";
import Image from "next/image";

type EmailSentTagsProps = {
  emailSent: string[];
  sentimentScore?: number; // Add sentimentScore prop
};

const EmailSentTags = ({ emailSent, sentimentScore }: EmailSentTagsProps) => {
  const getStyle = (label: string) => {
    if (label.toLowerCase().includes("action")) {
      return {
        bg: "bg-orange-100",
        text: "text-orange-500",
        border: "border-orange-300",
        icon: <Bell className="w-6 h-6 mr-1 text-orange-500 text-md" />,
      };
    }

    return {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
      icon: <Mail className="w-6 h-6 mr-1 text-blue-600 text-md" />,
    };
  };

  return (
    <div className="emalsent-tag">
      <div className="mb-6 px-12 py-8 pr-6 flex gap-3 border-b border-gray-250 items-center">
        <Image src="/email-mail-svgrepo.svg" alt="Email" width={50} height={50} />
        <div className="flex flex-col">
          <span className="text-xl font-semibold ot-title">Emails Sent</span>
        </div>
      </div>
      <div className="flex px-10 py-6 flex-col gap-4 mx-8 mb-10">
        {/* Conditionally render span tags based on sentimentScore */}
        {/* {emailSent.map((label, idx) => {
          const style = getStyle(label);
          return (
            <div
              key={idx}
              className={`flex items-center p-4 rounded-full text-md font-medium gap-2 ${style.bg} ${style.text} border ${style.border}`}
            >
              {style.icon}
              {label}
            </div>
          );
        })} */}
        <div className="flex items-center py-4 px-8 rounded-full text-md font-medium gap-4 bg-blue-100 text-blue-800 border border-blue-300" >
              <Mail className="w-8 h-6 mr-1 text-blue-600 text-md" />
              Follow up email sent<br/> to the agent
        </div>
      {sentimentScore !== undefined && sentimentScore >= 6 ? (
          <>
          </>
        ) : (
          <div
              className="flex items-center py-4 px-8 rounded-full text-md font-medium gap-4 bg-orange-100 text-orange-800 border border-orange-300"
            >
              <Bell className="w-8 h-6 mr-1 text-orange-500 text-md" />
              Alert email sent to<br/> the Supervisor
            </div>
        )}
      </div>
    </div>
  );
};

export default EmailSentTags;