<script>
	import { Info, User, Globe, Github, Calendar, Clock, Users, Shield, Heart } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Tentang Aplikasi - Absen Guru</title>
	<meta name="description" content="Informasi tentang aplikasi Absen Guru - Sistem manajemen kehadiran untuk institusi pendidikan" />
</svelte:head>

<div class="max-w-4xl mx-auto">
	<!-- Header -->
	<div class="text-center mb-8">
		<div class="flex justify-center mb-4">
			<div class="bg-primary/10 p-6 rounded-full">
				<Info class="w-12 h-12 text-primary" />
			</div>
		</div>
		<h1 class="text-3xl font-bold text-base-content mb-2">Tentang Aplikasi</h1>
		<p class="text-base-content/60 text-lg">Sistem Manajemen Kehadiran Guru</p>
	</div>

	<!-- App Info Card -->
	<div class="card bg-base-100 shadow-lg mb-8">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">
				<Clock class="w-6 h-6 text-primary" />
				Absen Guru
			</h2>
			<p class="text-base-content/80 mb-6 leading-relaxed">
				Absen Guru adalah sistem manajemen kehadiran yang dirancang khusus untuk institusi pendidikan. 
				Aplikasi ini membantu sekolah dalam mengelola, memantau, dan menganalisis kehadiran guru secara 
				digital dengan antarmuka yang mudah digunakan dan fitur-fitur yang komprehensif.
			</p>
			
			<!-- Features Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
					<Users class="w-5 h-5 text-primary flex-shrink-0" />
					<div>
						<h3 class="font-semibold">Manajemen Pengguna</h3>
						<p class="text-sm text-base-content/60">Kelola data guru dan administrator</p>
					</div>
				</div>
				
				<div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
					<Calendar class="w-5 h-5 text-primary flex-shrink-0" />
					<div>
						<h3 class="font-semibold">Pencatatan Kehadiran</h3>
						<p class="text-sm text-base-content/60">Sistem absensi digital real-time</p>
					</div>
				</div>
				
				<div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
					<Shield class="w-5 h-5 text-primary flex-shrink-0" />
					<div>
						<h3 class="font-semibold">Keamanan Data</h3>
						<p class="text-sm text-base-content/60">Sistem keamanan berlapis</p>
					</div>
				</div>
				
				<div class="flex items-center gap-3 p-4 bg-base-200 rounded-lg">
					<Info class="w-5 h-5 text-primary flex-shrink-0" />
					<div>
						<h3 class="font-semibold">Laporan Komprehensif</h3>
						<p class="text-sm text-base-content/60">Analisis dan pelaporan kehadiran</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Developer Info Card -->
	<div class="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg mb-8">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-6">
				<User class="w-6 h-6 text-primary" />
				Informasi Pengembang
			</h2>
			
			<!-- Developer Profile -->
			<div class="flex flex-col lg:flex-row items-start gap-6">
				<!-- Avatar -->
				<div class="flex-shrink-0">
					<div class="avatar">
						<div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
							<div class="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-full h-full flex items-center justify-center">
								<span class="text-2xl font-bold">AP</span>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Info -->
				<div class="flex-1">
					<h3 class="text-2xl font-bold text-base-content mb-2">Aris Pratama, S.Pd.</h3>
					<p class="text-base-content/60 mb-4 leading-relaxed">
						Pengembang aplikasi dengan latar belakang pendidikan yang berusaha menjadi lebih baik dari dirinya yang sebelumnya.
					</p>
					
					<!-- Contact Links -->
					<div class="flex flex-col sm:flex-row gap-3">
						<a 
							href="https://apoxi.cam" 
							target="_blank" 
							rel="noopener noreferrer"
							class="btn btn-outline btn-primary gap-2"
						>
							<Globe class="w-4 h-4" />
							Website Portfolio
						</a>
						
						<a 
							href="https://github.com/sira313/absen-guru" 
							target="_blank" 
							rel="noopener noreferrer"
							class="btn btn-outline btn-secondary gap-2"
						>
							<Github class="w-4 h-4" />
							Source Code
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Technical Info Card -->
	<div class="card bg-base-100 shadow-lg mb-8">
		<div class="card-body">
			<h2 class="card-title text-xl mb-4">Informasi Teknis</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<h3 class="font-semibold text-base-content">Frontend</h3>
					<ul class="text-sm text-base-content/70 space-y-1">
						<li>• SvelteKit 5</li>
						<li>• TailwindCSS 4</li>
						<li>• DaisyUI 5</li>
						<li>• Lucide Icons</li>
					</ul>
				</div>
				
				<div class="space-y-2">
					<h3 class="font-semibold text-base-content">Backend</h3>
					<ul class="text-sm text-base-content/70 space-y-1">
						<li>• SQLite Database</li>
						<li>• Drizzle ORM</li>
						<li>• Server-side Rendering</li>
						<li>• Progressive Web App</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="text-center">
		<div class="flex items-center justify-center gap-2 text-base-content/60">
			<Heart class="w-4 h-4 text-red-500" />
			<span class="text-sm">Dibuat dengan penuh dedikasi untuk kemajuan pendidikan Indonesia</span>
		</div>
	</div>
</div>