import {
  generateTPPReport,
  generateMonthlyReport,
} from "$lib/server/excel-generator.js";
import { error } from "@sveltejs/kit";

export async function POST({ request, url }) {
  try {
    let month, year, workDays, exportType, employeeTypeFilter;

    // Handle both JSON and form data
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Handle JSON request
      const data = await request.json();
      ({ month, year, workDays, exportType, employeeTypeFilter } = data);
    } else {
      // Handle form data request
      const formData = await request.formData();
      month = parseInt(formData.get("month"));
      year = parseInt(formData.get("year"));
      workDays = parseInt(formData.get("workDays"));
      exportType = formData.get("exportType");
      employeeTypeFilter = formData.get("employeeTypeFilter") || null;
    }

    // Validate input
    if (!month || !year || !workDays) {
      throw error(400, "Missing required parameters");
    }

    if (month < 1 || month > 12) {
      throw error(400, "Invalid month");
    }

    if (year < 2020 || year > 2030) {
      throw error(400, "Invalid year");
    }

    // Generate Excel based on type
    let workbook;
    let filename;

    switch (exportType) {
      case "tpp":
        workbook = await generateTPPReport(
          month,
          year,
          workDays,
          employeeTypeFilter,
        );
        const filterSuffix = employeeTypeFilter ? `_${employeeTypeFilter}` : "";
        filename = `Laporan_TPP${filterSuffix}_${getMonthName(month)}_${year}.xlsx`;
        break;
      case "bulanan":
        workbook = await generateMonthlyReport(month, year);
        filename = `Daftar_Hadir_${getMonthName(month)}_${year}.xlsx`;
        break;
      default:
        workbook = await generateTPPReport(
          month,
          year,
          workDays,
          employeeTypeFilter,
        );
        filename = `Laporan_${getMonthName(month)}_${year}.xlsx`;
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    throw error(500, `Failed to generate report: ${err.message}`);
  }
}

function getMonthName(month) {
  const months = [
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
  return months[month];
}
