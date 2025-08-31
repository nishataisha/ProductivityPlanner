// spotify.ts - TypeScript version of the config file

const authEndpoint: string = "https://accounts.spotify.com/authorize";
const clientID: string = "ac1e723c842b459c80400d9a7e0e67d5";
const redirectURL: string = "http://127.0.0.1:3000/callback";
const scopes: string[] = [
  "user-library-read",
  "playlist-read-private", 
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-currently-playing",
  "user-top-read"
];

// Fixed: redirect_uri instead of redirect_url
export const loginEndpoint: string = `${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURL}&scope=${scopes.join(
  "%20"
)}&response_type=token&show_dialog=true`;