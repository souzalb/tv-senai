'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase'; // Regular client for profile updates if we want to use RLS, but Admin is safer for "Admin managing other users"

export async function deleteUser(userId: string) {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUser(userId: string, data: { name?: string; desk_info?: string; role?: string }) {
    try {
        // Update Profile Data (Public table)
        const updates: any = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.desk_info !== undefined) updates.desk_info = data.desk_info;
        if (data.role !== undefined) updates.role = data.role;

        if (Object.keys(updates).length > 0) {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
    }
}
