// src/lib/stores/toast.js
import { writable } from 'svelte/store';

// Store untuk menyimpan toast notifications
export const toasts = writable([]);

let toastId = 0;

/**
 * Menampilkan toast notification
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe toast: 'success', 'error', 'warning', 'info', 'online', 'offline'
 * @param {number} duration - Durasi tampil dalam ms (0 = tidak auto hide)
 * @param {Object} options - Opsi tambahan
 */
export function showToast(message, type = 'info', duration = 4000, options = {}) {
	const id = ++toastId;
	const toast = {
		id,
		message,
		type,
		duration,
		timestamp: Date.now(),
		...options
	};

	// Tambah toast baru
	toasts.update(list => [...list, toast]);

	// Auto remove jika ada duration
	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	return id;
}

/**
 * Menghapus toast berdasarkan ID
 * @param {number} id - ID toast yang akan dihapus
 */
export function removeToast(id) {
	toasts.update(list => list.filter(toast => toast.id !== id));
}

/**
 * Menghapus semua toast
 */
export function clearToasts() {
	toasts.set([]);
}

// Helper functions untuk tipe-tipe umum
export function showSuccess(message, duration = 3000) {
	return showToast(message, 'success', duration);
}

export function showError(message, duration = 5000) {
	return showToast(message, 'error', duration);
}

export function showWarning(message, duration = 4000) {
	return showToast(message, 'warning', duration);
}

export function showInfo(message, duration = 4000) {
	return showToast(message, 'info', duration);
}

export function showOnline(message = '🌐 Kembali online!', duration = 3000) {
	return showToast(message, 'online', duration);
}

export function showOffline(message = '📱 Mode offline - Data akan disinkronkan saat online', duration = 4000) {
	return showToast(message, 'offline', duration);
}