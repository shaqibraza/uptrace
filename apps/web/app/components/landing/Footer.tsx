"use client";

import Link from "next/link";
import {
    ArrowUpRight,
    GitBranch,
    Mail,
} from "lucide-react";

const productLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
];

const resourceLinks = [
    { label: "Documentation", href: "#docs" },
    { label: "Get started", href: "/register" },
];

const companyLinks = [
    { label: "GitHub", href: "#" },
    { label: "Contact", href: "mailto:hello@uptrace.dev" },
];

export function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-zinc-900 bg-black">
            {/* Top subtle glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Main footer */}
                <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:py-16">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-950">
                                U
                            </div>

                            <span className="text-lg font-semibold tracking-tight text-zinc-100">
                                Uptrace
                            </span>
                        </Link>

                        <p className="mt-5 text-sm leading-6 text-zinc-600">
                            OpenTelemetry observability for understanding
                            what is happening inside your applications.
                        </p>

                        <div className="mt-6 flex items-center gap-2">
                            <a
                                href="#"
                                aria-label="GitHub"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
                            >
                                <GitBranch className="h-4 w-4" />
                            </a>

                            <a
                                href="mailto:hello@uptrace.dev"
                                aria-label="Email"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
                            >
                                <Mail className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <FooterColumn
                        title="Product"
                        links={productLinks}
                    />

                    {/* Resources */}
                    <FooterColumn
                        title="Resources"
                        links={resourceLinks}
                    />

                    {/* Company */}
                    <FooterColumn
                        title="Company"
                        links={companyLinks}
                    />
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col gap-4 border-t border-zinc-900 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-zinc-700">
                        © {new Date().getFullYear()} Uptrace. All rights
                        reserved.
                    </p>

                    <div className="flex items-center gap-5 text-xs text-zinc-700">
                        <Link
                            href="#"
                            className="transition-colors hover:text-zinc-400"
                        >
                            Privacy
                        </Link>

                        <Link
                            href="#"
                            className="transition-colors hover:text-zinc-400"
                        >
                            Terms
                        </Link>

                        <Link
                            href="#"
                            className="group inline-flex items-center gap-1 transition-colors hover:text-zinc-400"
                        >
                            Status

                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: {
        label: string;
        href: string;
    }[];
}) {
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {title}
            </h3>

            <ul className="mt-5 space-y-3">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="text-sm text-zinc-600 transition-colors hover:text-zinc-200"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}