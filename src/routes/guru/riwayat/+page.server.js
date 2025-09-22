import { dbHelpers } from "$lib/server/db.js";

export async function load({ locals, url }) {
  const user = locals.user;
  const currentDate = new Date();

  // Get query parameters for pagination and filtering
  const month =
    url.searchParams.get("month") || (currentDate.getMonth() + 1).toString();
  const year =
    url.searchParams.get("year") || currentDate.getFullYear().toString();

  try {
    // Calculate date range for the selected month
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month.padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;

    // Get attendance records for the selected month
    const attendanceRecords = await dbHelpers.getAttendanceByDateRange(
      user.id,
      startDate,
      endDate,
    );

    // Get statistics for the month
    const stats = await dbHelpers.getAttendanceStats(
      user.id,
      startDate,
      endDate,
    );

    return {
      user,
      attendanceRecords,
      stats,
      currentMonth: parseInt(month),
      currentYear: parseInt(year),
      monthName: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
        new Date(parseInt(year), parseInt(month) - 1),
      ),
    };
  } catch (error) {
    console.error("Error loading attendance history:", error);
    return {
      user,
      attendanceRecords: [],
      stats: {
        total: 0,
        hadir: 0,
        terlambat: 0,
        tidak_hadir: 0,
        izin: 0,
        sakit: 0,
      },
      currentMonth: parseInt(month),
      currentYear: parseInt(year),
      monthName: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
        new Date(parseInt(year), parseInt(month) - 1),
      ),
    };
  }
}
