import { dbHelpers } from "./db.js";
import { format, parseISO, isAfter } from "date-fns";
import {
  determineAttendanceStatus,
  validateCheckInTime,
  getDayTypeInfo,
} from "./attendance-logic.js";

/**
 * Check in attendance for a user
 * @param {string} userId - User ID
 * @param {string} ipAddress - Client IP address
 * @param {string|null} location - Location string (optional)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function checkIn(userId, ipAddress, location = null) {
  try {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");

    // Check if user already checked in today
    const existingRecord = await dbHelpers.getAttendanceByUserAndDate(
      userId,
      today,
    );

    if (existingRecord && existingRecord.checkIn) {
      return {
        success: false,
        message: "Anda sudah melakukan check-in hari ini",
      };
    }

    // Validate time format
    const validatedTime = validateCheckInTime(currentTime);
    if (!validatedTime) {
      return {
        success: false,
        message: "Format waktu tidak valid",
      };
    }

    // Get day type information
    const dayInfo = getDayTypeInfo(now);

    // Check if it's a work day
    if (!dayInfo.isWorkDay) {
      return {
        success: false,
        message: `Hari ${dayInfo.dayName} adalah hari libur`,
      };
    }

    // Determine attendance status using new smart logic
    const { status, ceremonyStatus } = determineAttendanceStatus(
      validatedTime,
      now,
    );

    const attendanceData = {
      userId,
      date: today,
      checkIn: validatedTime,
      status,
      ceremonyStatus,
      location,
      ipAddress,
    };

    let record;
    if (existingRecord) {
      // Update existing record
      await dbHelpers.updateAttendance(existingRecord.id, {
        checkIn: validatedTime,
        status,
        ceremonyStatus,
        location,
        ipAddress,
      });
      record = { ...existingRecord, ...attendanceData };
    } else {
      // Create new record
      record = await dbHelpers.createAttendance(attendanceData);
    }

    // Generate success message based on status and ceremony participation
    let message;

    if (dayInfo.dayType === "ceremony_day") {
      if (ceremonyStatus === "ikut_upacara") {
        message = "Check-in berhasil! Anda ikut upacara hari ini.";
      } else if (
        ceremonyStatus === "tidak_ikut_upacara" &&
        status === "hadir"
      ) {
        message = "Check-in berhasil! Anda hadir tapi tidak ikut upacara.";
      } else if (status === "terlambat") {
        message = "Check-in berhasil! Anda terlambat dan tidak ikut upacara.";
      } else {
        message = "Check-in berhasil!";
      }
    } else {
      if (status === "hadir") {
        message = "Check-in berhasil! Anda hadir tepat waktu.";
      } else if (status === "terlambat") {
        message = "Check-in berhasil! Anda terlambat hari ini.";
      } else {
        message = "Check-in berhasil!";
      }
    }

    return {
      success: true,
      message,
      data: record,
    };
  } catch (error) {
    console.error("Error during check-in:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat melakukan check-in",
    };
  }
}

/**
 * Check out attendance for a user
 * @param {string} userId - User ID
 * @param {string} ipAddress - Client IP address
 * @param {string|null} location - Location string (optional)
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function checkOut(userId, ipAddress, location = null) {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const currentTime = format(new Date(), "HH:mm:ss");

    // Check if user has checked in today
    const existingRecord = await dbHelpers.getAttendanceByUserAndDate(
      userId,
      today,
    );

    if (!existingRecord || !existingRecord.checkIn) {
      return {
        success: false,
        message: "Anda belum melakukan check-in hari ini",
      };
    }

    if (existingRecord.checkOut) {
      return {
        success: false,
        message: "Anda sudah melakukan check-out hari ini",
      };
    }

    // Update record with check-out time
    await dbHelpers.updateAttendance(existingRecord.id, {
      checkOut: currentTime,
      location: location || existingRecord.location,
      ipAddress,
    });

    const updatedRecord = {
      ...existingRecord,
      checkOut: currentTime,
      location: location || existingRecord.location,
      ipAddress,
    };

    return {
      success: true,
      message: "Check-out berhasil",
      data: updatedRecord,
    };
  } catch (error) {
    console.error("Error during check-out:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat melakukan check-out",
    };
  }
}

/**
 * Get attendance status for today
 * @param {string} userId - User ID
 * @returns {Promise<{checkIn: string|null, checkOut: string|null, status: string}>}
 */
