import { redirect, fail } from "@sveltejs/kit";
import { dbHelpers } from "$lib/server/db.js";
import { db } from "$lib/server/db.js";
import { users } from "$lib/server/schema.js";
import { eq, like, or } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function load({ locals }) {
  const user = locals.user;

  if (!user) {
    throw redirect(302, "/login");
  }

  if (user.role !== "admin") {
    throw redirect(302, "/");
  }

  try {
    // Get school settings
    const schoolSettings = await dbHelpers.getSchoolSettings();

    // Get users with Kepala Sekolah position (includes variations)
    const kepalaSekolahUsers = await db
      .select({
        id: users.id,
        name: users.name,
        nip: users.nip,
        position: users.position,
      })
      .from(users)
      .where(
        or(
          like(users.position, "%Kepala Sekolah%"),
          like(users.position, "%Principal%"),
          like(users.position, "%Headmaster%"),
          eq(users.position, "Kepala Sekolah"),
        ),
      );

    return {
      user,
      schoolSettings,
      kepalaSekolahUsers,
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return {
      user,
      schoolSettings: {},
      kepalaSekolahUsers: [],
    };
  }
}

export const actions = {
  updateSchool: async ({ request, locals }) => {
    const user = locals.user;

    if (!user || user.role !== "admin") {
      return fail(403, { message: "Akses ditolak" });
    }

    try {
      const formData = await request.formData();
      const schoolData = {
        school_name: formData.get("school_name")?.toString() || "",
        school_npsn: formData.get("school_npsn")?.toString() || "",
        school_address: formData.get("school_address")?.toString() || "",
        school_phone: formData.get("school_phone")?.toString() || "",
        school_email: formData.get("school_email")?.toString() || "",
        school_principal_name:
          formData.get("school_principal_name")?.toString() || "",
        school_principal_nip:
          formData.get("school_principal_nip")?.toString() || "",
      };

      // Validate required fields
      if (!schoolData.school_name.trim()) {
        return fail(400, { message: "Nama sekolah wajib diisi" });
      }

      if (!schoolData.school_npsn.trim()) {
        return fail(400, { message: "NPSN wajib diisi" });
      }

      await dbHelpers.updateSchoolSettings(schoolData);

      return {
        success: true,
        message: "Data sekolah berhasil diperbarui",
      };
    } catch (error) {
      console.error("Error updating school settings:", error);
      return fail(500, {
        message: "Gagal memperbarui data sekolah",
      });
    }
  },

  exportDatabase: async ({ locals }) => {
    const user = locals.user;

    if (!user || user.role !== "admin") {
      return fail(403, { message: "Akses ditolak" });
    }

    try {
      const dbPath = path.resolve(process.cwd(), "absen.db");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `backup-absen-${timestamp}.db`;

      // Create backup directory if not exists
      const backupDir = path.resolve(process.cwd(), "backups");
      try {
        await fs.mkdir(backupDir, { recursive: true });
      } catch (_e) {
        // Directory might already exist
      }

      const backupPath = path.join(backupDir, backupName);
      await fs.copyFile(dbPath, backupPath);

      return {
        success: true,
        message: `Database berhasil di-backup ke: ${backupName}`,
        backupFile: backupName,
      };
    } catch (error) {
      console.error("Error exporting database:", error);
      return fail(500, {
        message: "Gagal melakukan backup database",
      });
    }
  },

  importDatabase: async ({ request, locals }) => {
    const user = locals.user;

    if (!user || user.role !== "admin") {
      return fail(403, { message: "Akses ditolak" });
    }

    try {
      const formData = await request.formData();
      const file = formData.get("database_file");

      if (!file || !(file instanceof File)) {
        return fail(400, {
          message: "File database tidak ditemukan atau tidak valid",
        });
      }

      // Check file extension
      if (!file.name.endsWith(".db")) {
        return fail(400, {
          message: "File harus berformat .db (SQLite database)",
        });
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        return fail(400, {
          message: "File terlalu besar. Maksimal 100MB",
        });
      }

      // Create backup of current database before import
      const currentDbPath = path.resolve("./absen.db");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const autoBackupName = `auto-backup-before-import-${timestamp}.db`;

      const backupDir = path.resolve("./backups");
      await fs.mkdir(backupDir, { recursive: true });

      const autoBackupPath = path.join(backupDir, autoBackupName);
      await fs.copyFile(currentDbPath, autoBackupPath);

      // Save uploaded file as new database
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(currentDbPath, buffer);

      return {
        success: true,
        message: `Database berhasil di-import dari ${file.name}. Backup otomatis dibuat: ${autoBackupName}`,
      };
    } catch (error) {
      console.error("Error importing database:", error);
      return fail(500, {
        message:
          "Gagal melakukan import database. Pastikan file valid dan coba lagi.",
      });
    }
  },
};
