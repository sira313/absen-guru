import { fail, redirect } from "@sveltejs/kit";
import { dbHelpers } from "$lib/server/db.js";

// Helper function to check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Helper function to get weekend day name
function getWeekendDayName(date) {
  const day = date.getDay();
  if (day === 0) return "Minggu";
  if (day === 6) return "Sabtu";
  return "";
}

// Helper function to determine attendance status
function determineAttendanceStatus(checkInTime, expectedTime = "08:00") {
  const [checkHour, checkMin] = checkInTime.split(":").map(Number);
  const [expectedHour, expectedMin] = expectedTime.split(":").map(Number);

  const checkMinutes = checkHour * 60 + checkMin;
  const expectedMinutes = expectedHour * 60 + expectedMin;

  if (checkMinutes <= expectedMinutes) {
    return "hadir";
  } else if (checkMinutes <= expectedMinutes + 30) {
    // 30 minutes tolerance
    return "terlambat";
  } else {
    return "tidak_hadir";
  }
}

// Helper function to create attendance record
async function createTodayAttendance(userId, checkInTime, status, notes) {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if attendance already exists for today
    const existingAttendance = await dbHelpers.getAttendanceByUserAndDate(
      userId,
      today,
    );

    if (existingAttendance) {
      return {
        success: false,
        error: "Anda sudah absen hari ini",
      };
    }

    // Create new attendance record
    const attendanceData = {
      userId,
      date: today,
      checkIn: checkInTime,
      checkOut: null,
      status,
      notes,
      location: "Sekolah",
      ipAddress: "127.0.0.1",
    };

    await dbHelpers.createAttendance(attendanceData);

    return {
      success: true,
      data: attendanceData,
    };
  } catch (error) {
    console.error("Error creating attendance:", error);
    return {
      success: false,
      error: "Gagal menyimpan absensi",
    };
  }
}

export async function load({ locals }) {
  const user = locals.user;
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Check if today is weekend
  const isWeekendToday = isWeekend(today);
  const weekendDayName = isWeekendToday ? getWeekendDayName(today) : "";

  try {
    // Ambil absensi hari ini menggunakan fungsi yang ada
    const todayAttendance = await dbHelpers.getAttendanceByUserAndDate(
      user.id,
      todayString,
    );

    // Ambil statistik bulan ini (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const monthlyAttendance = await dbHelpers.getAttendanceByDateRange(
      user.id,
      thirtyDaysAgo.toISOString().split("T")[0],
      todayString,
    );

    // Hitung statistik dengan kategori baru - dinas_luar dihitung sebagai hadir
    const stats = {
      totalDays: monthlyAttendance.length,
      presentDays: monthlyAttendance.filter(
        (a) => a.status === "hadir" || a.status === "dinas_luar",
      ).length,
      lateDays: monthlyAttendance.filter((a) => a.status === "terlambat")
        .length,
      absentDays: monthlyAttendance.filter((a) => a.status === "tidak_hadir")
        .length,
      sickDays: monthlyAttendance.filter((a) => a.status === "sakit").length,
      leaveDays: monthlyAttendance.filter((a) => a.status === "izin").length,
      // Detail breakdown untuk referensi admin jika diperlukan
      officialDutyDays: monthlyAttendance.filter(
        (a) => a.status === "dinas_luar",
      ).length,
    };

    return {
      user,
      todayAttendance,
      stats,
      monthlyAttendance,
      today: today.toISOString().split("T")[0],
      isWeekend: isWeekendToday,
      weekendDayName,
    };
  } catch (error) {
    console.error("Error loading guru data:", error);
    return {
      user,
      todayAttendance: null,
      stats: {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        sickDays: 0,
        leaveDays: 0,
        officialDutyDays: 0,
      },
      monthlyAttendance: [],
      today: today.toISOString().split("T")[0],
      isWeekend: isWeekendToday,
      weekendDayName,
    };
  }
}

export const actions = {
  absen: async ({ request, locals }) => {
    const formData = await request.formData();
    const notes = formData.get("notes")?.toString() || "";
    const selectedStatus = formData.get("status")?.toString() || "hadir";

    const now = new Date();

    // Check if today is weekend
    if (isWeekend(now)) {
      const dayName = getWeekendDayName(now);
      return fail(400, {
        message: `Tidak bisa melakukan absensi pada hari ${dayName}. Sistem absensi hanya tersedia pada hari kerja (Senin-Jumat).`,
      });
    }

    const checkInTime = now.toTimeString().slice(0, 5); // Format HH:MM

    let finalStatus;

    // Logic penentuan status akhir
    if (selectedStatus === "hadir") {
      // Jika pilih hadir, tentukan berdasarkan waktu
      finalStatus = determineAttendanceStatus(checkInTime, "08:00");
    } else {
      // Jika pilih status lain (sakit, izin, dinas_luar), gunakan pilihan user
      finalStatus = selectedStatus;
    }

    const result = await createTodayAttendance(
      locals.user.id,
      checkInTime,
      finalStatus,
      notes,
    );

    if (!result.success) {
      return fail(400, {
        message: result.error,
      });
    }

    throw redirect(303, "/guru");
  },
};
