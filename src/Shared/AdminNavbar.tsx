import GenericNavbar from "./GenericNavbar";
import { adminNavbarConfig } from "./navbarConfigs";

interface NavbarProps {
    collapsed?: boolean;
    mobileOpen?: boolean;
    fullWidth?: boolean;
}

// Example of how to create a new navbar for Admin users
export default function AdminNavbar({ collapsed = false, mobileOpen = false, fullWidth = false }: NavbarProps = {}) {
    return (
        <GenericNavbar 
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            fullWidth={fullWidth}
            config={adminNavbarConfig}
        />
    );
}
