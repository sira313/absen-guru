import { json, error } from "@sveltejs/kit";
import fs from "fs";
import path from "path";

export async function POST({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    throw error(403, { message: "Access forbidden" });
  }

  try {
    // Path database SQLite
    const dbPath = path.join(process.cwd(), "absen.db");

    // Cek apakah file database ada
    if (!fs.existsSync(dbPath)) {
      throw error(404, { message: "Database file not found" });
    }

    // Baca file database
    const dbBuffer = fs.readFileSync(dbPath);

    // Buat nama file backup dengan timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup_absen_guru_${timestamp.split("T")[0]}_${timestamp.split("T")[1].split(".")[0]}.db`;

    // Return file sebagai response
    return new Response(dbBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${backupFileName}"`,
        "Content-Length": dbBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Error creating backup:", err);
    if (err.status) {
      throw err; // Re-throw SvelteKit errors
    }
    throw error(500, { message: "Internal server error: " + err.message });
  }
}
