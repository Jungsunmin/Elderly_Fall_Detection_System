let backendhost;

const hostname = window && window.location && window.location.hostname;
if (hostname === "localhost" || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    backendhost = `http://${hostname}:4000`;
}
else {
    backendhost = "http://localhost:4000"; // fallback
}

export const API_BASE_URL = `${backendhost}`;