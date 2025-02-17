import { jwtVerify } from "jose";

export async function verifyJWT(token: string) {
  try {
    // Verifying the token with the secret key
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return payload;  // You can return the payload to extract user information if needed
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
