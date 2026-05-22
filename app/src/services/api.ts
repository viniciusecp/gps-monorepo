import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
  }

  return response.json();
}

async function authRequest(path: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new ApiError("Token expirado", 401);
  }

  if (!response.ok) {
    throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
  }

  return response.json();
}

async function refreshAccessToken(userEmail: string, refreshToken: string) {
  const data = await request("/api/cliente/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  const storageUsers = await AsyncStorage.getItem("users");
  if (storageUsers) {
    const users = JSON.parse(storageUsers);
    const userIndex = users.findIndex((u: any) => u.email === userEmail);
    if (userIndex !== -1) {
      users[userIndex].accessToken = data.token;
      await AsyncStorage.setItem("users", JSON.stringify(users));
    }
  }

  return data.token;
}

async function tryAuthRequest<T>(
  path: string,
  userEmail: string,
  getAccessToken: () => string,
  getRefreshToken: () => string,
): Promise<T> {
  const attempt = async (token: string): Promise<T> => {
    return authRequest(path, token) as Promise<T>;
  };

  try {
    return await attempt(getAccessToken());
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && getRefreshToken()) {
      const newToken = await refreshAccessToken(userEmail, getRefreshToken());
      return attempt(newToken);
    }
    throw error;
  }
}

export { request, authRequest, tryAuthRequest, refreshAccessToken };
