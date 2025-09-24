import jwt, {type Secret, type SignOptions } from "jsonwebtoken";

export const generateAccessToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: string | any,
): string => {
  const options: SignOptions = {
    expiresIn,
    algorithm: 'HS256',
  };

  const token = jwt.sign(payload, secret, options);

  return token;
};