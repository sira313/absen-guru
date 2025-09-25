// src/lib/stores/pouchdb.js
import PouchDB from 'pouchdb';
import IdbAdapter from 'pouchdb-adapter-idb';
import HttpAdapter from 'pouchdb-adapter-http';
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Register adapters
PouchDB.plugin(IdbAdapter);
PouchDB.plugin(HttpAdapter);

// Database instances
let localDB = null;
let remoteDB = null;
let syncHandler = null;

// Stores
export const isOnline = writable(true);
export const syncStatus = writable('idle'); // idle, syncing, error
export const pendingChanges = writable(0);

// Initialize databases only in browser
if (browser) {
    // Local IndexedDB database
    localDB = new PouchDB('absen_guru_local', { adapter: 'idb' });
    
    // Remote database (akan diset ketika online)
    const initRemoteSync = () => {
        try {
            // Gunakan local server sebagai remote untuk sync
            remoteDB = new PouchDB('/api/pouchdb', { 
                adapter: 'http',
                skip_setup: true 
            });
            
            startSync();
        } catch (error) {
            console.log('Remote sync not available:', error);
        }
    };

    // Start bidirectional sync
    const startSync = () => {
        if (!localDB || !remoteDB) return;

        syncStatus.set('syncing');
        
        syncHandler = PouchDB.sync(localDB, remoteDB, {
            live: true,
            retry: true,
            back_off_function: (delay) => {
                // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
                return Math.min(delay * 2, 30000);
            }
        })
        .on('change', (info) => {
            console.log('Sync change:', info);
            syncStatus.set('syncing');
        })
        .on('paused', () => {
            console.log('Sync paused (up to date)');
            syncStatus.set('idle');
        })
        .on('active', () => {
            console.log('Sync resumed');
            syncStatus.set('syncing');
        })
        .on('error', (err) => {
            console.error('Sync error:', err);
            syncStatus.set('error');
        });
    };

    // Network status monitoring
    const updateOnlineStatus = () => {
        const online = navigator.onLine;
        isOnline.set(online);
        
        if (online && !syncHandler) {
            initRemoteSync();
        } else if (!online && syncHandler) {
            syncHandler.cancel();
            syncHandler = null;
            syncStatus.set('offline');
        }
    };

    // Listen for network changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial setup
    updateOnlineStatus();
    
    // Monitor pending changes
    if (localDB) {
        localDB.changes({
            since: 'now',
            live: true
        }).on('change', async () => {
            try {
                const info = await localDB.info();
                pendingChanges.set(info.doc_count);
            } catch (err) {
                console.error('Error getting pending changes:', err);
            }
        });
    }
}

/**
 * Attendance Database Operations
 */
export const attendanceDB = {
    // Create attendance record
    async create(attendance) {
        if (!localDB) throw new Error('Database not initialized');
        
        const doc = {
            _id: `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'attendance',
            user_id: attendance.user_id,
            date: attendance.date,
            clock_in: attendance.clock_in,
            clock_out: attendance.clock_out || null,
            location: attendance.location || null,
            notes: attendance.notes || '',
            status: attendance.status || 'present',
            created_at: new Date().toISOString(),
            synced: false
        };

        try {
            const result = await localDB.put(doc);
            return { ...doc, _rev: result.rev };
        } catch (error) {
            console.error('Error creating attendance:', error);
            throw error;
        }
    },

    // Get attendance by date range
    async getByDateRange(startDate, endDate, userId = null) {
        if (!localDB) return [];

        try {
            const result = await localDB.allDocs({
                include_docs: true,
                startkey: 'attendance_',
                endkey: 'attendance_\ufff0'
            });

            return result.rows
                .map(row => row.doc)
                .filter(doc => {
                    const docDate = new Date(doc.date);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    
                    const inRange = docDate >= start && docDate <= end;
                    const userMatch = userId ? doc.user_id === userId : true;
                    
                    return inRange && userMatch;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error getting attendance:', error);
            return [];
        }
    },

    // Update attendance (clock out)
    async update(id, updates) {
        if (!localDB) throw new Error('Database not initialized');

        try {
            const doc = await localDB.get(id);
            const updatedDoc = {
                ...doc,
                ...updates,
                updated_at: new Date().toISOString(),
                synced: false
            };

            const result = await localDB.put(updatedDoc);
            return { ...updatedDoc, _rev: result.rev };
        } catch (error) {
            console.error('Error updating attendance:', error);
            throw error;
        }
    },

    // Get today's attendance for user
    async getTodayAttendance(userId) {
        const today = new Date().toISOString().split('T')[0];
        const records = await this.getByDateRange(today, today, userId);
        return records[0] || null;
    },

    // Delete attendance record
    async delete(id) {
        if (!localDB) throw new Error('Database not initialized');

        try {
            const doc = await localDB.get(id);
            return await localDB.remove(doc);
        } catch (error) {
            console.error('Error deleting attendance:', error);
            throw error;
        }
    },

    // Get all unsynced records
    async getUnsynced() {
        if (!localDB) return [];

        try {
            const result = await localDB.find({
                selector: {
                    type: 'attendance',
                    synced: false
                }
            });

            return result.docs;
        } catch (error) {
            console.error('Error getting unsynced records:', error);
            return [];
        }
    }
};

/**
 * Sync utilities
 */
export const syncUtils = {
    // Force sync now
    async forcSync() {
        if (syncHandler) {
            return new Promise((resolve, reject) => {
                syncHandler.on('paused', resolve);
                syncHandler.on('error', reject);
            });
        }
    },

    // Get sync statistics
    async getSyncStats() {
        if (!localDB) return { local: 0, unsynced: 0 };

        try {
            const info = await localDB.info();
            const unsynced = await attendanceDB.getUnsynced();
            
            return {
                local: info.doc_count,
                unsynced: unsynced.length,
                updateSeq: info.update_seq
            };
        } catch (error) {
            console.error('Error getting sync stats:', error);
            return { local: 0, unsynced: 0 };
        }
    },

    // Clear local database (for reset)
    async clearLocal() {
        if (!localDB) return;

        try {
            await localDB.destroy();
            // Recreate database
            localDB = new PouchDB('absen_guru_local', { adapter: 'idb' });
            pendingChanges.set(0);
        } catch (error) {
            console.error('Error clearing local database:', error);
            throw error;
        }
    }
};

// Derived stores for UI
export const canSync = derived(isOnline, ($isOnline) => $isOnline);
export const hasUnsyncedData = derived(pendingChanges, ($pending) => $pending > 0);
export const syncStatusText = derived(syncStatus, ($status) => {
    switch ($status) {
        case 'syncing': return 'Sinkronisasi...';
        case 'error': return 'Error sinkronisasi';
        case 'offline': return 'Offline';
        default: return 'Tersinkronisasi';
    }
});