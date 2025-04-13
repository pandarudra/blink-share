import bcrypt from "bcryptjs";

export const genhash = (str: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(str, salt);
};

export const comparehash = (str: string, hash: string): boolean => {
  return bcrypt.compareSync(str, hash);
};
