import { validateSession } from "$lib/server/auth.js";
import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET({ url, cookies }) {
  // Extract sessionId from cookies like in hooks.server.js
  const sessionId = cookies.get("sessionId");
  const user = sessionId ? await validateSession(sessionId) : null;

  if (!user || user.role !== "admin") {
    throw error(403, "Akses ditolak");
  }

  const filename = url.searchParams.get("file");
  if (!filename) {
    throw error(400, "Parameter file tidak ditemukan");
  }

  // Security: ensure filename doesn't contain path traversal
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw error(400, "Nama file tidak valid");
  }

  const backupPath = path.resolve(process.cwd(), "backups", filename);

  try {
    const fileStats = await fs.stat(backupPath);
    if (!fileStats.isFile()) {
      throw error(404, "File tidak ditemukan");
    }

    const fileBuffer = await fs.readFile(backupPath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileStats.size.toString(),
      },
    });
  } catch (err) {
    console.error("Error serving backup file:", err);
    throw error(404, "File backup tidak ditemukan");
  }
}
