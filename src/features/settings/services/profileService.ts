import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export type ProfileSummary = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export const getProfileSummaries = async (
  userIds: string[],
): Promise<ProfileSummary[]> => {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", userIds);

  if (error) throw new Error(error.message);
  return (data ?? []) as ProfileSummary[];
};

export const uploadAvatar = async ({
  userId,
  file,
  oldAvatarUrl,
}: {
  userId: string;
  file: File;
  oldAvatarUrl?: string | null;
}) => {
  const oldPath = oldAvatarUrl?.split("/avatars/")[1];
  if (oldPath) {
    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([oldPath]);
    if (removeError) {
      throw new Error(removeError.message);
    }
  }
  const fileExt = file.name.split(".").pop();
  const filepath = `${userId}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filepath, file);

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = await supabase.storage.from("avatars").getPublicUrl(filepath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);
  if (updateError) throw new Error(updateError.message);
  return publicUrl;
};
