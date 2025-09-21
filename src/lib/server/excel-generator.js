import ExcelJS from 'exceljs';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql, inArray } from 'drizzle-orm';
import { settings } from './schema.js';

const client = createClient({ url: 'file:./absen.db' });
const db = drizzle(client);

async function getSchoolSettings() {
	const schoolKeys = ['school_name', 'school_npsn', 'school_address', 'school_phone', 'school_email', 'school_principal_name', 'school_principal_nip'];
	const result = await db.select().from(settings).where(
		inArray(settings.key, schoolKeys)
	);
	
	// Convert to object for easier access
	const schoolData = {};
	result.forEach(item => {
		schoolData[item.key] = item.value;
	});
	
	return schoolData;
}

export async function generateTPPReport(month, year, workDays, employeeTypeFilter = null) {
	try {
		// Get school settings
		const schoolData = await getSchoolSettings();
		
		// Get attendance data for the month with optional employee type filter
		const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
		const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
		
		// Build the WHERE clause for employee type filter
		let whereClause = `u.role = 'guru'`;
		if (employeeTypeFilter) {
			if (employeeTypeFilter === 'PNS') {
				whereClause += ` AND (u.employee_type = 'PNS' OR u.employee_type = 'CPNS')`;
			} else if (employeeTypeFilter === 'PPPK') {
				whereClause += ` AND u.employee_type = 'PPPK'`;
			}
		}
		
		// Execute query using raw SQL  
		const result = await client.execute({
			sql: `
				SELECT 
					u.id as user_id,
					u.name as name,
					u.nip,
					u.employee_type as position,
					COUNT(CASE WHEN a.status = 'hadir' OR a.status = 'dinas_luar' THEN 1 END) as hadir_count,
					COUNT(CASE WHEN a.status = 'sakit' THEN 1 END) as sakit_count,
					COUNT(CASE WHEN a.status = 'izin' THEN 1 END) as izin_count,
					COUNT(CASE WHEN a.status = 'terlambat' THEN 1 END) as terlambat_count,
					COUNT(CASE WHEN a.status = 'dinas_luar' THEN 1 END) as dinas_luar_count,
					COUNT(CASE WHEN a.status = 'tidak_hadir' THEN 1 END) as tidak_hadir_count,
					COUNT(CASE WHEN a.ceremony_status = 'hadir' THEN 1 END) as upacara_hadir,
					COUNT(CASE WHEN a.ceremony_status = 'tidak_hadir' THEN 1 END) as upacara_tidak_hadir
				FROM users u
				LEFT JOIN attendance a ON u.id = a.user_id 
					AND a.date >= ? 
					AND a.date <= ?
				WHERE ${whereClause}
				GROUP BY u.id, u.name, u.nip, u.employee_type
				ORDER BY u.name
			`,
			args: [startDate, endDate]
		});
		
		const attendanceData = result.rows;
		
		// Create workbook
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Laporan TPP');
		
		// Set up page layout
		worksheet.pageSetup = {
			paperSize: 9, // A4
			orientation: 'landscape',
			fitToWidth: 1,
			fitToHeight: 0,
			margins: {
				left: 0.5, right: 0.5,
				top: 0.75, bottom: 0.75,
				header: 0.3, footer: 0.3
			}
		};
		
		// Title (Row 1) - Dynamic based on employee type filter
		worksheet.mergeCells('A1:P1');
		const titleCell = worksheet.getCell('A1');
		
		// Generate dynamic title based on employee type filter
		let titleText;
		if (employeeTypeFilter === 'PPPK') {
			titleText = `REKAPITULASI KEHADIRAN PPPK TAHUN ANGGARAN ${year}`;
		} else if (employeeTypeFilter === 'PNS') {
			titleText = `REKAPITULASI KEHADIRAN PNS DAN CPNS TAHUN ANGGARAN ${year}`;
		} else {
			// Default title when no filter or 'Semua Pegawai'
			titleText = `REKAPITULASI KEHADIRAN PEGAWAI TAHUN ANGGARAN ${year}`;
		}
		
		titleCell.value = titleText;
		titleCell.font = { name: 'Arial', size: 14, bold: true };
		titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
		worksheet.getRow(1).height = 20;
		
		// Empty row
		worksheet.getRow(2).height = 5;
		
		// Unit Kerja (Row 3) - menggunakan data sekolah
		const unitKerjaCell = worksheet.getCell('A3');
		unitKerjaCell.value = `UNIT KERJA\t: ${schoolData.school_name || 'Nama Sekolah'}`;
		unitKerjaCell.font = { name: 'Arial', size: 11, bold: true };
		
		// Bulan (Row 4)
		const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
			'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
		const bulanCell = worksheet.getCell('A4');
		bulanCell.value = `BULAN\t\t: ${monthNames[month]} ${year}`;
		bulanCell.font = { name: 'Arial', size: 11, bold: true };
		
		// Empty row
		worksheet.getRow(5).height = 10;
		
		// Headers setup (Row 6-7)
		const headers = [
			{ text: 'NO', rowspan: 2, colstart: 'A', colend: 'A' },
			{ text: 'NAMA', rowspan: 2, colstart: 'B', colend: 'B' },
			{ text: 'NIP', rowspan: 2, colstart: 'C', colend: 'C' },
			{ text: 'JABATAN', rowspan: 2, colstart: 'D', colend: 'D' },
			{ text: 'JUMLAH\nHARI\nKERJA', rowspan: 2, colstart: 'E', colend: 'E' },
			{ text: 'HADIR', rowspan: 2, colstart: 'F', colend: 'F' },
			{ text: 'ABSENSI', rowspan: 1, colstart: 'G', colend: 'J' },
			{ text: 'KETERANGAN\nLAIN', rowspan: 1, colstart: 'K', colend: 'M' },
			{ text: 'UPACARA', rowspan: 2, colstart: 'N', colend: 'N' },
			{ text: 'JUMLAH\nPROSENTASE\nKETIDAK-\nHADIRAN', rowspan: 2, colstart: 'O', colend: 'O' },
			{ text: 'KETERANGAN', rowspan: 2, colstart: 'P', colend: 'P' }
		];
		
		// Main headers (Row 6)
		worksheet.mergeCells('A6:A7'); worksheet.getCell('A6').value = 'NO';
		worksheet.mergeCells('B6:B7'); worksheet.getCell('B6').value = 'NAMA';
		worksheet.mergeCells('C6:C7'); worksheet.getCell('C6').value = 'NIP';
		worksheet.mergeCells('D6:D7'); worksheet.getCell('D6').value = 'JABATAN';
		worksheet.mergeCells('E6:E7'); worksheet.getCell('E6').value = 'JUMLAH\nHARI\nKERJA';
		worksheet.mergeCells('F6:F7'); worksheet.getCell('F6').value = 'HADIR';
		worksheet.mergeCells('G6:J6'); worksheet.getCell('G6').value = 'ABSENSI';
		worksheet.mergeCells('K6:M6'); worksheet.getCell('K6').value = 'KETERANGAN LAIN';
		worksheet.mergeCells('N6:N7'); worksheet.getCell('N6').value = 'UPACARA\nHARI\nBESAR';
		worksheet.mergeCells('O6:O7'); worksheet.getCell('O6').value = 'JUMLAH\nPROSENTASE\nKETIDAK-\nHADIRAN';
		worksheet.mergeCells('P6:P7'); worksheet.getCell('P6').value = 'KETERANGAN';
		
		// Sub headers (Row 7)
		worksheet.getCell('G7').value = 'S';
		worksheet.getCell('H7').value = 'I';
		worksheet.getCell('I7').value = 'TK';
		worksheet.getCell('J7').value = 'DL';
		worksheet.getCell('K7').value = 'CUTI';
		worksheet.getCell('L7').value = 'SENIN';
		worksheet.getCell('M7').value = 'HARI\nBESAR';
		
		// Style headers
		for (let row = 6; row <= 7; row++) {
			for (let col = 1; col <= 16; col++) {
				const cell = worksheet.getCell(row, col);
				cell.font = { name: 'Arial', size: 10, bold: true };
				cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
				cell.border = {
					top: { style: 'thin' }, bottom: { style: 'thin' },
					left: { style: 'thin' }, right: { style: 'thin' }
				};
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
			}
		}
		
		// Set header row heights
		worksheet.getRow(6).height = 30;
		worksheet.getRow(7).height = 30;
		
		// Data rows
		let rowIndex = 8;
		attendanceData.forEach((user, index) => {
			const row = worksheet.getRow(rowIndex);
			
			row.values = [
				index + 1, // NO
				user.name, // NAMA
				user.nip || '', // NIP
				user.position || 'Guru Kelas', // JABATAN
				workDays, // JUMLAH HARI KERJA
				user.hadir_count || 0, // HADIR
				user.sakit_count || 0, // S
				user.izin_count || 0, // I
				user.terlambat_count || 0, // TK
				user.dinas_luar_count || 0, // DL
				'', // CUTI
				user.upacara_hadir || 0, // SENIN (upacara)
				user.upacara_hadir || 0, // HARI BESAR
				user.upacara_hadir || 0, // UPACARA
				{ formula: `IF(E${rowIndex}>0,ROUND((G${rowIndex}+H${rowIndex}+I${rowIndex})/E${rowIndex}*100,1)&"%","0%")` }, // KETIDAKHADIRAN %
				'' // KETERANGAN
			];
			
			// Style data rows
			for (let col = 1; col <= 16; col++) {
				const cell = row.getCell(col);
				cell.font = { name: 'Arial', size: 10 };
				cell.alignment = { horizontal: 'center', vertical: 'middle' };
				cell.border = {
					top: { style: 'thin' }, bottom: { style: 'thin' },
					left: { style: 'thin' }, right: { style: 'thin' }
				};
				
				// Left align for name column
				if (col === 2) {
					cell.alignment = { horizontal: 'left', vertical: 'middle' };
				}
			}
			
			row.height = 25;
			rowIndex++;
		});
		
		// Add signature area
		const signatureRow = rowIndex + 2;
		worksheet.getCell(`K${signatureRow}`).value = `${schoolData.school_address ? schoolData.school_address.split(',')[0] || 'Tempat' : 'Tempat'},    ${monthNames[month]} ${year}`;
		worksheet.getCell(`K${signatureRow + 1}`).value = 'Kepala Satuan Pendidikan,';
		worksheet.getCell(`K${signatureRow + 5}`).value = schoolData.school_principal_name || 'Nama Kepala Sekolah';
		worksheet.getCell(`K${signatureRow + 6}`).value = `NIP ${schoolData.school_principal_nip || 'NIP Kepala Sekolah'}`;
		
		// Style signature
		for (let i = 0; i <= 6; i++) {
			const cell = worksheet.getCell(`K${signatureRow + i}`);
			cell.font = { name: 'Arial', size: 11, bold: i === 0 || i === 5 };
			cell.alignment = { horizontal: 'center' };
		}
		
		// Set column widths
		const columnWidths = [5, 25, 18, 15, 8, 8, 5, 5, 5, 5, 8, 8, 8, 10, 12, 15];
		columnWidths.forEach((width, index) => {
			worksheet.getColumn(index + 1).width = width;
		});
		
		return workbook;
		
	} catch (error) {
		console.error('Error generating TPP report:', error);
		throw error;
	}
}