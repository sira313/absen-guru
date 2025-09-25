// src/routes/api/pouchdb/+server.js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { attendance } from '$lib/server/schema.js';
import { eq, gte } from 'drizzle-orm';

/**
 * PouchDB-style API endpoint for sync compatibility
 * Handles CRUD operations with conflict resolution
 */

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    try {
        const method = url.searchParams.get('method');
        
        switch (method) {
            case 'info':
                return json({
                    doc_count: 0,
                    update_seq: Date.now(),
                    db_name: 'absen_guru_remote'
                });
                
            case 'all_docs':
                return await handleAllDocs(url);
                
            case 'changes':
                return await handleChanges(url);
                
            default:
                return json({ error: 'method_not_found' }, { status: 404 });
        }
    } catch (error) {
        console.error('PouchDB API Error:', error);
        return json({ 
            error: 'internal_server_error',
            reason: error.message 
        }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
    try {
        const body = await request.json();
        const method = url.searchParams.get('method');
        
        switch (method) {
            case 'bulk_docs':
                return await handleBulkDocs(body);
                
            case 'sync':
                return await handleSync(body);
                
            default:
                // Single document create/update
                return await handleDocumentWrite(body);
        }
    } catch (error) {
        console.error('PouchDB POST Error:', error);
        return json({ 
            error: 'internal_server_error',
            reason: error.message 
        }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, url }) {
    try {
        const body = await request.json();
        const docId = url.pathname.split('/').pop();
        
        return await handleDocumentWrite({ ...body, _id: docId });
    } catch (error) {
        console.error('PouchDB PUT Error:', error);
        return json({ 
            error: 'internal_server_error',
            reason: error.message 
        }, { status: 500 });
    }
}

/**
 * Handle _all_docs queries
 */
async function handleAllDocs(url) {
    const include_docs = url.searchParams.get('include_docs') === 'true';
    const startkey = url.searchParams.get('startkey');
    const endkey = url.searchParams.get('endkey');
    
        // Get attendance records from SQLite
        const attendanceRecords = await db.select().from(attendance);    const rows = attendanceRecords.map(record => {
        const doc = {
            _id: `attendance_${record.id}`,
            _rev: `1-${record.updated_at || record.created_at}`,
            type: 'attendance',
            user_id: record.user_id,
            date: record.date,
            clock_in: record.clock_in,
            clock_out: record.clock_out,
            location: record.location,
            notes: record.notes,
            status: record.status,
            created_at: record.created_at,
            updated_at: record.updated_at,
            synced: true
        };
        
        const row = {
            id: doc._id,
            key: doc._id,
            value: { rev: doc._rev }
        };
        
        if (include_docs) {
            row.doc = doc;
        }
        
        return row;
    });
    
    return json({
        total_rows: rows.length,
        offset: 0,
        rows: rows.filter(row => {
            if (startkey && row.key < startkey) return false;
            if (endkey && row.key > endkey) return false;
            return true;
        })
    });
}

/**
 * Handle _changes feed
 */
async function handleChanges(url) {
    const since = url.searchParams.get('since') || '0';
    const include_docs = url.searchParams.get('include_docs') === 'true';
    
    // Get recent changes (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const attendanceRecords = await db.select()
            .from(attendance)
            .where(gte(attendance.updated_at, yesterday));    const changes = attendanceRecords.map((record, index) => {
        const doc = {
            _id: `attendance_${record.id}`,
            _rev: `1-${record.updated_at || record.created_at}`,
            type: 'attendance',
            user_id: record.user_id,
            date: record.date,
            clock_in: record.clock_in,
            clock_out: record.clock_out,
            location: record.location,
            notes: record.notes,
            status: record.status,
            created_at: record.created_at,
            updated_at: record.updated_at,
            synced: true
        };
        
        const change = {
            seq: parseInt(since) + index + 1,
            id: doc._id,
            changes: [{ rev: doc._rev }]
        };
        
        if (include_docs) {
            change.doc = doc;
        }
        
        return change;
    });
    
    return json({
        results: changes,
        last_seq: changes.length > 0 ? changes[changes.length - 1].seq : since,
        pending: 0
    });
}

/**
 * Handle bulk document operations
 */
async function handleBulkDocs(body) {
    const docs = body.docs || [];
    const results = [];
    
    for (const doc of docs) {
        try {
            if (doc._deleted) {
                // Handle deletion
                const result = await handleDocumentDelete(doc);
                results.push(result);
            } else {
                // Handle create/update
                const result = await handleDocumentWrite(doc);
                results.push(result);
            }
        } catch (error) {
            results.push({
                id: doc._id,
                error: 'internal_server_error',
                reason: error.message
            });
        }
    }
    
    return json(results);
}

/**
 * Handle single document write (create/update)
 */
async function handleDocumentWrite(doc) {
    if (!doc.type || doc.type !== 'attendance') {
        return {
            id: doc._id,
            error: 'invalid_doc_type',
            reason: 'Only attendance documents are supported'
        };
    }
    
    try {
        const attendanceId = doc._id?.replace('attendance_', '');
        const now = new Date().toISOString();
        
        const attendanceData = {
            user_id: doc.user_id,
            date: doc.date,
            clock_in: doc.clock_in,
            clock_out: doc.clock_out,
            location: doc.location,
            notes: doc.notes || '',
            status: doc.status || 'present',
            created_at: doc.created_at || now,
            updated_at: now
        };
        
        let result;
        
        if (attendanceId && !isNaN(parseInt(attendanceId))) {
            // Update existing record
            result = await db.update(attendance)
                .set(attendanceData)
                .where(eq(attendance.id, parseInt(attendanceId)))
                .returning();
        } else {
            // Create new record
            result = await db.insert(attendance)
                .values(attendanceData)
                .returning();
        }
        
        if (result.length > 0) {
            const record = result[0];
            return {
                id: `attendance_${record.id}`,
                rev: `2-${record.updated_at}`,
                ok: true
            };
        } else {
            throw new Error('Failed to save record');
        }
        
    } catch (error) {
        return {
            id: doc._id,
            error: 'conflict',
            reason: error.message
        };
    }
}

/**
 * Handle document deletion
 */
async function handleDocumentDelete(doc) {
    try {
        const attendanceId = doc._id?.replace('attendance_', '');
        
        if (attendanceId && !isNaN(parseInt(attendanceId))) {
            await db.delete(attendance)
                .where(eq(attendance.id, parseInt(attendanceId)));
        }
        
        return {
            id: doc._id,
            rev: doc._rev,
            ok: true
        };
    } catch (error) {
        return {
            id: doc._id,
            error: 'not_found',
            reason: error.message
        };
    }
}

/**
 * Handle sync requests (simplified)
 */
async function handleSync(_body) {
    // This is a simplified sync handler
    // In production, you might want more sophisticated conflict resolution
    
    return json({
        ok: true,
        session_id: Date.now().toString(),
        source_last_seq: 0,
        replication_id_version: 4
    });
}