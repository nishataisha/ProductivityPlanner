// SpotifyCallback.tsx - Create this file instead of .js

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HashParams {
  [key: string]: string;
}

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL hash
    const getTokenFromUrl = (): HashParams => {
      return window.location.hash
        .substring(1)
        .split("&")
        .reduce((initial: HashParams, item: string) => {
          const parts = item.split("=");
          initial[parts[0]] = decodeURIComponent(parts[1]);
          return initial;
        }, {});
    };

    const hash = getTokenFromUrl();
    window.location.hash = ""; // Clear the hash
    const token = hash.access_token;

    if (token) {
      localStorage.setItem("spotifyToken", token);
      navigate("/"); // Redirect back to main app
    } else {
      // Handle error
      console.error("No token found");
      navigate("/"); // Still go back to main app
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Connecting to Spotify...
        </h2>
        <p className="text-gray-600">
          Please wait while we authenticate your account.
        </p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
