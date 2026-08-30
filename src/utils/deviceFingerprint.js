const crypto = require("crypto");

const getDeviceId = (req) => {
  const userAgent = req.get("User-Agent") || "";
  const accept = req.get("Accept") || "";

  const raw = `${userAgent}|${accept}`;

  return crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");
};