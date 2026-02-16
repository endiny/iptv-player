import { useEpg } from "@/stores/use-epg";
import { useIptvPlaylist } from "@/stores/use-iptv-playlist";
import { useMemo } from "react";

export const ChannelDetails: React.FC = () => {
  const channel = useIptvPlaylist((state) => state.channel!);
  const getCurrentProgramme = useEpg((state) => state.getCurrentProgramme);
  const currentProgramme = useMemo(() => getCurrentProgramme(channel.tvg.id ?? ""), [channel, getCurrentProgramme]);

  const logoSrc = channel?.tvg?.logo ?? "";
  const channelDisplayName = channel?.name || channel?.tvg?.name || "";
  const programmeTitle = currentProgramme?.title[0]?._value ?? "No programme information";

  return (
    <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-black/50 p-2.5 backdrop-blur-sm sm:mx-4 sm:gap-3 sm:p-3 md:mx-6 md:max-w-3xl">
      {logoSrc ? (
        <img
          className="h-11 w-11 rounded object-cover sm:h-14 sm:w-14 md:h-16 md:w-16"
          src={logoSrc}
          alt={`${channelDisplayName || "Channel"} logo`}
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded bg-white/10 text-lg sm:h-14 sm:w-14 sm:text-xl md:h-16 md:w-16">📺</div>
      )}
      <div className="min-w-0 text-left">
        <div className="truncate text-sm font-semibold sm:text-base md:text-lg">{channelDisplayName}</div>
        <div className="truncate text-xs text-white/90 sm:text-sm">
          {currentProgramme?.start && currentProgramme?.stop && (
            <span>
              🔴 {formatTime(currentProgramme.start)}-{formatTime(currentProgramme.stop)} ·{" "}
            </span>
          )}
          {programmeTitle}
        </div>
      </div>
    </div>
  );
};

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}
