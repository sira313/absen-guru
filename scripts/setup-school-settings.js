import { db } from '../src/lib/server/db.js';
import { settings } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

console.log('🏫 Adding school settings...');

try {
	// School settings
	const schoolSettings = [
		{
			id: nanoid(),
			key: 'school_name',
			value: 'SDN 001 Jakarta',
			description: 'Nama sekolah'
		},
		{
			id: nanoid(),
			key: 'school_npsn',
			value: '20100001',
			description: 'NPSN (Nomor Pokok Sekolah Nasional)'
		},
		{
			id: nanoid(),
			key: 'school_address',
			value: 'Jl. Pendidikan No. 123, Jakarta Pusat, DKI Jakarta 10110',
			description: 'Alamat lengkap sekolah'
		},
		{
			id: nanoid(),
			key: 'school_phone',
			value: '021-12345678',
			description: 'Nomor telepon sekolah'
		},
		{
			id: nanoid(),
			key: 'school_email',
			value: 'info@sdn001jakarta.sch.id',
			description: 'Email sekolah'
		},
		{
			id: nanoid(),
			key: 'school_principal_name',
			value: 'Dr. Siti Nurhaliza, S.Pd., M.Pd.',
			description: 'Nama kepala sekolah'
		},
		{
			id: nanoid(),
			key: 'school_principal_nip',
			value: '196801011990032001',
			description: 'NIP kepala sekolah'
		}
	];

	for (const setting of schoolSettings) {
		// Check if setting already exists
		const existing = await db.select()
			.from(settings)
			.where(eq(settings.key, setting.key))
			.limit(1);

		if (existing.length === 0) {
			await db.insert(settings).values(setting);
			console.log(`✅ Added setting: ${setting.key} = ${setting.value}`);
		} else {
			console.log(`⚠️  Setting already exists: ${setting.key}`);
		}
	}

	console.log('🎉 School settings setup completed!');

} catch (error) {
	console.error('❌ Error adding school settings:', error);
	process.exit(1);
}

process.exit(0);