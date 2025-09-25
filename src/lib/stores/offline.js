// src/lib/stores/offline.js - Simplified offline storage
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Status stores
export const isOnline = writable(navigator?.onLine ?? true);
export const offlineData = writable([]);
export const syncStatus = writable('idle');

// Simple IndexedDB wrapper (fallback ke localStorage jika perlu)
class SimpleOfflineDB {
    constructor() {
        this.dbName = 'absen_guru_offline';
        this.db = null;
        this.init();
    }

    async init() {
        if (!browser) return;
        
        try {
            // Coba IndexedDB dulu
            if ('indexedDB' in window) {
                await this.initIndexedDB();
            } else {
                // Fallback ke localStorage
                console.warn('IndexedDB not available, using localStorage');
            }
        } catch (error) {
            console.error('DB init error:', error);
        }
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('attendance')) {
                    const store = db.createObjectStore('attendance', { keyPath: 'id' });
                    store.createIndex('date', 'date');
                    store.createIndex('userId', 'userId');
                }
            };
        });
    }

    async save(data) {
        if (!browser) return;
        
        try {
            if (this.db) {
                // IndexedDB
                const transaction = this.db.transaction(['attendance'], 'readwrite');
                const store = transaction.objectStore('attendance');
                await store.add(data);
            } else {
                // localStorage fallback
                const stored = JSON.parse(localStorage.getItem(this.dbName) || '[]');
                stored.push(data);
                localStorage.setItem(this.dbName, JSON.stringify(stored));
            }
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    async getAll() {
        if (!browser) return [];
        
        try {
            if (this.db) {
                // IndexedDB
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(['attendance'], 'readonly');
                    const store = transaction.objectStore('attendance');
                    const request = store.getAll();
                    
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } else {
                // localStorage fallback
                return JSON.parse(localStorage.getItem(this.dbName) || '[]');
            }
        } catch (error) {
            console.error('Get all error:', error);
            return [];
        }
    }

    async delete(id) {
        if (!browser) return;
        
        try {
            if (this.db) {
                // IndexedDB
                const transaction = this.db.transaction(['attendance'], 'readwrite');
                const store = transaction.objectStore('attendance');
                await store.delete(id);
            } else {
                // localStorage fallback
                const stored = JSON.parse(localStorage.getItem(this.dbName) || '[]');
                const filtered = stored.filter(item => item.id !== id);
                localStorage.setItem(this.dbName, JSON.stringify(filtered));
            }
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    async clear() {
        if (!browser) return;
        
        try {
            if (this.db) {
                // IndexedDB
                const transaction = this.db.transaction(['attendance'], 'readwrite');
                const store = transaction.objectStore('attendance');
                await store.clear();
            } else {
                // localStorage fallback
                localStorage.removeItem(this.dbName);
            }
        } catch (error) {
            console.error('Clear error:', error);
            throw error;
        }
    }
}

// Initialize DB
export const offlineDB = new SimpleOfflineDB();

// Network status monitoring
if (browser) {
    // Update online status
    window.addEventListener('online', () => isOnline.set(true));
    window.addEventListener('offline', () => isOnline.set(false));
    
    // Load offline data on init
    offlineDB.getAll().then(data => {
        offlineData.set(data);
    });
}

// Attendance functions
export async function saveOfflineAttendance(attendanceData) {
    try {
        const data = {
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...attendanceData,
            timestamp: new Date().toISOString(),
            synced: false
        };
        
        await offlineDB.save(data);
        
        // Update store
        const current = await offlineDB.getAll();
        offlineData.set(current);
        
        return data;
    } catch (error) {
        console.error('Save offline attendance error:', error);
        throw error;
    }
}

export async function syncOfflineData() {
    if (!browser || !navigator.onLine) return;
    
    syncStatus.set('syncing');
    
    try {
        const data = await offlineDB.getAll();
        const unsyncedData = data.filter(item => !item.synced);
        
        for (const item of unsyncedData) {
            try {
                // Send to server
                const response = await fetch('/api/attendance/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
                
                if (response.ok) {
                    // Mark as synced dan hapus dari offline storage
                    await offlineDB.delete(item.id);
                }
            } catch (error) {
                console.error('Sync item error:', error);
            }
        }
        
        // Update store
        const remaining = await offlineDB.getAll();
        offlineData.set(remaining);
        
        syncStatus.set('idle');
    } catch (error) {
        console.error('Sync error:', error);
        syncStatus.set('error');
    }
}

// Auto-sync ketika online
if (browser) {
    isOnline.subscribe(online => {
        if (online) {
            // Delay sedikit untuk memastikan koneksi stabil
            setTimeout(() => syncOfflineData(), 1000);
        }
    });
}