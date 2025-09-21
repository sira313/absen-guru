import { generateTPPReport } from '$lib/server/excel-generator.js';
import { error } from '@sveltejs/kit';

export async function POST({ request, url }) {
	try {
		const { month, year, workDays, exportType, employeeTypeFilter } = await request.json();
		
		// Validate input
		if (!month || !year || !workDays) {
			throw error(400, 'Missing required parameters');
		}
		
		if (month < 1 || month > 12) {
			throw error(400, 'Invalid month');
		}
		
		if (year < 2020 || year > 2030) {
			throw error(400, 'Invalid year');
		}
		
		// Generate Excel based on type
		let workbook;
		let filename;
		
		switch (exportType) {
			case 'tpp':
				workbook = await generateTPPReport(month, year, workDays, employeeTypeFilter);
				const filterSuffix = employeeTypeFilter ? `_${employeeTypeFilter}` : '';
				filename = `Laporan_TPP${filterSuffix}_${getMonthName(month)}_${year}.xlsx`;
				break;
			case 'bulanan':
				// TODO: Implement bulanan report
				workbook = await generateTPPReport(month, year, workDays, employeeTypeFilter);
				filename = `Laporan_Bulanan_${getMonthName(month)}_${year}.xlsx`;
				break;
			default:
				workbook = await generateTPPReport(month, year, workDays, employeeTypeFilter);
				filename = `Laporan_${getMonthName(month)}_${year}.xlsx`;
		}
		
		// Generate buffer
		const buffer = await workbook.xlsx.writeBuffer();
		
		// Return file
		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Content-Length': buffer.byteLength.toString()
			}
		});
		
	} catch (err) {
		console.error('Export error:', err);
		throw error(500, `Failed to generate report: ${err.message}`);
	}
}

function getMonthName(month) {
	const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
	return months[month];
}