import { bulkUpdateCeremonyStatus } from '../src/lib/server/ceremony-helper.js';

async function main() {
	try {
		console.log('🔄 Running ceremony status bulk update...');
		const updatedCount = await bulkUpdateCeremonyStatus();
		console.log(`🎉 Successfully updated ${updatedCount} records!`);
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

main();