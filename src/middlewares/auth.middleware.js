const { UnauthorizedError } = require("../utils/error");
const { verifyAccessToken } = require("../utils/auth");

const authMiddleware = (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedError(
        "Access token is required.",
        "ACCESS_TOKEN_REQUIRED"
      );
    }

    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      throw new UnauthorizedError(
        "Access token is invalid or expired.",
        "ACCESS_TOKEN_INVALID"
      );
    }

    // Store authenticated user information
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;