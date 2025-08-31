// SpotifyPlayer.tsx - TypeScript version with proper types

import React, { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
} from "lucide-react";
import { loginEndpoint } from "./spotify";

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  album: {
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
}

interface CurrentTrack {
  name: string;
  album: {
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
}

interface PlayerState {
  track_window: {
    current_track: CurrentTrack;
  };
  position: number;
  duration: number;
  paused: boolean;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const SpotifyPlayer: React.FC = () => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(50);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  const token = localStorage.getItem("spotifyToken");

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      initializePlayer();
    }
  }, [token]);

  const initializePlayer = () => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Digital Planner Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token!);
        },
        volume: 0.5,
      });

      // Error handling
      spotifyPlayer.addListener(
        "initialization_error",
        ({ message }: { message: string }) => {
          console.error("Failed to initialize", message);
        }
      );

      spotifyPlayer.addListener(
        "authentication_error",
        ({ message }: { message: string }) => {
          console.error("Failed to authenticate", message);
          setIsAuthenticated(false);
          localStorage.removeItem("spotifyToken");
        }
      );

      // Ready
      spotifyPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
          console.log("Ready with Device ID", device_id);
        }
      );

      // Player state changed
      spotifyPlayer.addListener(
        "player_state_changed",
        (state: PlayerState | null) => {
          if (!state) return;

          setCurrentTrack(state.track_window.current_track);
          setPosition(state.position);
          setDuration(state.duration);
          setIsPlaying(!state.paused);
        }
      );

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };
  };

  const searchTracks = async () => {
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (error) {
      console.error("Error searching tracks:", error);
    }
  };

  const playTrack = (uri: string) => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [uri] }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const togglePlay = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const skipToNext = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const skipToPrevious = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${secondsStr}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-bold text-gray-800 mb-2">Spotify Player</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Spotify account to play music
          </p>
          <a
            href={loginEndpoint}
            className="inline-block bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition-all duration-300"
          >
            Connect Spotify
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-green-600" />
        Spotify Player
      </h3>

      {/* Search Section */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchTracks()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={searchTracks}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-sm"
          >
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto bg-white rounded-lg border border-gray-200">
            {searchResults.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  playTrack(track.uri);
                  setSearchResults([]);
                  setSearchQuery("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-all duration-300 border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm font-medium text-gray-800">
                  {track.name}
                </div>
                <div className="text-xs text-gray-500">
                  {track.artists[0].name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={currentTrack.album.images[0]?.url}
              alt={currentTrack.name}
              className="w-12 h-12 rounded-lg"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">
                {currentTrack.name}
              </div>
              <div className="text-xs text-gray-500">
                {currentTrack.artists[0].name}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(position / duration) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={skipToPrevious}
          className="p-2 hover:bg-white rounded-full transition-all duration-300"
        >
          <SkipBack className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={togglePlay}
          className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={skipToNext}
          className="p-2 hover:bg-white rounded-full transition-all duration-300"
        >
          <SkipForward className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1"
        />
        <span className="text-xs text-gray-600 w-8">{volume}%</span>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
