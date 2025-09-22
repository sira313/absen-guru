import bcrypt from "bcrypt";
import { queries } from "./database.js";
import { generateId } from "lucia";

export async function createUser({
  username,
  email,
  password,
  fullName,
  role,
}) {
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = generateId(15);

  try {
    queries.createUser.run(
      userId,
      username,
      email,
      passwordHash,
      fullName,
      role,
    );
    return { success: true, userId };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { success: false, error: "Username atau email sudah terdaftar" };
    }
    return { success: false, error: "Gagal membuat user" };
  }
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function getUserById(id) {
  return queries.getUserById.get(id);
}

export function getUserByUsername(username) {
  return queries.getUserByUsername.get(username);
}
