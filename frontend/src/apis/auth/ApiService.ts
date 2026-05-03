import { API_BASE_URL } from "./api-config";

export async function call(api: string, method: string, request?: unknown) {
  const accessToken = localStorage.getItem("accessToken");

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = `${API_BASE_URL}${api}`;
  const options: RequestInit = {
    method,
    headers,
  };

  if (request !== undefined && request !== null) {
    options.body = JSON.stringify(request);
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 403) {
      window.location.href = "/login";
      throw new Error("Forbidden");
    }

    if (!response.ok) {
      throw new Error(response.statusText || `HTTP ${response.status}`);
    }

    // 204 대응
    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function login() {
  const frontendUrl = window.location.origin;
  const redirectUri = `${frontendUrl}/login/oauth2/code/google`;

  window.location.href =
    `${API_BASE_URL}/oauth2/authorization/google` +
    `?redirect_uri=${encodeURIComponent(redirectUri)}`;
}