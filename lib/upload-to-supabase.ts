import { supabase } from "@/lib/supabase";

export async function uploadToSupabase(path: string, file: File) {
    const { error } = await supabase.storage
        .from('hrm-documents')
        .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from('hrm-documents').getPublicUrl(path);
    return data.publicUrl;
}
