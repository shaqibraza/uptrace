"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Bell,
    ChevronDown,
    Command,
    ExternalLink,
    LogOut,
    Menu,
    Search,
    Settings,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { CommandPalette } from "./CommandPalette";
import { MobileSidebar } from "./MobileSidebar";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useAuthStore } from "../../../stores/auth.store";
import { useToast } from "../../providers/ToastProvider";
import { ProjectSwitcher } from "./ProjectSwitcher";

export function Topbar() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const isLoggingOut = useAuthStore(
        (state) => state.isLoggingOut,
    );

    const { success, error: showError } = useToast();

    const [commandOpen, setCommandOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] =
        useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();

                setNotificationsOpen(false);
                setProfileOpen(false);
                setCommandOpen(true);
            }

            if (
                event.key === "Escape" &&
                commandOpen
            ) {
                setCommandOpen(false);
            }
        };

        window.addEventListener(
            "keydown",
            handleShortcut,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleShortcut,
            );
        };
    }, [commandOpen]);

    const openCommandPalette = () => {
        setNotificationsOpen(false);
        setProfileOpen(false);
        setCommandOpen(true);
    };

    const toggleNotifications = () => {
        setCommandOpen(false);
        setProfileOpen(false);

        setNotificationsOpen(
            (current) => !current,
        );
    };

    const toggleProfile = () => {
        setCommandOpen(false);
        setNotificationsOpen(false);

        setProfileOpen(
            (current) => !current,
        );
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            await logout();

            setProfileOpen(false);

            success(
                "Signed out",
                "You have been logged out successfully.",
            );

            router.replace("/login");
        } catch (error) {
            showError(
                "Logout failed",
                error instanceof Error
                    ? error.message
                    : "Unable to sign out. Please try again.",
            );
        }
    };

    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "";

    return (
        <>
            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
            />

            <CommandPalette
                open={commandOpen}
                onClose={() =>
                    setCommandOpen(false)
                }
            />

            <header
                className="
                    sticky top-0 z-40
                    border-b border-zinc-900
                    bg-black/90
                    backdrop-blur-xl
                "
            >
                <div
                    className="
                        flex h-16
                        items-center
                        justify-between
                        gap-3
                        px-4
                        sm:px-6
                        lg:ml-64
                        lg:px-8
                    "
                >
                    {/* Left Side */}
                    <div
                        className="
                            flex min-w-0
                            items-center gap-3
                            pl-12
                            lg:pl-0
                        "
                    >
                        {/* Mobile Menu */}
                        <button
                            type="button"
                            onClick={() =>
                                setMobileSidebarOpen(true)
                            }
                            aria-label="Open navigation"
                            className="
                                absolute left-4
                                flex h-9 w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-zinc-600
                                transition-colors
                                hover:bg-zinc-900
                                hover:text-zinc-300
                                lg:hidden
                            "
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Organization + Project */}
                        <OrganizationSwitcher />
                        <ProjectSwitcher />
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1">
                        {/* Mobile Search */}
                        <button
                            type="button"
                            onClick={openCommandPalette}
                            aria-label="Search"
                            className="
                                flex h-9 w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-zinc-700
                                transition-colors
                                hover:bg-zinc-900
                                hover:text-zinc-300
                                sm:hidden
                            "
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        {/* Desktop Search */}
                        <button
                            type="button"
                            onClick={openCommandPalette}
                            aria-label="Open search"
                            className="
                                hidden h-9 w-52
                                items-center gap-2
                                rounded-lg
                                border border-zinc-900
                                bg-zinc-950
                                px-3
                                text-left
                                transition-colors
                                hover:border-zinc-800
                                sm:flex
                                lg:w-64
                            "
                        >
                            <Search
                                className="
                                    h-3.5 w-3.5
                                    text-zinc-700
                                "
                            />

                            <span
                                className="
                                    flex-1
                                    text-[10px]
                                    text-zinc-700
                                "
                            >
                                Search anything...
                            </span>

                            <span
                                className="
                                    hidden
                                    items-center gap-0.5
                                    rounded
                                    border border-zinc-800
                                    px-1.5 py-0.5
                                    text-[8px]
                                    text-zinc-800
                                    lg:flex
                                "
                            >
                                <Command className="h-2.5 w-2.5" />
                                K
                            </span>
                        </button>

                        {/* Divider */}
                        <div
                            className="
                                mx-2
                                hidden h-5 w-px
                                bg-zinc-900
                                sm:block
                            "
                        />

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={
                                    toggleNotifications
                                }
                                aria-label="Notifications"
                                aria-expanded={
                                    notificationsOpen
                                }
                                className="
                                    relative
                                    flex h-9 w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-zinc-700
                                    transition-colors
                                    hover:bg-zinc-900
                                    hover:text-zinc-300
                                "
                            >
                                <Bell className="h-4 w-4" />

                                <span
                                    className="
                                        absolute
                                        right-2 top-2
                                        h-1.5 w-1.5
                                        rounded-full
                                        bg-amber-500
                                    "
                                />
                            </button>

                            {notificationsOpen && (
                                <div
                                    className="
                                        absolute
                                        right-0 top-12
                                        z-50
                                        w-[min(90vw,360px)]
                                        overflow-hidden
                                        rounded-xl
                                        border border-zinc-800
                                        bg-zinc-950
                                        shadow-2xl
                                        shadow-black/50
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            border-b
                                            border-zinc-900
                                            px-4 py-3
                                        "
                                    >
                                        <div>
                                            <p className="text-xs font-medium text-zinc-300">
                                                Notifications
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-zinc-800">
                                                Recent activity
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="text-[9px] text-zinc-700 hover:text-zinc-400"
                                        >
                                            Mark all read
                                        </button>
                                    </div>

                                    <NotificationItem
                                        title="Latency increased"
                                        description="api-service crossed 500ms."
                                        time="4m ago"
                                        warning
                                    />

                                    <NotificationItem
                                        title="Deployment detected"
                                        description="production-api was deployed."
                                        time="28m ago"
                                    />

                                    <NotificationItem
                                        title="No new errors"
                                        description="Everything looks healthy."
                                        time="1h ago"
                                    />

                                    <div className="border-t border-zinc-900 p-3 text-center">
                                        <button
                                            type="button"
                                            className="text-[10px] text-zinc-600 hover:text-zinc-300"
                                        >
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative ml-1">
                            <button
                                type="button"
                                onClick={toggleProfile}
                                aria-label="Open account menu"
                                aria-expanded={profileOpen}
                                className="
                                    flex
                                    items-center gap-2
                                    rounded-lg
                                    px-1.5 py-1.5
                                    transition-colors
                                    hover:bg-zinc-900
                                "
                            >
                                <div
                                    className="
                                        flex h-7 w-7
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-zinc-800
                                        text-[9px]
                                        font-semibold
                                        text-zinc-400
                                    "
                                >
                                    {initials}
                                </div>

                                <ChevronDown
                                    className="
                                        hidden h-3 w-3
                                        text-zinc-700
                                        sm:block
                                    "
                                />
                            </button>

                            {profileOpen && (
                                <div
                                    className="
                                        absolute
                                        right-0 top-12
                                        z-50
                                        w-56
                                        overflow-hidden
                                        rounded-xl
                                        border border-zinc-800
                                        bg-zinc-950
                                        shadow-2xl
                                        shadow-black/50
                                    "
                                >
                                    {/* User info */}
                                    <div
                                        className="
                                            border-b
                                            border-zinc-900
                                            px-4 py-4
                                        "
                                    >
                                        <p className="truncate text-xs font-medium text-zinc-300">
                                            {user?.name}
                                        </p>

                                        <p className="mt-1 truncate text-[10px] text-zinc-700">
                                            {user?.email}
                                        </p>
                                    </div>

                                    {/* Menu */}
                                    <div className="p-2">
                                        <ProfileItem
                                            icon={User}
                                            label="Profile"
                                            href="/profile"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false,
                                                )
                                            }
                                        />

                                        <ProfileItem
                                            icon={Settings}
                                            label="Settings"
                                            href="/dashboard/settings"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false,
                                                )
                                            }
                                        />

                                        <ProfileItem
                                            icon={ExternalLink}
                                            label="Documentation"
                                            href="#"
                                            onClick={() =>
                                                setProfileOpen(
                                                    false,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Sign out */}
                                    <div
                                        className="
                                            border-t
                                            border-zinc-900
                                            p-2
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={
                                                handleLogout
                                            }
                                            disabled={
                                                isLoggingOut
                                            }
                                            className="
                                                flex w-full
                                                items-center
                                                gap-2
                                                rounded-lg
                                                px-3 py-2.5
                                                text-left
                                                text-xs
                                                text-zinc-600
                                                transition-colors
                                                hover:bg-red-500/5
                                                hover:text-red-400
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            <LogOut className="h-3.5 w-3.5" />

                                            {isLoggingOut
                                                ? "Signing out..."
                                                : "Sign out"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

/* ==========================================================================
   Notification Item
   ========================================================================== */

function NotificationItem({
    title,
    description,
    time,
    warning = false,
}: {
    title: string;
    description: string;
    time: string;
    warning?: boolean;
}) {
    return (
        <div
            className="
                flex gap-3
                border-b border-zinc-900/70
                px-4 py-3.5
            "
        >
            <span
                className={`
                    mt-1.5
                    h-1.5 w-1.5
                    shrink-0
                    rounded-full
                    ${
                        warning
                            ? "bg-amber-500"
                            : "bg-zinc-700"
                    }
                `}
            />

            <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-400">
                    {title}
                </p>

                <p
                    className="
                        mt-1
                        text-[10px]
                        leading-4
                        text-zinc-700
                    "
                >
                    {description}
                </p>
            </div>

            <span
                className="
                    shrink-0
                    text-[9px]
                    text-zinc-800
                "
            >
                {time}
            </span>
        </div>
    );
}

/* ==========================================================================
   Profile Item
   ========================================================================== */

function ProfileItem({
    icon: Icon,
    label,
    href,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="
                flex items-center gap-2
                rounded-lg
                px-3 py-2.5
                text-xs text-zinc-600
                transition-colors
                hover:bg-zinc-900
                hover:text-zinc-300
            "
        >
            <Icon className="h-3.5 w-3.5" />

            {label}
        </Link>
    );
}