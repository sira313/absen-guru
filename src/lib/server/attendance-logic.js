/**
 * Smart Attendance Logic Helper
 * Handles time-based attendance rules for Monday ceremony and regular days
 */

/**
 * Determine attendance status based on check-in time and day of week
 * @param {string} checkInTime - Time in HH:MM format
 * @param {Date} date - The attendance date
 * @returns {Object} - { status, ceremonyStatus }
 */
export function determineAttendanceStatus(checkInTime, date) {
	if (!checkInTime || !date) {
		return { status: 'tidak_hadir', ceremonyStatus: null };
	}

	// Parse check-in time
	const [hours, minutes] = checkInTime.split(':').map(Number);
	const checkInMinutes = hours * 60 + minutes;
	
	// Time constants (in minutes from midnight)
	const TIME_07_00 = 7 * 60; // 420 minutes
	const TIME_07_30 = 7 * 60 + 30; // 450 minutes  
	const TIME_07_31 = 7 * 60 + 31; // 451 minutes
	const TIME_08_00 = 8 * 60; // 480 minutes
	const TIME_08_01 = 8 * 60 + 1; // 481 minutes
	const TIME_10_00 = 10 * 60; // 600 minutes

	// Get day of week (0 = Sunday, 1 = Monday, ...)
	const dayOfWeek = date.getDay();
	const isMonday = dayOfWeek === 1;
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

	// Weekend logic
	if (isWeekend) {
		return { status: 'tidak_hadir', ceremonyStatus: null };
	}

	// Monday (Ceremony Day) Logic
	if (isMonday) {
		if (checkInMinutes >= TIME_07_00 && checkInMinutes <= TIME_07_30) {
			// 07:00 - 07:30: Ikut upacara
			return { status: 'hadir', ceremonyStatus: 'ikut_upacara' };
		} else if (checkInMinutes >= TIME_07_31 && checkInMinutes <= TIME_08_00) {
			// 07:31 - 08:00: Tidak ikut upacara tapi hadir
			return { status: 'hadir', ceremonyStatus: 'tidak_ikut_upacara' };
		} else if (checkInMinutes >= TIME_08_01 && checkInMinutes <= TIME_10_00) {
			// 08:01 - 10:00: Terlambat
			return { status: 'terlambat', ceremonyStatus: 'tidak_ikut_upacara' };
		} else {
			// Before 07:00 or after 10:00: Tidak masuk
			return { status: 'tidak_hadir', ceremonyStatus: null };
		}
	}

	// Regular Weekdays (Tuesday - Friday) Logic
	else {
		if (checkInMinutes >= TIME_07_00 && checkInMinutes <= TIME_07_30) {
			// 07:00 - 07:30: Hadir
			return { status: 'hadir', ceremonyStatus: null };
		} else if (checkInMinutes >= TIME_07_31 && checkInMinutes <= TIME_10_00) {
			// 07:31 - 10:00: Terlambat
			return { status: 'terlambat', ceremonyStatus: null };
		} else {
			// Before 07:00 or after 10:00: Tidak masuk
			return { status: 'tidak_hadir', ceremonyStatus: null };
		}
	}
}

/**
 * Validate and format check-in time
 * @param {string} timeString - Time string to validate
 * @returns {string|null} - Formatted time or null if invalid
 */
export function validateCheckInTime(timeString) {
	if (!timeString) return null;

	// Try to parse different time formats
	const timeRegex = /^(\d{1,2}):(\d{2})$/;
	const match = timeString.match(timeRegex);
	
	if (!match) return null;

	const hours = parseInt(match[1]);
	const minutes = parseInt(match[2]);

	// Validate time ranges
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		return null;
	}

	// Format to HH:MM
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get attendance summary for a specific day type
 * @param {Date} date - The date to analyze
 * @returns {Object} - Day type information and rules
 */
export function getDayTypeInfo(date) {
	const dayOfWeek = date.getDay();
	const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
	
	let dayType, rules;
	
	if (dayOfWeek === 0 || dayOfWeek === 6) {
		dayType = 'weekend';
		rules = 'Hari libur - tidak ada absensi';
	} else if (dayOfWeek === 1) {
		dayType = 'ceremony_day';
		rules = '07:00-07:30: Upacara | 07:31-08:00: Hadir | 08:01-10:00: Terlambat';
	} else {
		dayType = 'regular_day';
		rules = '07:00-07:30: Hadir | 07:31-10:00: Terlambat';
	}

	return {
		dayName: dayNames[dayOfWeek],
		dayType,
		rules,
		isWorkDay: dayOfWeek >= 1 && dayOfWeek <= 5
	};
}

/**
 * Calculate attendance statistics with ceremony participation
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} - Statistics including ceremony participation
 */
export function calculateAttendanceStats(attendanceRecords) {
	const stats = {
		totalDays: 0,
		hadir: 0,
		terlambat: 0,
		sakit: 0,
		izin: 0,
		dinas_luar: 0,
		tidak_hadir: 0,
		ceremony: {
			totalMondays: 0,
			ikut_upacara: 0,
			tidak_ikut_upacara: 0,
			absence_on_monday: 0
		}
	};

	attendanceRecords.forEach(record => {
		stats.totalDays++;
		
		// Count by status
		if (stats.hasOwnProperty(record.status)) {
			stats[record.status]++;
		}

		// Count ceremony participation (only for Mondays)
		const recordDate = new Date(record.date);
		if (recordDate.getDay() === 1) { // Monday
			stats.ceremony.totalMondays++;
			
			if (record.ceremony_status === 'ikut_upacara') {
				stats.ceremony.ikut_upacara++;
			} else if (record.ceremony_status === 'tidak_ikut_upacara') {
				stats.ceremony.tidak_ikut_upacara++;
			} else {
				stats.ceremony.absence_on_monday++;
			}
		}
	});

	// Calculate percentages
	stats.attendanceRate = stats.totalDays > 0 ? 
		((stats.hadir + stats.dinas_luar) / stats.totalDays * 100).toFixed(1) : 0;
	
	stats.ceremony.participationRate = stats.ceremony.totalMondays > 0 ?
		(stats.ceremony.ikut_upacara / stats.ceremony.totalMondays * 100).toFixed(1) : 0;

	return stats;
}

/**
 * Get time-based attendance description
 * @param {string} status - Attendance status
 * @param {string} ceremonyStatus - Ceremony status
 * @param {Date} date - Attendance date
 * @returns {string} - Human readable description
 */
export function getAttendanceDescription(status, ceremonyStatus, date) {
	const dayOfWeek = date.getDay();
	const isMonday = dayOfWeek === 1;

	if (isMonday && ceremonyStatus) {
		switch (ceremonyStatus) {
			case 'ikut_upacara':
				return 'Hadir dan ikut upacara (07:00-07:30)';
			case 'tidak_ikut_upacara':
				if (status === 'hadir') {
					return 'Hadir tapi tidak ikut upacara (07:31-08:00)';
				} else if (status === 'terlambat') {
					return 'Terlambat dan tidak ikut upacara (08:01-10:00)';
				}
				break;
		}
	}

	// Regular status descriptions
	switch (status) {
		case 'hadir': return 'Hadir tepat waktu (07:00-07:30)';
		case 'terlambat': return 'Terlambat (07:31-10:00)';
		case 'sakit': return 'Sakit dengan surat keterangan';
		case 'izin': return 'Izin dengan surat keterangan';
		case 'dinas_luar': return 'Dinas luar kantor';
		case 'tidak_hadir': return 'Tidak hadir tanpa keterangan';
		default: return status;
	}
}