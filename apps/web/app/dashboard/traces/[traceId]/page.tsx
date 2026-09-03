"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  Globe,
  RefreshCw,
  Server,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useProjectStore } from "../../../../stores/project.store";
import {
  getTrace,
  getTraces,
  type Span,
  type Trace,
} from "../../../../lib/api/trace.api";
import { useOrganizationStore } from "../../../../stores/organization.store";
import { useAuthStore } from "../../../../stores/auth.store";

type UiSpan = {
  id: string;
  spanId: string;
  service: string;
  operation: string;
  duration: number;
  start: number;
  width: number;
  depth: number;
  status: string;
  type: "http" | "database" | "internal";
};

export default function TraceDetailPage({
  params,
}: {
  params: Promise<{ traceId: string }>;
}) {
  const router = useRouter();

  const selectedProject = useProjectStore((state) => state.selectedProject);

  const authStatus = useAuthStore((state) => state.status);
  const isAuthInitializing = useAuthStore((state) => state.isInitializing);

  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const selectedOrganization = useOrganizationStore(
    (state) => state.selectedOrganization,
  );

  const [traceId, setTraceId] = useState<string | null>(null);

  const [trace, setTrace] = useState<Trace | null>(null);

  const [spans, setSpans] = useState<Span[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const [showMore, setShowMore] = useState(false);

  // Resolve the trace ID from the Next.js route params.
  useEffect(() => {
    let active = true;

    void params.then((resolvedParams) => {
      if (!active) {
        return;
      }

      setTraceId(resolvedParams.traceId);
    });

    return () => {
      active = false;
    };
  }, [params]);

  // Restore the selected project when the page is opened directly.
  useEffect(() => {
    if (
      isAuthInitializing ||
      authStatus !== "authenticated" ||
      selectedProject?.id ||
      !selectedOrganization?.id
    ) {
      return;
    }

    void fetchProjects(selectedOrganization.id);
  }, [
    selectedProject?.id,
    selectedOrganization?.id,
    fetchProjects,
    authStatus,
    isAuthInitializing,
  ]);

  const loadTrace = useCallback(
    async (projectId: string, currentTraceId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTrace(projectId, currentTraceId);

        setTrace(response.data.trace);

        setSpans(response.data.spans);
      } catch (requestError) {
        console.error("Failed to fetch trace:", requestError);

        setTrace(null);
        setSpans([]);

        setError("Failed to load trace");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Verify that the trace belongs to the selected project before loading it.
  useEffect(() => {
    if (
      isAuthInitializing ||
      authStatus !== "authenticated" ||
      !selectedProject?.id ||
      !traceId
    ) {
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setTrace(null);
    setSpans([]);

    const loadSelectedProjectTrace = async () => {
      try {
        const response = await getTraces(selectedProject.id);

        if (!active) {
          return;
        }

        const traceExists = response.data.traces.some(
          (item) => item.traceId === traceId || item.id === traceId,
        );

        if (!traceExists) {
          router.replace("/dashboard/traces");
          return;
        }

        await loadTrace(selectedProject.id, traceId);
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Failed to validate trace:", requestError);
        setError("Failed to load traces for the selected project");
        setLoading(false);
      }
    };

    void loadSelectedProjectTrace();

    return () => {
      active = false;
    };
  }, [
    selectedProject?.id,
    traceId,
    loadTrace,
    authStatus,
    isAuthInitializing,
    router,
  ]);

  const copyTraceId = async () => {
    if (!traceId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(traceId);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (copyError) {
      console.error("Failed to copy trace ID:", copyError);
    }
  };

  const shareTrace = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trace: ${operation}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Trace link copied");
      }
    } catch (error) {
      console.error("Failed to share trace:", error);
    }
  };

  const uiSpans = useMemo<UiSpan[]>(() => {
    if (!trace) {
      return [];
    }

    const traceStart = new Date(trace.startTime).getTime();

    const traceDuration = Math.max(trace.durationMs ?? 0, 1);

    const spanMap = new Map(spans.map((span) => [span.spanId, span]));

    const getDepth = (span: Span) => {
      let depth = 0;

      let currentParent = span.parentSpanId;

      const visited = new Set<string>();

      while (currentParent && !visited.has(currentParent)) {
        visited.add(currentParent);

        const parent = spanMap.get(currentParent);

        if (!parent) {
          break;
        }

        depth += 1;

        currentParent = parent.parentSpanId;
      }

      return depth;
    };

    return spans.map((span) => {
      const spanStart = new Date(span.startTime).getTime();

      const duration = span.durationMs ?? 0;

      const relativeStart =
        Number.isFinite(spanStart) && Number.isFinite(traceStart)
          ? Math.max(spanStart - traceStart, 0)
          : 0;

      const startPercent = Math.min(
        Math.max((relativeStart / traceDuration) * 100, 0),
        100,
      );

      const widthPercent = Math.min(
        Math.max((duration / traceDuration) * 100, 1),
        100 - startPercent,
      );

      return {
        id: span.id,
        spanId: span.spanId,
        service: span.serviceName,
        operation: span.name,
        duration,
        start: relativeStart,
        width: widthPercent,
        depth: getDepth(span),
        status: span.status,
        type: getSpanType(span),
      };
    });
  }, [trace, spans]);

  const traceStatus = trace?.status === "ERROR" ? "Error" : "OK";

  const isSuccessful = traceStatus === "OK";

  const operation =
    trace?.operationName ?? getRootSpan(spans)?.name ?? "Unknown operation";

  const service =
    trace?.serviceName ?? getRootSpan(spans)?.serviceName ?? "Unknown service";

  const durationMs = trace?.durationMs ?? 0;

  const spanCount = trace
    ? Number(trace.spanCount ?? spans.length)
    : spans.length;

  const environment = trace?.environment ?? "Not specified";

  const rootSpan = getRootSpan(spans);

  const httpAttributes = getHttpAttributes(rootSpan);

  const timelineEnd = Math.max(durationMs, 1);

  const timeMarkers = createTimeMarkers(timelineEnd);

  if (!traceId) {
    return (
      <TracePageShell>
        <TraceLoadingState />
      </TracePageShell>
    );
  }

  // Keep the page in a loading state while the project store restores the selected project.
  if (!selectedProject?.id) {
    return (
      <TracePageShell>
        <TraceLoadingState />
      </TracePageShell>
    );
  }

  if (loading) {
    return (
      <TracePageShell>
        <TraceLoadingState />
      </TracePageShell>
    );
  }

  if (error || !trace) {
    return (
      <TracePageShell>
        <TraceState
          title="Failed to load trace"
          message={error ?? "The requested trace could not be found."}
          action={
            <button
              type="button"
              onClick={() => void loadTrace(selectedProject.id, traceId)}
              className="
                                mt-5
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-zinc-800
                                bg-zinc-950
                                px-3
                                py-2
                                text-xs
                                text-zinc-500
                                transition-colors
                                hover:bg-zinc-900
                                hover:text-zinc-300
                            "
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          }
        />
      </TracePageShell>
    );
  }

  return (
    <TracePageShell>
      <div className="mb-5 flex items-center gap-2 text-xs text-zinc-700">
        <Link
          href="/dashboard"
          className="transition-colors hover:text-zinc-300"
        >
          Dashboard
        </Link>

        <span>/</span>

        <Link
          href="/dashboard/traces"
          className="transition-colors hover:text-zinc-300"
        >
          Traces
        </Link>

        <span>/</span>

        <span className="font-mono text-zinc-500">
          {traceId.slice(0, 12)}...
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            href="/dashboard/traces"
            className="mb-3 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to traces
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              {operation}
            </h1>

            {isSuccessful ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                <CheckCircle2 className="h-3 w-3" />
                OK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/10 bg-red-500/5 px-2.5 py-1 text-[11px] font-medium text-red-400">
                <TriangleAlert className="h-3 w-3" />
                Error
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDuration(durationMs)}
            </span>

            <span>
              {spanCount} {spanCount === 1 ? "span" : "spans"}
            </span>

            <span>
              service: <span className="text-zinc-400">{service}</span>
            </span>

            <button
              type="button"
              onClick={copyTraceId}
              className="group flex items-center gap-1.5 font-mono transition-colors hover:text-zinc-300"
            >
              {copied ? "Copied" : `${traceId.slice(0, 24)}...`}

              <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shareTrace}
            className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Share
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
            >
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {showMore && (
              <div className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-xl">
                <button
                  type="button"
                  onClick={copyTraceId}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  Copy Trace ID
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(window.location.href);
                    setShowMore(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  Copy Trace URL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void loadTrace(selectedProject.id, traceId);
                    setShowMore(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  Refresh Trace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Duration"
          value={formatDuration(durationMs)}
          detail="Total trace duration"
        />

        <SummaryCard
          label="Spans"
          value={String(spanCount)}
          detail={`Across ${getServiceCount(spans)} ${
            getServiceCount(spans) === 1 ? "service" : "services"
          }`}
        />

        <SummaryCard label="Root service" value={service} detail={operation} />

        <SummaryCard
          label="Status"
          value={isSuccessful ? "Success" : "Error"}
          detail={isSuccessful ? "No errors detected" : "Errors detected"}
          success={isSuccessful}
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              Trace waterfall
            </h2>

            <p className="mt-1 text-xs text-zinc-700">
              Span execution timeline
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-zinc-700">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Success
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Error
            </span>
          </div>
        </div>

        {uiSpans.length === 0 ? (
          <div className="flex min-h-300px items-center justify-center px-6 text-center">
            <p className="text-xs text-zinc-700">
              No spans found for this trace.
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0">
            <div className="grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] border-b border-zinc-900">
              <div className="px-5 py-3 text-[10px] uppercase tracking-wider text-zinc-700">
                Span
              </div>

              <div className="relative min-w-0 py-3">
                {timeMarkers.map((marker) => (
                  <div
                    key={marker.position}
                    className="absolute inset-y-0 border-l border-zinc-900"
                    style={{
                      left: `${marker.position}%`,
                    }}
                  />
                ))}

                <div className="relative flex justify-between pr-5 text-[10px] font-mono text-zinc-700">
                  {timeMarkers.map((marker) => (
                    <span key={marker.position}>{marker.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {uiSpans.map((span) => (
              <div
                key={span.id}
                className="grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] border-b border-zinc-900/70 last:border-0 hover:bg-zinc-900/20"
              >
                <div
                  className="flex min-w-0 items-center gap-2 px-5 py-4"
                  style={{
                    paddingLeft: `${20 + span.depth * 20}px`,
                  }}
                >
                  <SpanIcon type={span.type} />

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-300">
                      {span.operation}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-700">
                      {span.service}
                    </p>
                  </div>
                </div>

                <div className="relative min-w-0 flex items-center py-4">
                  <div className="absolute inset-0">
                    {timeMarkers.map((marker) => (
                      <div
                        key={marker.position}
                        className="absolute inset-y-0 border-l border-zinc-900"
                        style={{
                          left: `${marker.position}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div
                    className={`
                                relative z-10
                                h-6
                                rounded-md
                                border
                                ${
                                  isSpanSuccessful(span.status)
                                    ? "border-emerald-500/20 bg-emerald-500/10"
                                    : "border-red-500/20 bg-red-500/10"
                                }
                            `}
                    style={{
                      marginLeft: `${span.start}%`,
                      width: `${span.width}%`,
                    }}
                  >
                    <div className="flex h-full items-center px-2">
                      <span className="truncate text-[9px] font-mono text-zinc-500">
                        {formatDuration(span.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
        <div className="border-b border-zinc-900 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-200">
            Trace information
          </h2>

          <p className="mt-1 text-xs text-zinc-700">
            Metadata and attributes for this trace
          </p>
        </div>

        <div className="grid divide-y divide-zinc-900/70 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
              Trace metadata
            </p>

            <div className="space-y-4">
              <InfoRow label="Trace ID" value={traceId} mono />

              <InfoRow label="Service" value={service} />

              <InfoRow label="Operation" value={operation} mono />

              <InfoRow label="Environment" value={environment} />
            </div>
          </div>

          <div className="p-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
              HTTP attributes
            </p>

            <div className="space-y-4">
              <InfoRow
                label="HTTP method"
                value={httpAttributes.method ?? "Not available"}
                mono
              />

              <InfoRow
                label="Status code"
                value={httpAttributes.statusCode ?? "Not available"}
                mono
              />

              <InfoRow
                label="Route"
                value={httpAttributes.route ?? "Not available"}
                mono
              />

              <InfoRow
                label="User agent"
                value={httpAttributes.userAgent ?? "Not available"}
              />
            </div>
          </div>
        </div>
      </section>
    </TracePageShell>
  );
}

function TracePageShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}

function TraceLoadingState() {
  return (
    <div className="flex min-h-600px flex-col items-center justify-center text-center">
      <RefreshCw className="h-5 w-5 animate-spin text-zinc-700" />

      <p className="mt-4 text-xs text-zinc-600">Loading trace...</p>
    </div>
  );
}

function TraceState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-600px flex-col items-center justify-center px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
        <TriangleAlert className="h-4 w-4 text-red-400" />
      </div>

      <h3 className="mt-4 text-sm font-medium text-zinc-400">{title}</h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-700">{message}</p>

      {action}
    </div>
  );
}

function SpanIcon({ type }: { type: UiSpan["type"] }) {
  if (type === "database") {
    return <Database className="h-3.5 w-3.5 text-zinc-600" />;
  }

  if (type === "http") {
    return <Globe className="h-3.5 w-3.5 text-zinc-600" />;
  }

  return <Server className="h-3.5 w-3.5 text-zinc-600" />;
}

function SummaryCard({
  label,
  value,
  detail,
  success = false,
}: {
  label: string;
  value: string;
  detail: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
        {label}
      </p>

      <p
        className={`mt-3 text-lg font-semibold ${
          success ? "text-emerald-500" : "text-zinc-200"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-700">{detail}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="shrink-0 text-xs text-zinc-600">{label}</span>

      <span
        className={`
                    max-w-[70%]
                    truncate
                    text-right
                    text-xs
                    text-zinc-400
                    ${mono ? "font-mono" : ""}
                `}
      >
        {value}
      </span>
    </div>
  );
}

function getRootSpan(spans: Span[]): Span | null {
  if (spans.length === 0) {
    return null;
  }

  const spanIds = new Set(spans.map((span) => span.spanId));

  const rootSpan = spans.find(
    (span) => !span.parentSpanId || !spanIds.has(span.parentSpanId),
  );

  return rootSpan ?? spans[0] ?? null;
}

function getSpanType(span: Span): UiSpan["type"] {
  const kind = span.kind.toLowerCase();

  const name = span.name.toLowerCase();

  const attributes = getAttributes(span.attributes);

  const httpMethod =
    getAttributeString(attributes, "http.method") ??
    getAttributeString(attributes, "http.request.method");

  if (
    httpMethod ||
    name.startsWith("get ") ||
    name.startsWith("post ") ||
    name.startsWith("put ") ||
    name.startsWith("patch ") ||
    name.startsWith("delete ")
  ) {
    return "http";
  }

  if (
    kind.includes("client") &&
    (name.includes("select") ||
      name.includes("insert") ||
      name.includes("update") ||
      name.includes("delete") ||
      name.includes("query"))
  ) {
    return "database";
  }

  if (
    name.includes("postgres") ||
    name.includes("mysql") ||
    name.includes("database") ||
    name.includes("db.")
  ) {
    return "database";
  }

  return "internal";
}

function getServiceCount(spans: Span[]) {
  return new Set(spans.map((span) => span.serviceName)).size;
}

function isSpanSuccessful(status: string) {
  return status !== "ERROR";
}

function getAttributes(attributes: unknown): Record<string, unknown> {
  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes)
  ) {
    return {};
  }

  return attributes as Record<string, unknown>;
}

function getAttributeString(attributes: Record<string, unknown>, key: string) {
  const value = attributes[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function getHttpAttributes(span: Span | null) {
  if (!span) {
    return {
      method: null,
      statusCode: null,
      route: null,
      userAgent: null,
    };
  }

  const attributes = getAttributes(span.attributes);

  const method =
    getAttributeString(attributes, "http.request.method") ??
    getAttributeString(attributes, "http.method");

  const statusCode =
    getAttributeString(attributes, "http.response.status_code") ??
    getAttributeString(attributes, "http.status_code");

  const route = getAttributeString(attributes, "http.route");

  const userAgent =
    getAttributeString(attributes, "user_agent.original") ??
    getAttributeString(attributes, "http.user_agent");

  return {
    method,
    statusCode,
    route,
    userAgent,
  };
}

function createTimeMarkers(durationMs: number) {
  const safeDuration = Math.max(durationMs, 1);

  const markerValues = [
    0,
    safeDuration * 0.25,
    safeDuration * 0.5,
    safeDuration * 0.75,
    safeDuration,
  ];

  return markerValues.map((value, index) => ({
    position: index * 25,
    label: formatTimelineValue(value),
  }));
}

function formatTimelineValue(value: number) {
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  return `${(value / 1000).toFixed(2)}s`;
}

function formatDuration(durationMs: number) {
  if (!Number.isFinite(durationMs)) {
    return "0ms";
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}
