"use client";

import { useEffect, useRef } from "react";

interface VideoSessionProps {
  roomId: string;
  userName: string;
  onLeave?: () => void;
}

export default function VideoSession({
  roomId,
  userName,
  onLeave,
}: VideoSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      roomName: roomId,
      width: "100%",
      height: "100%",
      parentNode: containerRef.current,
      userInfo: {
        displayName: userName,
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "chat",
          "recording",
          "livestreaming",
          "settings",
          "raisehand",
          "videoquality",
          "filmstrip",
          "tileview",
          "select-background",
          "mute-everyone",
        ],
      },
    };

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      const api = new (window as unknown as Record<string, new (...args: unknown[]) => { addEventListener: (event: string, handler: () => void) => void }>).JitsiMeetExternalAPI(domain, options);
      api.addEventListener("readyToClose", () => {
        if (onLeave) onLeave();
      });
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomId, userName, onLeave]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gray-900"
    />
  );
}
