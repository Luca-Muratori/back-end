import createError from "http-errors";
import jwt from "jsonwebtoken";
import UserSchema from "../api/user/model.js";

export const authenticateUser = async (user) => {
  // 1. Given the user, it generates two tokens (accessToken & refreshToken)
  console.log(user._id.toString(), user.role);
  const accessToken = await generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
  });
  const refreshToken = await generateRefreshToken({
    _id: user._id.toString(),
    role: user.role,
  });
  console.log("access and refresh tokens", accessToken);
  // 2. Refresh Token should be stored in db
  user.refreshToken = refreshToken;
  await user.save(); //remember that user is a MONGOOSE DOCUMENT, therefore it has some special posers like .save() method

  // 3. Returns both the tokens
  return { accessToken, refreshToken };
};

const generateAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 day" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    })
  );

const generateRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_SECRET,
      { expiresIn: "3 day" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    })
  );

export const verifyRefreshTokenAndGenerateNewTokens = async (
  currentRefreshToken
) => {
  try {
    // 1. Check the validity of the token (exp date & integrity)
    const payload = await verifyRefreshToken(currentRefreshToken);

    // 2. If the token is valid, we shall check if it matches to the one we have in db
    const user = await UserSchema.findById(payload._id);
    if (!user)
      throw new createError(404, `User with id ${payload._id} not found!`);

    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      // 3. If everything is fine --> generate new tokens and return them
      const { accessToken, refreshToken } = await authenticateUser(user);
      return { accessToken, refreshToken };
    } else {
      throw new createError(401, "Refresh token not valid!");
    }
  } catch (error) {
    throw new createError(401, "Refresh token not valid!");
  }
};