export async function getTodayAttendance(userId) {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const record = await dbHelpers.getAttendanceByUserAndDate(userId, today);

    return {
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      status: record?.status || "tidak_hadir",
      notes: record?.notes || null,
      location: record?.location || null,
    };
  } catch (error) {
    console.error("Error getting today attendance:", error);
    return {
      checkIn: null,
      checkOut: null,
      status: "tidak_hadir",
      notes: null,
      location: null,
    };
  }
}

/**
 * Get attendance history for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Array>}
 */
export async function getAttendanceHistory(userId, days = 30) {
  try {
    const endDate = format(new Date(), "yyyy-MM-dd");
    const startDate = format(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    );

    return await dbHelpers.getAttendanceByDateRange(userId, startDate, endDate);
  } catch (error) {
    console.error("Error getting attendance history:", error);
    return [];
  }
}

/**
 * Calculate attendance statistics
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<Object>}
 */
export async function getAttendanceStats(userId, days = 30) {
  try {
    const endDate = format(new Date(), "yyyy-MM-dd");
    const startDate = format(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd",
    );

    return await dbHelpers.getAttendanceStats(userId, startDate, endDate);
  } catch (error) {
    console.error("Error getting attendance stats:", error);
    return {
      total: 0,
      hadir: 0,
      terlambat: 0,
      tidak_hadir: 0,
      izin: 0,
      sakit: 0,
    };
  }
}

/**
 * Manual attendance entry (admin only)
 * @param {string} adminUserId - Admin user ID
 * @param {Object} attendanceData - Attendance data
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function manualAttendanceEntry(adminUserId, attendanceData) {
  try {
    // Verify admin user
    const adminUser = await dbHelpers.getUserById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Check if record already exists
    const existingRecord = await dbHelpers.getAttendanceByUserAndDate(
      attendanceData.userId,
      attendanceData.date,
    );

    if (existingRecord) {
      // Update existing record
      await dbHelpers.updateAttendance(existingRecord.id, {
        checkIn: attendanceData.checkIn,
        checkOut: attendanceData.checkOut,
        status: attendanceData.status,
        notes: attendanceData.notes || null,
      });

      return {
        success: true,
        message: "Data absensi berhasil diperbarui",
        data: { ...existingRecord, ...attendanceData },
      };
    } else {
      // Create new record
      const record = await dbHelpers.createAttendance({
        userId: attendanceData.userId,
        date: attendanceData.date,
        checkIn: attendanceData.checkIn || null,
        checkOut: attendanceData.checkOut || null,
        status: attendanceData.status,
        notes: attendanceData.notes || null,
        location: "Manual Entry",
        ipAddress: null,
      });

      return {
        success: true,
        message: "Data absensi berhasil ditambahkan",
        data: record,
      };
    }
  } catch (error) {
    console.error("Error in manual attendance entry:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan data absensi",
    };
  }
}

/**
 * Validate attendance time constraints
 * @param {string} checkInTime - Check in time (HH:MM:SS)
 * @param {string|null} checkOutTime - Check out time (HH:MM:SS)
 * @returns {boolean}
 */
export function validateAttendanceTime(checkInTime, checkOutTime = null) {
  try {
    if (!checkInTime) return false;

    const checkIn = parseISO(`2000-01-01T${checkInTime}`);

    if (checkOutTime) {
      const checkOut = parseISO(`2000-01-01T${checkOutTime}`);
      // Check-out must be after check-in
      return isAfter(checkOut, checkIn);
    }

    return true;
  } catch (error) {
    console.error("Error validating attendance time:", error);
    return false;
  }
}

/**
 * Get working hours from settings or default
 * @returns {Promise<{startTime: string, endTime: string, lateThreshold: string}>}
 */
export async function getWorkingHours() {
  try {
    const startTimeSetting = await dbHelpers.getSetting("work_start_time");
    const endTimeSetting = await dbHelpers.getSetting("work_end_time");
    const lateThresholdSetting = await dbHelpers.getSetting("late_threshold");

    return {
      startTime: startTimeSetting?.value || "08:00:00",
      endTime: endTimeSetting?.value || "16:00:00",
      lateThreshold: lateThresholdSetting?.value || "08:00:00",
    };
  } catch (error) {
    console.error("Error getting working hours:", error);
    return {
      startTime: "08:00:00",
      endTime: "16:00:00",
      lateThreshold: "08:00:00",
    };
  }
}
