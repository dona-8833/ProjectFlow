import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const supabase = createClient();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };
  return (
    <Tooltip>
      <TooltipTrigger className="bg-white"onClick={handleLogout}>
          <LogOut className="text-red-500 w-4 h-4" />

      </TooltipTrigger>
      <TooltipContent className="bg-white text-black"><p>Logout</p></TooltipContent>
    </Tooltip>
  );
};

export default Logout;
