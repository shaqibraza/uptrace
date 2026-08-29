"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowRight,
    Menu,
    X,
} from "lucide-react";

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

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header
            className="
                sticky top-0 z-50
                border-b border-zinc-800/80
                bg-black/90
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
                                flex h-8 w-8 items-center justify-center
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
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 md:hidden">

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
                                setIsMenuOpen((current) => !current)
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
                        ${
                            isMenuOpen
                                ? "max-h-[500px] pb-4 opacity-100"
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
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="
                                    block rounded-lg
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
                                    items-center justify-center
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
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
