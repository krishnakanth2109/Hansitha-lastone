import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LoopingYouTubeVideo: React.FC = () => {
  const videoId = "Wd-FLUFs8_o";
  const playerRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy?.();
        playerRef.current = null;
      }

      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            event.target.setPlaybackQuality("highres");
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              event.target.setPlaybackQuality("highres");
            }
          },
        },
      });
    };

    // If API already loaded, create player immediately
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      // Load API if not loaded
      if (!document.getElementById("youtube-api")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "youtube-api";
        document.body.appendChild(tag);
      }

      // Store the original callback in case other scripts use it
      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };
    }

    // Cleanup on unmount
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.playVideo(); // ✅ force play so audio starts on mobile
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 30px",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          aspectRatio: "16/9",
        }}
      >
        <div
          id="yt-player"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
        <button
          onClick={toggleMute}
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            padding: "6px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "50%",
            zIndex: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
      </div>

      <style>{`
        button svg {
          width: 20px;
          height: 20px;
        }
        @media (max-width: 768px) {
          button svg {
            width: 18px;
            height: 18px;
          }
        }
        @media (max-width: 480px) {
          button {
            bottom: 5px;
            right: 5px;
            padding: 4px;
          }
          button svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoopingYouTubeVideo;
