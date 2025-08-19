import crypto from "crypto";

export function generateInviteToken() {
  const raw = crypto.randomBytes(32).toString("hex"); 
  const hash = crypto.createHash("sha256").update(raw).digest("hex"); 
  return { raw, hash };
}
