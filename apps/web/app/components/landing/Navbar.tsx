"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Menu,
    X,
    ChevronDown,
    ArrowRight,
} from "lucide-react";

import { useAuthStore } from "../../../stores/auth.store";

const navigation = [
    {
        label: "Features",
        href: "#features",
    },
    {
        label: "How it works",
        href: "#how-it-works",
    },
    {
        label: "Documentation",
        href: "#docs",
    },
];

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const status = useAuthStore((state) => state.status);
    const logout = useAuthStore((state) => state.logout);
    const isLoggingOut = useAuthStore(
        (state) => state.isLoggingOut,
    );

    const [isProfileOpen, setIsProfileOpen] =
        useState(false);

    const profileRef = useRef<HTMLDivElement>(null);

    const isAuthenticated =
        status === "authenticated";

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const initials =
        user?.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    return (
        <header
            className="
                sticky top-0 z-50
                border-b border-zinc-800/80
                bg-black
                backdrop-blur-xl
            "
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="flex shrink-0 items-center gap-2.5"
                    >
                        <div
                            className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-lg
                                border border-zinc-700
                                bg-zinc-100
                                text-sm font-bold
                                text-zinc-950
                            "
                        >
                            U
                        </div>

                        <span
                            className="
                                text-lg font-semibold
                                tracking-tight
                                text-zinc-100
                            "
                        >
                            Uptrace
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-7 md:flex lg:gap-8">
                        {navigation.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="
                                    text-sm font-medium
                                    text-zinc-500
                                    transition-colors
                                    hover:text-zinc-100
                                "
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-2 md:flex">
                        {isAuthenticated && user ? (
                            <>
                                {/* Dashboard */}
                                <Link
                                    href="/dashboard"
                                    className="
                                        rounded-lg
                                        px-3.5 py-2
                                        text-sm font-medium
                                        text-zinc-400
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-100
                                    "
                                >
                                    Dashboard
                                </Link>

                                {/* Profile */}
                                <div
                                    ref={profileRef}
                                    className="relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsProfileOpen(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        aria-label="Open profile menu"
                                        aria-expanded={
                                            isProfileOpen
                                        }
                                        className="
                                            flex items-center gap-1.5
                                            rounded-lg
                                            px-1.5 py-1.5
                                            transition-colors
                                            hover:bg-zinc-900
                                        "
                                    >
                                        <div
                                            className="
                                                flex h-7 w-7
                                                items-center justify-center
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
                                            className={`
                                                h-3 w-3
                                                text-zinc-700
                                                transition-transform
                                                ${isProfileOpen
                                                    ? "rotate-180"
                                                    : ""
                                                }
                                            `}
                                        />
                                    </button>

                                    {/* Profile Dropdown */}
                                    {isProfileOpen && (
                                        <div
                                            className="
                                                absolute right-0 top-full
                                                z-50 mt-2 w-64
                                                overflow-hidden
                                                rounded-xl
                                                border border-zinc-800
                                                bg-zinc-950
                                                shadow-2xl
                                            "
                                        >
                                            {/* User Info */}
                                            <div
                                                className="
                                                    border-b
                                                    border-zinc-800
                                                    px-3 py-3
                                                "
                                            >
                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                        text-zinc-100
                                                    "
                                                >
                                                    {user.name}
                                                </p>

                                                <p
                                                    className="
                                                        mt-0.5
                                                        truncate
                                                        text-xs
                                                        text-zinc-500
                                                    "
                                                >
                                                    {user.email}
                                                </p>

                                                {user.emailVerifiedAt && (
                                                    <p
                                                        className="
                                                            mt-2
                                                            text-[11px]
                                                            text-zinc-600
                                                        "
                                                    >
                                                        Email verified
                                                    </p>
                                                )}
                                            </div>

                                            {/* Menu */}
                                            <div className="p-1.5">
                                                <Link
                                                    href="/profile"
                                                    onClick={() =>
                                                        setIsProfileOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="
                                                        block
                                                        rounded-lg
                                                        px-3 py-2
                                                        text-sm
                                                        text-zinc-400
                                                        transition-colors
                                                        hover:bg-zinc-900
                                                        hover:text-zinc-100
                                                    "
                                                >
                                                    Profile
                                                </Link>

                                                <Link
                                                    href="/settings"
                                                    onClick={() =>
                                                        setIsProfileOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="
                                                        block
                                                        rounded-lg
                                                        px-3 py-2
                                                        text-sm
                                                        text-zinc-400
                                                        transition-colors
                                                        hover:bg-zinc-900
                                                        hover:text-zinc-100
                                                    "
                                                >
                                                    Settings
                                                </Link>

                                                <Link
                                                    href="/documentation"
                                                    onClick={() =>
                                                        setIsProfileOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="
                                                        block
                                                        rounded-lg
                                                        px-3 py-2
                                                        text-sm
                                                        text-zinc-400
                                                        transition-colors
                                                        hover:bg-zinc-900
                                                        hover:text-zinc-100
                                                    "
                                                >
                                                    Documentation
                                                </Link>

                                                <div
                                                    className="
                                                        my-1
                                                        border-t
                                                        border-zinc-900
                                                    "
                                                />

                                                <button
                                                    type="button"
                                                    disabled={
                                                        isLoggingOut
                                                    }
                                                    onClick={async () => {
                                                        await logout();
                                                        setIsProfileOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="
                                                        flex w-full
                                                        rounded-lg
                                                        px-3 py-2
                                                        text-left
                                                        text-sm
                                                        text-red-400
                                                        transition-colors
                                                        hover:bg-red-950/30
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    {isLoggingOut
                                                        ? "Signing out..."
                                                        : "Sign out"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Login */}
                                <Link
                                    href="/login"
                                    className="
                                        rounded-lg
                                        px-3.5 py-2
                                        text-sm font-medium
                                        text-zinc-400
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-100
                                    "
                                >
                                    Log in
                                </Link>

                                {/* Get Started */}
                                <Link
                                    href="/register"
                                    className="
                                        group flex items-center gap-1.5
                                        rounded-lg
                                        bg-zinc-100
                                        px-4 py-2
                                        text-sm font-medium
                                        text-zinc-950
                                        transition-all
                                        hover:bg-white
                                        hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]
                                    "
                                >
                                    Get started

                                    <ArrowRight
                                        className="
                                            h-3.5 w-3.5
                                            transition-transform
                                            group-hover:translate-x-0.5
                                        "
                                    />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 md:hidden">
                        {isAuthenticated && user && (
                            <Link
                                href="/profile"
                                onClick={closeMenu}
                                aria-label="Profile"
                                className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-lg
                                    transition-colors
                                    hover:bg-zinc-900
                                "
                            >
                                <div
                                    className="
                                        flex h-7 w-7
                                        items-center justify-center
                                        rounded-full
                                        bg-zinc-800
                                        text-[9px]
                                        font-semibold
                                        text-zinc-400
                                    "
                                >
                                    {initials}
                                </div>
                            </Link>
                        )}

                        <button
                            type="button"
                            aria-label={
                                isMenuOpen
                                    ? "Close navigation menu"
                                    : "Open navigation menu"
                            }
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-navigation"
                            onClick={() =>
                                setIsMenuOpen(
                                    (current) => !current,
                                )
                            }
                            className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-lg
                                text-zinc-400
                                transition-colors
                                hover:bg-zinc-900
                                hover:text-zinc-100
                            "
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    id="mobile-navigation"
                    className={`
                        overflow-hidden
                        transition-all duration-200
                        md:hidden
                        ${isMenuOpen
                            ? "max-h-[600px] pb-4 opacity-100"
                            : "max-h-0 opacity-0"
                        }
                    `}
                >
                    <nav className="border-t border-zinc-900 pt-3">
                        <div className="flex flex-col">
                            {navigation.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMenu}
                                    className="
                                        rounded-lg
                                        px-3 py-3
                                        text-sm font-medium
                                        text-zinc-400
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-100
                                    "
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        <div className="mt-3 border-t border-zinc-900 pt-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Dashboard */}
                                    <Link
                                        href="/dashboard"
                                        onClick={closeMenu}
                                        className="
                                            block
                                            rounded-lg
                                            px-3 py-3
                                            text-sm font-medium
                                            text-zinc-400
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-100
                                        "
                                    >
                                        Dashboard
                                    </Link>

                                    {/* Profile */}
                                    <Link
                                        href="/profile"
                                        onClick={closeMenu}
                                        className="
                                            block
                                            rounded-lg
                                            px-3 py-3
                                            text-sm font-medium
                                            text-zinc-400
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-100
                                        "
                                    >
                                        Profile
                                    </Link>

                                    {/* Settings */}
                                    <Link
                                        href="/settings"
                                        onClick={closeMenu}
                                        className="
                                            block
                                            rounded-lg
                                            px-3 py-3
                                            text-sm font-medium
                                            text-zinc-400
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-100
                                        "
                                    >
                                        Settings
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="
                                            block
                                            rounded-lg
                                            px-3 py-3
                                            text-sm font-medium
                                            text-zinc-400
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-100
                                        "
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        href="/register"
                                        onClick={closeMenu}
                                        className="
                                            mt-2 flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-lg
                                            bg-zinc-100
                                            px-4 py-3
                                            text-sm font-medium
                                            text-zinc-950
                                            transition-colors
                                            hover:bg-white
                                        "
                                    >
                                        Get started
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}