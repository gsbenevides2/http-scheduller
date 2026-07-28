import * as jose from "jose";
import { getEnv } from "@/app/utils/getEnv";
import { CacheClient } from "@/server/utils/cacheClient";

interface ServiceAccount {
  client_id: string;
}

function getExpirationFromJWT(token: string): number | null {
  try {
    const decoded = jose.decodeJwt(token);
    if (decoded && typeof decoded.exp === "number") {
      return decoded.exp;
    }
    return null;
  } catch {
    return null;
  }
}

function isJWTExpired(token: string, bufferSeconds: number = 0): boolean {
  const exp = getExpirationFromJWT(token);
  if (exp === null) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return exp < currentTime + bufferSeconds;
}

async function getAndValidFromCache(clientId: string): Promise<string | null> {
  const value = await CacheClient.get(`authentik-login:${clientId}`);
  if (!value) return null;
  if (isJWTExpired(value)) return null;
  return value;
}

async function setCache(clientId: string, token: string): Promise<void> {
  const exp = getExpirationFromJWT(token);
  const ttl = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 60) : 3600;
  await CacheClient.set(`authentik-login:${clientId}`, token, ttl);
}

export async function loginInAuthentik(
  serviceAccount: ServiceAccount,
): Promise<{ access_token: string }> {
  const cacheToken = await getAndValidFromCache(serviceAccount.client_id);
  if (cacheToken) {
    return { access_token: cacheToken };
  }

  const username = getEnv("AUTHENTIK_USERNAME");
  const password = getEnv("AUTHENTIK_PASSWORD");
  const authentikBaseUrl = getEnv("AUTHENTIK_URL");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("client_id", serviceAccount.client_id);
  urlencoded.append("grant_type", "client_credentials");
  urlencoded.append("scope", "profile");
  const base64 = btoa(`${username}:${password}`);
  urlencoded.append("client_secret", base64);

  const tokenUrl = new URL("/application/o/token/", authentikBaseUrl).toString();

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Authentik token: ${response.statusText}`);
  }

  const json = (await response.json()) as { access_token: string };
  await setCache(serviceAccount.client_id, json.access_token);
  return json;
}
