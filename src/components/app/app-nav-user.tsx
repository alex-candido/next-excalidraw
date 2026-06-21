import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppNavUser() {
  return (
    <div className="app-nav-user flex items-center gap-2 px-2 py-1">
      <Avatar className="size-7">
        <AvatarFallback className="text-xs">U</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">User</span>
    </div>
  );
}
