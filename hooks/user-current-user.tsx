import { UserButton } from "@stackframe/stack";
import { UserIcon } from "lucide-react";


export function ClientComponent() {
  return (
    <UserButton
      showUserInfo={true}
      extraItems={[{
        text: 'Perfil',
        icon: <UserIcon />,
        onClick: () => {
          window.location.href = '/profile';
        }
      }]}
    />
  );
}