import { useEpg } from "@/stores/use-epg";
import { useIptvPlaylist } from "@/stores/use-iptv-playlist";
import { useMemo } from "react";

export const ChannelDetails: React.FC = () => {
  const channel = useIptvPlaylist((state) => state.channel!);
  const getCurrentProgramme = useEpg((state) => state.getCurrentProgramme);
  const currentProgramme = useMemo(() => getCurrentProgramme(channel.tvg.id ?? ''), [channel]);

  const logoSrc = channel?.tvg?.logo ?? "";
  const channelDisplayName = channel?.name || channel?.tvg?.name || "";
  const programmeTitle = currentProgramme?.title[0]?._value ?? "";

  console.log(channel);
  console.log(currentProgramme);

  return (
    <div className="flex justify-start">
      {logoSrc ? (
        <img
          className="h-24 w-24"
          src={logoSrc}
          alt={`${channelDisplayName || "Channel"} logo`}
        />
      ) : null}
      <div className="flex flex-col items-start">
        <div>{channelDisplayName}</div>
        {currentProgramme && (
          <div>
            🔴&nbsp;
            {currentProgramme.start && currentProgramme.stop && (
              <span>
                [{formatTime(currentProgramme.start)}:
                {formatTime(currentProgramme.stop)}]&nbsp;
              </span>
            )}
            {programmeTitle && <span>{programmeTitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}
