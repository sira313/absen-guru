import ExcelJS from "exceljs";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql, inArray } from "drizzle-orm";
import { settings } from "./schema.js";

const client = createClient({ url: "file:./absen.db" });
const db = drizzle(client);

async function getSchoolSettings() {
  const schoolKeys = [
    "school_name",
    "school_npsn",
    "school_address",
    "school_phone",
    "school_email",
    "school_principal_name",
    "school_principal_nip",
  ];
  const result = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, schoolKeys));

  // Convert to object for easier access
  const schoolData = {};
  result.forEach((item) => {
    schoolData[item.key] = item.value;
  });

  return schoolData;
}

export async function generateTPPReport(
  month,
  year,
  workDays,
  employeeTypeFilter = null,
) {
  try {
    // Get school settings
    const schoolData = await getSchoolSettings();

    // Get attendance data for the month with optional employee type filter
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

    // Build the WHERE clause for employee type filter
    let whereClause = `u.role = 'guru'`;
    if (employeeTypeFilter) {
      if (employeeTypeFilter === "PNS") {
        whereClause += ` AND (u.employee_type = 'PNS' OR u.employee_type = 'CPNS')`;
      } else if (employeeTypeFilter === "PPPK") {
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
          u.employee_type,
          u.position,
          COUNT(CASE WHEN a.status = 'hadir' OR a.status = 'dinas_luar' THEN 1 END) as hadir_count,
          COUNT(CASE WHEN a.status = 'sakit' THEN 1 END) as sakit_count,
          COUNT(CASE WHEN a.status = 'izin' THEN 1 END) as izin_count,
          COUNT(CASE WHEN a.status = 'terlambat' THEN 1 END) as terlambat_count,
          COUNT(CASE WHEN a.status = 'dinas_luar' THEN 1 END) as dinas_luar_count,
          COUNT(CASE WHEN a.status = 'tidak_hadir' THEN 1 END) as tidak_hadir_count
        FROM users u
        LEFT JOIN attendance a ON u.id = a.user_id 
          AND a.date >= ? 
          AND a.date <= ?
        WHERE ${whereClause}
        GROUP BY u.id, u.name, u.nip, u.employee_type, u.position
        ORDER BY u.name
      `,
      args: [startDate, endDate],
    });

    const attendanceData = result.rows;

    // Get school principal data from users with Kepala Sekolah in position
    const principalResult = await client.execute({
      sql: `SELECT name, nip FROM users WHERE position LIKE '%Kepala Sekolah%' AND role = 'guru' LIMIT 1`,
      args: [],
    });

    const principalData = principalResult.rows[0] || null;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan TPP");

    // Set up page layout
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    // Title (Row 1) - Dynamic based on employee type filter
    worksheet.mergeCells("A1:P1");
    const titleCell = worksheet.getCell("A1");

    // Generate dynamic title based on employee type filter
    let titleText;
    if (employeeTypeFilter === "PPPK") {
      titleText = `REKAPITULASI KEHADIRAN PPPK TAHUN ANGGARAN ${year}`;
    } else if (employeeTypeFilter === "PNS") {
      titleText = `REKAPITULASI KEHADIRAN PNS DAN CPNS TAHUN ANGGARAN ${year}`;
    } else {
      // Default title when no filter or 'Semua Pegawai'
      titleText = `REKAPITULASI KEHADIRAN PEGAWAI TAHUN ANGGARAN ${year}`;
    }

    titleCell.value = titleText;
    titleCell.font = { name: "Arial", size: 14, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 20;

    // Empty row
    worksheet.getRow(2).height = 5;

    // Unit Kerja (Row 3) - menggunakan data sekolah dengan format yang rapi
    worksheet.getCell("A3").value = "UNIT KERJA";
    worksheet.getCell("A3").font = { name: "Arial", size: 11, bold: true };
    worksheet.getCell("C3").value =
      `: ${schoolData.school_name || "Nama Sekolah"}`;
    worksheet.getCell("C3").font = { name: "Arial", size: 11, bold: true };

    // Bulan (Row 4) - dengan format yang rapi
    const monthNames = [
      "",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    worksheet.getCell("A4").value = "BULAN";
    worksheet.getCell("A4").font = { name: "Arial", size: 11, bold: true };
    worksheet.getCell("C4").value = `: ${monthNames[month]} ${year}`;
    worksheet.getCell("C4").font = { name: "Arial", size: 11, bold: true };

    // Empty row
    worksheet.getRow(5).height = 10;

    // Headers setup (Row 6-7)
    const headers = [
      { text: "NO", rowspan: 2, colstart: "A", colend: "A" },
      { text: "NAMA", rowspan: 2, colstart: "B", colend: "B" },
      { text: "NIP", rowspan: 2, colstart: "C", colend: "C" },
      { text: "JABATAN", rowspan: 2, colstart: "D", colend: "D" },
      { text: "JUMLAH\nHARI\nKERJA", rowspan: 2, colstart: "E", colend: "E" },
      { text: "HADIR", rowspan: 2, colstart: "F", colend: "F" },
      { text: "ABSENSI", rowspan: 1, colstart: "G", colend: "J" },
      { text: "KETERANGAN\nLAIN", rowspan: 1, colstart: "K", colend: "M" },
      { text: "UPACARA", rowspan: 2, colstart: "N", colend: "N" },
      {
        text: "JUMLAH\nPROSENTASE\nKETIDAK-\nHADIRAN",
        rowspan: 2,
        colstart: "O",
        colend: "O",
      },
      { text: "KETERANGAN", rowspan: 2, colstart: "P", colend: "P" },
    ];

    // Main headers (Row 6)
    worksheet.mergeCells("A6:A7");
    worksheet.getCell("A6").value = "NO";
    worksheet.mergeCells("B6:B7");
    worksheet.getCell("B6").value = "NAMA";
    worksheet.mergeCells("C6:C7");
    worksheet.getCell("C6").value = "NIP";
    worksheet.mergeCells("D6:D7");
    worksheet.getCell("D6").value = "JABATAN";
    worksheet.mergeCells("E6:E7");
    worksheet.getCell("E6").value = "JUMLAH\nHARI\nKERJA";
    worksheet.mergeCells("F6:F7");
    worksheet.getCell("F6").value = "HADIR";
    worksheet.mergeCells("G6:J6");
    worksheet.getCell("G6").value = "ABSENSI";
    worksheet.mergeCells("K6:M6");
    worksheet.getCell("K6").value = "KETERANGAN LAIN";
    worksheet.mergeCells("N6:N7");
    worksheet.getCell("N6").value = "UPACARA\nHARI\nBESAR";
    worksheet.mergeCells("O6:O7");
    worksheet.getCell("O6").value = "JUMLAH\nPROSENTASE\nKETIDAK-\nHADIRAN";
    worksheet.mergeCells("P6:P7");
    worksheet.getCell("P6").value = "KETERANGAN";

    // Sub headers (Row 7)
    worksheet.getCell("G7").value = "S";
    worksheet.getCell("H7").value = "I";
    worksheet.getCell("I7").value = "TK";
    worksheet.getCell("J7").value = "DL";
    worksheet.getCell("K7").value = "CUTI";
    worksheet.getCell("L7").value = "SENIN";
    worksheet.getCell("M7").value = "HARI\nBESAR";

    // Style headers
    for (let row = 6; row <= 7; row++) {
      for (let col = 1; col <= 16; col++) {
        const cell = worksheet.getCell(row, col);
        cell.font = { name: "Arial", size: 10, bold: true };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6E6FA" },
        };
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
        user.nip || "", // NIP
        user.position || "Guru Kelas", // JABATAN
        workDays, // JUMLAH HARI KERJA
        user.hadir_count || 0, // HADIR
        user.sakit_count || 0, // S
        user.izin_count || 0, // I
        user.terlambat_count || 0, // TK
        user.dinas_luar_count || 0, // DL
        "", // CUTI
        user.upacara_hadir || 0, // SENIN (upacara hari senin)
        0, // HARI BESAR (untuk upacara hari besar lainnya)
        0, // UPACARA (untuk upacara lainnya)
        {
          formula: `IF(E${rowIndex}>0,ROUND((G${rowIndex}+H${rowIndex}+I${rowIndex})/E${rowIndex}*100,1)&"%","0%")`,
        }, // KETIDAKHADIRAN %
        "", // KETERANGAN
      ];

      // Style data rows
      for (let col = 1; col <= 16; col++) {
        const cell = row.getCell(col);
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        // Left align for name column
        if (col === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
      }

      row.height = 25;
      rowIndex++;
    });

    // Add signature area
    const signatureRow = rowIndex + 2;
    worksheet.getCell(`K${signatureRow}`).value =
      `${schoolData.school_address ? schoolData.school_address.split(",")[0] || "Tempat" : "Tempat"},    ${monthNames[month]} ${year}`;
    worksheet.getCell(`K${signatureRow + 1}`).value =
      "Kepala Satuan Pendidikan,";

    // Use principal data from database if available, otherwise fallback to school settings
    const principalName =
      principalData?.name ||
      schoolData.school_principal_name ||
      "Nama Kepala Sekolah";
    const principalNip =
      principalData?.nip ||
      schoolData.school_principal_nip ||
      "NIP Kepala Sekolah";

    worksheet.getCell(`K${signatureRow + 5}`).value = principalName;
    worksheet.getCell(`K${signatureRow + 6}`).value = `NIP ${principalNip}`;

    // Style signature
    for (let i = 0; i <= 6; i++) {
      const cell = worksheet.getCell(`K${signatureRow + i}`);
      cell.font = { name: "Arial", size: 11, bold: i === 0 || i === 5 };
      cell.alignment = { horizontal: "center" };
    }

    // Set column widths
    const columnWidths = [5, 25, 18, 15, 8, 8, 5, 5, 5, 5, 8, 8, 8, 10, 12, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    return workbook;
  } catch (error) {
    console.error("Error generating TPP report:", error);
    throw error;
  }
}

export async function generateMonthlyReport(month, year) {
  try {
    // Get school settings
    const schoolData = await getSchoolSettings();

    // Get school principal data from users with Kepala Sekolah in position
    const principalResult = await client.execute({
      sql: `SELECT name, nip FROM users WHERE position LIKE '%Kepala Sekolah%' AND role = 'guru' LIMIT 1`,
      args: [],
    });

    const principalData = principalResult.rows[0] || null;

    // Get all users (guru) and their attendance for the month
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

    // Get all guru users with their attendance data
    const result = await client.execute({
      sql: `
				SELECT DISTINCT
					u.id as user_id,
					u.name as name,
					u.nip
				FROM users u 
				WHERE u.role = 'guru' AND u.is_active = 1
				ORDER BY u.name
			`,
      args: [],
    });

    const users = result.rows.map((row) => ({
      user_id: row.user_id,
      name: row.name,
      nip: row.nip,
    }));

    // Get attendance data for all users in the month
    const attendanceResult = await client.execute({
      sql: `
				SELECT 
					user_id,
					date,
					status
				FROM attendance 
				WHERE date BETWEEN ? AND ?
			`,
      args: [startDate, endDate],
    });

    // Create attendance lookup map
    const attendanceMap = {};
    attendanceResult.rows.forEach((row) => {
      const key = `${row.user_id}_${row.date}`;
      attendanceMap[key] = row.status;
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Bulanan");

    // Page setup
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9, // A4
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = [
      "",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Calculate total columns and get Excel column letter
    const totalColumns = 9 + daysInMonth; // NO, NAMA, PNS, PPPK, HONOR + days + JUMLAH + SAKIT + IZIN + KETERANGAN

    // Helper function to convert number to Excel column letter
    function numberToColumnLetter(num) {
      let result = "";
      while (num > 0) {
        num--;
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
      }
      return result;
    }

    const lastColumn = numberToColumnLetter(totalColumns);
    worksheet.mergeCells(`A1:${lastColumn}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `REKAPITULASI DAFTAR HADIR ${schoolData.school_name?.toUpperCase() || "NAMA SEKOLAH"} BULAN ${monthNames[month]?.toUpperCase()} TAHUN ${year}`;
    titleCell.font = { name: "Arial", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 25;

    // Empty row
    worksheet.getRow(2).height = 10;

    // School info
    worksheet.mergeCells(`A3:${lastColumn}3`);
    const schoolCell = worksheet.getCell("A3");
    schoolCell.value = schoolData.school_name || "Nama Sekolah";
    schoolCell.font = { name: "Arial", size: 12, bold: true };
    schoolCell.alignment = { horizontal: "center", vertical: "middle" };

    // Month info
    worksheet.mergeCells(`A4:${lastColumn}4`);
    const monthCell = worksheet.getCell("A4");
    monthCell.value = `TANGGAL`;
    monthCell.font = { name: "Arial", size: 12, bold: true };
    monthCell.alignment = { horizontal: "center", vertical: "middle" };

    // Headers (Row 5-6)
    const headerRow1 = worksheet.getRow(5);
    const headerRow2 = worksheet.getRow(6);

    // Left side headers
    worksheet.mergeCells("A5:A6");
    headerRow1.getCell(1).value = "NO";

    worksheet.mergeCells("B5:B6");
    headerRow1.getCell(2).value = "NAMA/NIP";

    worksheet.mergeCells("C5:C6");
    headerRow1.getCell(3).value = "PNS";

    worksheet.mergeCells("D5:D6");
    headerRow1.getCell(4).value = "PPPK";

    worksheet.mergeCells("E5:E6");
    headerRow1.getCell(5).value = "HONOR";

    // Days headers
    for (let day = 1; day <= daysInMonth; day++) {
      const colIndex = 5 + day; // Start from column F (6th column)
      worksheet.mergeCells(
        worksheet.getCell(5, colIndex).address +
          ":" +
          worksheet.getCell(6, colIndex).address,
      );
      headerRow1.getCell(colIndex).value = day;
    }

    // Right side header
    const ketCol = 6 + daysInMonth;
    worksheet.mergeCells(
      worksheet.getCell(5, ketCol).address +
        ":" +
        worksheet.getCell(6, ketCol).address,
    );
    headerRow1.getCell(ketCol).value = "JUMLAH";

    const sakitCol = ketCol + 1;
    worksheet.mergeCells(
      worksheet.getCell(5, sakitCol).address +
        ":" +
        worksheet.getCell(6, sakitCol).address,
    );
    headerRow1.getCell(sakitCol).value = "SAKIT";

    const izinCol = sakitCol + 1;
    worksheet.mergeCells(
      worksheet.getCell(5, izinCol).address +
        ":" +
        worksheet.getCell(6, izinCol).address,
    );
    headerRow1.getCell(izinCol).value = "IZIN";

    const ketTotalCol = izinCol + 1;
    worksheet.mergeCells(
      worksheet.getCell(5, ketTotalCol).address +
        ":" +
        worksheet.getCell(6, ketTotalCol).address,
    );
    headerRow1.getCell(ketTotalCol).value = "KETERANGAN";

    // Style headers
    [headerRow1, headerRow2].forEach((row) => {
      for (let col = 1; col <= ketTotalCol; col++) {
        const cell = row.getCell(col);
        cell.font = { name: "Arial", size: 9, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDDDDD" },
        };
      }
      row.height = 20;
    });

    // Data rows
    let rowIndex = 7;
    users.forEach((user, index) => {
      const row = worksheet.getRow(rowIndex);

      // Basic info
      row.getCell(1).value = index + 1; // NO
      row.getCell(2).value = user.name; // NAMA
      row.getCell(3).value = "V"; // PNS check
      row.getCell(4).value = ""; // PPPK
      row.getCell(5).value = ""; // HONOR

      let hadirCount = 0,
        sakitCount = 0,
        izinCount = 0;

      // Daily attendance
      for (let day = 1; day <= daysInMonth; day++) {
        const colIndex = 5 + day;
        const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        const key = `${user.user_id}_${dateStr}`;
        const status = attendanceMap[key];

        let code = "";
        let fontColor = "000000"; // Black default

        if (status) {
          switch (status) {
            case "hadir":
              code = "H";
              fontColor = "008000"; // Green
              hadirCount++;
              break;
            case "izin":
              code = "I";
              fontColor = "0000FF"; // Blue
              izinCount++;
              break;
            case "sakit":
              code = "S";
              fontColor = "FF0000"; // Red
              sakitCount++;
              break;
            case "terlambat":
              code = "TK";
              fontColor = "FFA500"; // Orange
              break;
            case "dinas_luar":
              code = "DL";
              fontColor = "800080"; // Purple
              hadirCount++; // Dinas luar dihitung hadir
              break;
            case "tidak_hadir":
            default:
              code = "TK";
              fontColor = "FF0000"; // Red
              break;
          }
        }

        const cell = row.getCell(colIndex);
        cell.value = code;
        cell.font = {
          name: "Arial",
          size: 8,
          color: { argb: "FF" + fontColor },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }

      // Summary columns
      row.getCell(ketCol).value = hadirCount; // JUMLAH hadir
      row.getCell(sakitCol).value = sakitCount; // SAKIT
      row.getCell(izinCol).value = izinCount; // IZIN
      row.getCell(ketTotalCol).value = ""; // KETERANGAN

      // Style data row
      for (let col = 1; col <= ketTotalCol; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        // Left align for name, center for others
        if (col === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
          cell.font = { name: "Arial", size: 9 };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9 };
        }
      }

      row.height = 20;
      rowIndex++;
    });

    // Add signature area
    const signatureRow = rowIndex + 2;
    const signatureCol = Math.max(ketTotalCol - 5, 1); // Ensure minimum column 1
    worksheet.getCell(signatureRow, signatureCol).value =
      `PERJI, ${monthNames[month]} ${year}`;
    worksheet.getCell(signatureRow + 2, signatureCol).value = "KEPALA SEKOLAH";
    worksheet.getCell(signatureRow + 3, signatureCol).value =
      schoolData.school_name || "NAMA SEKOLAH";

    // Use principal data from database if available, otherwise fallback to school settings
    const principalName =
      principalData?.name ||
      schoolData.school_principal_name ||
      "Nama Kepala Sekolah";
    const principalNip =
      principalData?.nip ||
      schoolData.school_principal_nip ||
      "NIP Kepala Sekolah";

    worksheet.getCell(signatureRow + 6, signatureCol).value = principalName;
    worksheet.getCell(signatureRow + 7, signatureCol).value =
      `NIP. ${principalNip}`;

    // Set column widths
    worksheet.getColumn(1).width = 5; // NO
    worksheet.getColumn(2).width = 25; // NAMA
    worksheet.getColumn(3).width = 5; // PNS
    worksheet.getColumn(4).width = 5; // PPPK
    worksheet.getColumn(5).width = 5; // HONOR

    // Days columns
    for (let day = 1; day <= daysInMonth; day++) {
      worksheet.getColumn(5 + day).width = 3;
    }

    worksheet.getColumn(ketCol).width = 8; // JUMLAH
    worksheet.getColumn(sakitCol).width = 6; // SAKIT
    worksheet.getColumn(izinCol).width = 6; // IZIN
    worksheet.getColumn(ketTotalCol).width = 15; // KETERANGAN

    return workbook;
  } catch (error) {
    console.error("Error generating monthly report:", error);
    throw error;
  }
}
