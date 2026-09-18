import { useAuthStore } from "@/app/store/authStore";
import { useProfile } from "@/features/settings/hooks/userProfile";
import { Spinner } from "../ui/Spinner";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePicture = () => {
  const navigate = useNavigate()
  const handlenavigate = () => {
    navigate("/app/settings")
  }
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading, isError } = useProfile(user?.id);
  if (isLoading) {
    return (
      <div>
        <Spinner onClick={handlenavigate} />
      </div>
    );
  }
  if (isError || !profile?.avatar_url) {
    return <User onClick={handlenavigate} className="h-10 w-10 text-gray-400" />;
  }

  return (
    <div onClick={handlenavigate} className="rounded-full overflow-hidden h-10 w-10 cursor-pointer">
      {" "}
      <img
        src={profile.avatar_url}
        alt="Profile"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default ProfilePicture;
