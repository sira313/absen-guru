import { validateSession, SESSION_COOKIE_NAME } from "$lib/server/auth.js";
import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

export async function GET({ cookies }) {
  // Extract sessionId from cookies using the correct cookie name
  const sessionId = cookies.get(SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    throw error(403, "Akses ditolak - tidak ada session");
  }

  try {
    const { session, user } = await validateSession(sessionId);
    
    if (!session || !user || user.role !== "admin") {
      throw error(403, "Akses ditolak - session tidak valid atau bukan admin");
    }

    // Database export logic
    const dbPath = path.resolve(process.cwd(), "absen.db");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-absen-${timestamp}.db`;

    // Check if source database exists
    const fileStats = await fs.stat(dbPath);
    if (!fileStats.isFile()) {
      throw error(404, "Database tidak ditemukan");
    }

    // Read the database file
    const fileBuffer = await fs.readFile(dbPath);

    // Also create a backup copy in the backups folder for server records
    try {
      const backupDir = path.resolve(process.cwd(), "backups");
      await fs.mkdir(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, filename);
      await fs.copyFile(dbPath, backupPath);
    } catch (backupError) {
      console.warn("Warning: Could not create server backup copy:", backupError);
      // Continue with download even if server backup fails
    }

    // Return file for download
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileStats.size.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Error exporting database:", err);
    throw error(500, "Gagal melakukan export database");
  }
}