/**
 * FatSecret OAuth 1.0 Service
 * This implementation uses pure JS to handle request signing.
 */

// Using credentials provided by the user (fallback to placeholders if process.env is not available)
const CLIENT_ID =
  process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID ||
  "3f75e82ee0cb492ba4e11450c210c400";
const CLIENT_SECRET =
  process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET ||
  "48584776d87e4b678cbcd726934d3295";

interface FoodResult {
  food_id: string;
  food_name: string;
  food_description: string;
  brand_name?: string;
}

interface FoodDetails {
  food_id: string;
  food_name: string;
  food_type: string;
  servings: {
    serving: any[] | any;
  };
}

/**
 * RFC 3986 Compliant Encoding
 * OAuth 1.0 is very sensitive to exact encoding.
 */
const rfc3986 = (str: string): string => {
  return encodeURIComponent(str)
    .replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    )
    .replace(/%7E/g, "~"); // Ensure ~ is not encoded (encodeURIComponent encodes it in some environments)
};

/**
 * Robust HMAC-SHA1 Implementation
 */
const hmacSHA1 = (key: string, message: string): string => {
  const blockSize = 64;
  const encoder = new TextEncoder();
  let keyBytes = encoder.encode(key);

  if (keyBytes.length > blockSize) {
    keyBytes = sha1(keyBytes) as any;
  }

  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(keyBytes);

  const innerPad = new Uint8Array(blockSize);
  const outerPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    innerPad[i] = paddedKey[i] ^ 0x36;
    outerPad[i] = paddedKey[i] ^ 0x5c;
  }

  const messageBytes = encoder.encode(message);
  const innerHash = sha1(concat(innerPad, messageBytes)) as any;
  const outerHash = sha1(concat(outerPad, innerHash)) as any;

  return base64Encode(outerHash);
};

const sha1 = (bytes: Uint8Array): Uint8Array => {
  const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  const h = new Uint32Array([
    0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0,
  ]);

  const len = bytes.length;
  const totalLen = Math.ceil((len + 9) / 64) * 64;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 4, (len * 8) >>> 0);
  if (len * 8 > 0xffffffff) {
    view.setUint32(totalLen - 8, Math.floor((len * 8) / 0x100000000));
  }

  const w = new Uint32Array(80);
  for (let i = 0; i < totalLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4);
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let [a, b, c, d, e] = h;
    for (let j = 0; j < 80; j++) {
      const f =
        j < 20
          ? (b & c) | (~b & d)
          : j < 40
            ? b ^ c ^ d
            : j < 60
              ? (b & c) | (b & d) | (c & d)
              : b ^ c ^ d;
      const k = K[Math.floor(j / 20)];
      const temp = (rotl(a, 5) + f + e + k + w[j]) | 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
  }

  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  for (let i = 0; i < 5; i++) {
    resultView.setUint32(i * 4, h[i]);
  }
  return result;
};

const rotl = (n: number, c: number) => (n << c) | (n >>> (32 - c));

const concat = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
};

const base64Encode = (bytes: Uint8Array): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i;
  for (i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const c = (b1 << 16) | (b2 << 8) | b3;
    result += chars[(c >> 18) & 0x3f];
    result += chars[(c >> 12) & 0x3f];
    result += i + 1 < bytes.length ? chars[(c >> 6) & 0x3f] : "=";
    result += i + 2 < bytes.length ? chars[c & 0x3f] : "=";
  }
  return result;
};

/**
 * Generate OAuth 1.0 Signature
 */
const getSignedParams = (
  method: string,
  url: string,
  params: Record<string, string>,
) => {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: CLIENT_ID,
    oauth_nonce:
      Math.random().toString(36).substring(2) + Date.now().toString(36),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();

  // 1. Normalized Parameters String
  const paramString = sortedKeys
    .map((key) => `${rfc3986(key)}=${rfc3986(allParams[key])}`)
    .join("&");

  // 2. Signature Base String
  const baseString = `${method.toUpperCase()}&${rfc3986(url)}&${rfc3986(paramString)}`;

  // 3. Signing Key
  const signingKey = `${rfc3986(CLIENT_SECRET)}&`;

  console.log("OAuth Debug - Base String:", baseString);
  console.log("OAuth Debug - Signing Key:", signingKey);

  // 4. Generate Signature
  const signature = hmacSHA1(signingKey, baseString);

  return { ...allParams, oauth_signature: signature };
};

export const searchFoods = async (query: string): Promise<FoodResult[]> => {
  if (query.trim().length < 3) return [];

  try {
    console.log("Searching foods (OAuth 1.0) for:", query);

    const baseUrl = "https://platform.fatsecret.com/rest/server.api";
    const requestParams = {
      method: "foods.search",
      search_expression: query,
      format: "json",
      max_results: "5",
    };

    // FatSecret works with both GET and POST, but GET is easier to verify
    const signedParams = getSignedParams("GET", baseUrl, requestParams);

    // Build query string
    const queryString = Object.keys(signedParams)
      .map((key) => `${rfc3986(key)}=${rfc3986((signedParams as any)[key])}`)
      .join("&");

    const fullUrl = `${baseUrl}?${queryString}`;
    console.log("Request URL:", fullUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.error) {
      console.error("FatSecret API Error:", data.error.message);
      throw new Error(
        `FatSecret API Error (${data.error.code}): ${data.error.message}`,
      );
    }

    console.log("Search results received:", data.foods?.food?.length || 0);
    return data.foods?.food || [];
  } catch (error) {
    console.error("FatSecret Search Error:", error);
    return [];
  }
};

export const getFoodDetails = async (
  foodId: string,
): Promise<FoodDetails | null> => {
  try {
    console.log("Fetching food details for ID:", foodId);

    const baseUrl = "https://platform.fatsecret.com/rest/server.api";
    const requestParams: Record<string, string> = {
      method: "food.get",
      food_id: foodId,
      format: "json",
      region: "RU", // Maintain regional consistency
      language: "ru",
    };

    const signedParams = getSignedParams("GET", baseUrl, requestParams);

    const queryString = Object.keys(signedParams)
      .map((key) => `${rfc3986(key)}=${rfc3986((signedParams as any)[key])}`)
      .join("&");

    const fullUrl = `${baseUrl}?${queryString}`;
    const response = await fetch(fullUrl);
    const data = await response.json();

    if (data.error) {
      console.error("FatSecret Details API Error:", data.error.message);
      return null;
    }

    return data.food || null;
  } catch (error) {
    console.error("FatSecret Details Error:", error);
    return null;
  }
};
