"use client";

import { useState } from "react";
import {
    Bell,
    Check,
    ChevronDown,
    Database,
    Globe,
    KeyRound,
    Lock,
    Monitor,
    Save,
    Settings as SettingsIcon,
    Shield,
    User,
} from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type Tab = "General" | "Project" | "Notifications" | "Security";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("General");
    const [saved, setSaved] = useState(false);

    const saveSettings = () => {
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 1800);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-7">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <SettingsIcon className="h-3.5 w-3.5" />
                            Settings
                        </div>

                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Settings
                                </h1>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Manage your account, project and
                                    observability preferences.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={saveSettings}
                                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-xs font-medium text-black transition-colors hover:bg-white"
                            >
                                {saved ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-3.5 w-3.5" />
                                        Save changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[210px_1fr]">

                        {/* Tabs */}
                        <aside className="h-fit rounded-xl border border-zinc-900 bg-zinc-950 p-2">
                            <div className="mb-2 px-3 py-2">
                                <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-800">
                                    Preferences
                                </p>
                            </div>

                            <div className="space-y-1">
                                <SettingTab
                                    icon={User}
                                    label="General"
                                    active={activeTab === "General"}
                                    onClick={() =>
                                        setActiveTab("General")
                                    }
                                />

                                <SettingTab
                                    icon={Database}
                                    label="Project"
                                    active={activeTab === "Project"}
                                    onClick={() =>
                                        setActiveTab("Project")
                                    }
                                />

                                <SettingTab
                                    icon={Bell}
                                    label="Notifications"
                                    active={
                                        activeTab === "Notifications"
                                    }
                                    onClick={() =>
                                        setActiveTab("Notifications")
                                    }
                                />

                                <SettingTab
                                    icon={Shield}
                                    label="Security"
                                    active={activeTab === "Security"}
                                    onClick={() =>
                                        setActiveTab("Security")
                                    }
                                />
                            </div>

                            <div className="mt-3 border-t border-zinc-900 pt-3">
                                <a
                                    href="/dashboard/api-keys"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                                >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    API Keys
                                </a>
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="min-w-0">
                            {activeTab === "General" && (
                                <GeneralSettings />
                            )}

                            {activeTab === "Project" && (
                                <ProjectSettings />
                            )}

                            {activeTab === "Notifications" && (
                                <NotificationSettings />
                            )}

                            {activeTab === "Security" && (
                                <SecuritySettings />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* General                                                                    */
/* -------------------------------------------------------------------------- */

function GeneralSettings() {
    return (
        <div className="space-y-6">
            <SettingsSection
                title="Profile"
                description="Your personal account information."
            >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-lg font-semibold text-zinc-400">
                        MS
                    </div>

                    <div>
                        <p className="text-sm font-medium text-zinc-300">
                            Mohd Shaqib Raza
                        </p>

                        <p className="mt-1 text-xs text-zinc-700">
                            shaqib@example.com
                        </p>

                        <button
                            type="button"
                            className="mt-3 text-[10px] text-zinc-500 hover:text-zinc-300"
                        >
                            Change profile image →
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <InputField
                        label="First name"
                        value="Mohd Shaqib"
                    />

                    <InputField
                        label="Last name"
                        value="Raza"
                    />

                    <InputField
                        label="Email"
                        value="shaqib@example.com"
                        disabled
                    />

                    <InputField
                        label="Timezone"
                        value="Asia/Kolkata"
                    />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Appearance"
                description="Customize how Uptrace looks for you."
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    <AppearanceCard
                        icon={Monitor}
                        label="System"
                        description="Use system preference"
                        active
                    />

                    <AppearanceCard
                        icon={Monitor}
                        label="Dark"
                        description="Always use dark mode"
                    />

                    <AppearanceCard
                        icon={Globe}
                        label="Light"
                        description="Always use light mode"
                    />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Language"
                description="Choose your preferred language."
            >
                <SelectField
                    label="Language"
                    value="English"
                />
            </SettingsSection>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Project                                                                    */
/* -------------------------------------------------------------------------- */

function ProjectSettings() {
    return (
        <div className="space-y-6">
            <SettingsSection
                title="Project information"
                description="Basic information about your observability project."
            >
                <div className="space-y-5">
                    <InputField
                        label="Project name"
                        value="My Uptrace Project"
                    />

                    <div>
                        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700">
                            Project ID
                        </label>

                        <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3 py-2.5">
                            <code className="flex-1 font-mono text-xs text-zinc-500">
                                proj_7f8c91a2e4d8
                            </code>

                            <button
                                type="button"
                                className="text-[10px] text-zinc-700 hover:text-zinc-300"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <SelectField
                        label="Environment"
                        value="Production"
                    />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Data retention"
                description="Choose how long telemetry data should be retained."
            >
                <SelectField
                    label="Retention period"
                    value="30 days"
                />

                <p className="mt-2 text-[10px] leading-5 text-zinc-800">
                    Older traces, logs and metrics will automatically be
                    removed after the selected retention period.
                </p>
            </SettingsSection>

            <SettingsSection
                title="Ingestion"
                description="Configure how your project receives telemetry."
            >
                <div className="rounded-lg border border-zinc-900 bg-black p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950">
                                <Database className="h-3.5 w-3.5 text-zinc-600" />
                            </div>

                            <div>
                                <p className="text-xs text-zinc-400">
                                    OpenTelemetry OTLP
                                </p>

                                <p className="mt-1 text-[10px] text-zinc-800">
                                    Traces, metrics and logs
                                </p>
                            </div>
                        </div>

                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Enabled
                        </span>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

function NotificationSettings() {
    return (
        <div className="space-y-6">
            <SettingsSection
                title="Notifications"
                description="Choose which events should send notifications."
            >
                <div className="divide-y divide-zinc-900">
                    <ToggleRow
                        title="Error spikes"
                        description="Notify when error rate suddenly increases."
                        enabled
                    />

                    <ToggleRow
                        title="Latency alerts"
                        description="Notify when service latency exceeds thresholds."
                        enabled
                    />

                    <ToggleRow
                        title="Service downtime"
                        description="Notify when a monitored service becomes unavailable."
                        enabled
                    />

                    <ToggleRow
                        title="Weekly summary"
                        description="Receive a weekly observability summary."
                    />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Notification channels"
                description="Where Uptrace should deliver alerts."
            >
                <div className="space-y-3">
                    <ChannelRow
                        name="Email"
                        value="shaqib@example.com"
                        enabled
                    />

                    <ChannelRow
                        name="Slack"
                        value="Not connected"
                    />

                    <ChannelRow
                        name="Webhook"
                        value="Not configured"
                    />
                </div>
            </SettingsSection>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Security                                                                   */
/* -------------------------------------------------------------------------- */

function SecuritySettings() {
    return (
        <div className="space-y-6">
            <SettingsSection
                title="Password"
                description="Update your account password."
            >
                <div className="space-y-5">
                    <InputField
                        label="Current password"
                        value=""
                        placeholder="Enter current password"
                        password
                    />

                    <InputField
                        label="New password"
                        value=""
                        placeholder="Enter new password"
                        password
                    />

                    <InputField
                        label="Confirm password"
                        value=""
                        placeholder="Confirm new password"
                        password
                    />

                    <button
                        type="button"
                        className="h-9 rounded-lg bg-zinc-100 px-4 text-xs font-medium text-black hover:bg-white"
                    >
                        Update password
                    </button>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Two-factor authentication"
                description="Add an additional layer of security to your account."
            >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                            <Lock className="h-4 w-4 text-zinc-600" />
                        </div>

                        <div>
                            <p className="text-xs font-medium text-zinc-400">
                                Two-factor authentication
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-800">
                                Protect your account with an authenticator.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="h-8 rounded-lg border border-zinc-800 px-3 text-[10px] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    >
                        Enable
                    </button>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Active sessions"
                description="Devices currently signed in to your account."
            >
                <div className="rounded-lg border border-zinc-900 bg-black p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-400">
                                Windows · Chrome
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-800">
                                Current session · India
                            </p>
                        </div>

                        <span className="text-[10px] text-emerald-600">
                            Current
                        </span>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

function SettingsSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="border-b border-zinc-900 px-5 py-5">
                <h2 className="text-sm font-semibold text-zinc-200">
                    {title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-zinc-700">
                    {description}
                </p>
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

function SettingTab({
    icon: Icon,
    label,
    active,
    onClick,
}: {
    icon: typeof User;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors
                ${
                    active
                        ? "bg-zinc-900 text-zinc-200"
                        : "text-zinc-600 hover:bg-zinc-900/50 hover:text-zinc-400"
                }
            `}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}

function InputField({
    label,
    value,
    placeholder,
    disabled,
    password,
}: {
    label: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    password?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700">
                {label}
            </label>

            <input
                type={password ? "password" : "text"}
                defaultValue={value}
                placeholder={placeholder}
                disabled={disabled}
                className="
                    h-10 w-full rounded-lg
                    border border-zinc-900
                    bg-black px-3
                    text-xs text-zinc-400
                    outline-none
                    placeholder:text-zinc-800
                    focus:border-zinc-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            />
        </div>
    );
}

function SelectField({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700">
                {label}
            </label>

            <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-900 bg-black px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800"
            >
                {value}

                <ChevronDown className="h-3.5 w-3.5 text-zinc-700" />
            </button>
        </div>
    );
}

function AppearanceCard({
    icon: Icon,
    label,
    description,
    active,
}: {
    icon: typeof Monitor;
    label: string;
    description: string;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            className={`
                rounded-lg border p-4 text-left transition-colors
                ${
                    active
                        ? "border-zinc-700 bg-zinc-900"
                        : "border-zinc-900 bg-black hover:border-zinc-800"
                }
            `}
        >
            <Icon
                className={`h-4 w-4 ${
                    active ? "text-zinc-300" : "text-zinc-700"
                }`}
            />

            <p className="mt-3 text-xs text-zinc-400">
                {label}
            </p>

            <p className="mt-1 text-[10px] text-zinc-800">
                {description}
            </p>

            {active && (
                <div className="mt-3 flex items-center gap-1 text-[9px] text-emerald-600">
                    <Check className="h-3 w-3" />
                    Selected
                </div>
            )}
        </button>
    );
}

function ToggleRow({
    title,
    description,
    enabled,
}: {
    title: string;
    description: string;
    enabled?: boolean;
}) {
    const [active, setActive] = useState(enabled ?? false);

    return (
        <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
            <div>
                <p className="text-xs font-medium text-zinc-400">
                    {title}
                </p>

                <p className="mt-1 text-[10px] leading-5 text-zinc-800">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={() => setActive(!active)}
                className={`
                    relative h-5 w-9 shrink-0 rounded-full transition-colors
                    ${active ? "bg-zinc-300" : "bg-zinc-800"}
                `}
                aria-label={`Toggle ${title}`}
            >
                <span
                    className={`
                        absolute top-1 h-3 w-3 rounded-full transition-transform
                        ${
                            active
                                ? "translate-x-5 bg-black"
                                : "translate-x-1 bg-zinc-500"
                        }
                    `}
                />
            </button>
        </div>
    );
}

function ChannelRow({
    name,
    value,
    enabled,
}: {
    name: string;
    value: string;
    enabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-black p-4">
            <div>
                <p className="text-xs text-zinc-400">{name}</p>

                <p className="mt-1 text-[10px] text-zinc-800">
                    {value}
                </p>
            </div>

            <span
                className={`text-[10px] ${
                    enabled ? "text-emerald-600" : "text-zinc-800"
                }`}
            >
                {enabled ? "Connected" : "Not configured"}
            </span>
        </div>
    );
}