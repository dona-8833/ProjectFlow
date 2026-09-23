import { useAuthStore } from "@/app/store/authStore";
import { useProfile, useUpdateAvatar } from "./hooks/userProfile";
import { Spinner } from "@/components/ui/Spinner";
import { useRef } from "react";
import { Upload, User } from "lucide-react";

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, isError } = useProfile(user?.id);
  const { mutate: uploadAvatar, isPending: isUploading } = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      uploadAvatar({ userId: user.id, file, oldAvatarUrl: profile.avatar_url });
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-600 border border-red-200">
        <h3 className="font-semibold">Error Loading Profile</h3>
        <p className="text-sm">
          We couldn't fetch your profile data. Please try again later.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
      <div className="flex items-center gap-6">
        <div
          onClick={handleImageClick}
          className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 group flex items-center justify-center"
        >
          {isUploading ? (
            <Spinner />
          ) : profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
            <Upload className="h-6 w-6 text-white" />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">
            Click the avatar to upload a new image.
          </p>
        </div>

        {/* The Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-lg font-medium text-gray-900">
            {profile?.name || "No name provided"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Username</label>
          <p className="text-lg font-medium text-gray-900">
            {profile?.username ? `@${profile.username}` : "No username set"}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">
            Email Address
          </label>
          <p className="text-lg font-medium text-gray-900">{profile?.email}</p>
        </div>
      </div>
    </div>
  );
}
