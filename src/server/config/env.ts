// Environment is read lazily so a missing variable fails the request that needs it, not the build.

function readEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

export function getMongoUri() {
  const uri = readEnv("MONGODB_URI");
  if (!uri) throw new Error("MONGODB_URI is not set");
  return uri;
}

export function getDeliveryConfig() {
  return {
    token: readEnv("DELHIVERY_API_TOKEN"),
    baseUrl: readEnv("DELHIVERY_API_BASE_URL") ?? "https://track.delhivery.com",
  };
}

export function getImageKitConfig() {
  const publicKey = readEnv("IMAGEKIT_PUBLIC_KEY");
  const privateKey = readEnv("IMAGEKIT_PRIVATE_KEY");
  const urlEndpoint = readEnv("IMAGEKIT_URL_ENDPOINT")?.replace(/\/+$/, "");
  return publicKey && privateKey && urlEndpoint ? { publicKey, privateKey, urlEndpoint } : null;
}

export const isProduction = process.env.NODE_ENV === "production";
