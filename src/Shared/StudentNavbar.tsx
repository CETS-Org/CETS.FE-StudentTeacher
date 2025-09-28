import GenericNavbar from "./GenericNavbar";
import { studentNavbarConfig } from "./navbarConfigs";

interface NavbarProps {
    collapsed?: boolean;
    mobileOpen?: boolean;
    fullWidth?: boolean;
}

export default function Navbar({ collapsed = false, mobileOpen = false, fullWidth = false }: NavbarProps = {}) {
    return (
        <GenericNavbar 
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            fullWidth={fullWidth}
            config={studentNavbarConfig}
        />
    );
}