"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Clock3,
  Gauge,
  Globe,
  Server,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Pagination } from "../../components/Pagination";
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute";

import { useHttpEndpointStore } from "../../../../stores/http-endpoint.store";
import { useProjectStore } from "../../../../stores/project.store";

type EndpointMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type CheckStatus = "UP" | "DOWN";

const EMPTY_CHECK_RESULTS: NonNullable<
  ReturnType<typeof useHttpEndpointStore.getState>["checkResults"][string]
> = [];

const STATUS_HISTORY_PAGE_SIZE = 20;
const CHECK_HISTORY_PAGE_SIZE = 5;
const RESPONSE_TIME_GRAPH_POINTS = 30;

export default function HttpEndpointDetailsPage() {
  return (
    <ProtectedRoute>
      <HttpEndpointDetailsContent />
    </ProtectedRoute>
  );
}

function HttpEndpointDetailsContent() {
  const router = useRouter();
  const params = useParams();

  const endpointId =
    typeof params.endpointId === "string" ? params.endpointId : "";

  const endpoint = useHttpEndpointStore((state) => state.selectedEndpoint);

  const selectedProject = useProjectStore((state) => state.selectedProject);

  const checkResults = useHttpEndpointStore((state) =>
    endpointId
      ? (state.checkResults[endpointId] ?? EMPTY_CHECK_RESULTS)
      : EMPTY_CHECK_RESULTS,
  );

  const isLoadingCheckResults = useHttpEndpointStore(
    (state) => state.isLoadingCheckResults,
  );

  const error = useHttpEndpointStore((state) => state.error);

  const fetchEndpoints = useHttpEndpointStore((state) => state.fetchEndpoints);

  const setSelectedEndpoint = useHttpEndpointStore(
    (state) => state.setSelectedEndpoint,
  );

  const fetchCheckResults = useHttpEndpointStore(
    (state) => state.fetchCheckResults,
  );

  const [statusHistoryPage, setStatusHistoryPage] = useState(1);

  const [checkHistoryPage, setCheckHistoryPage] = useState(1);

  useEffect(() => {
    if (!endpointId || !selectedProject?.id) {
      return;
    }

    let isCurrent = true;

    setSelectedEndpoint(null);

    const loadProjectEndpoint = async () => {
      const loaded = await fetchEndpoints(selectedProject.id);

      if (!loaded || !isCurrent) {
        return;
      }

      const projectEndpoints = useHttpEndpointStore.getState().endpoints;
      const projectEndpoint = projectEndpoints.find(
        (item) => item.id === endpointId,
      );

      if (!projectEndpoint) {
        router.replace(
          projectEndpoints[0]
            ? `/dashboard/http-monitoring/${projectEndpoints[0].id}`
            : "/dashboard/http-monitoring",
        );
        return;
      }

      setStatusHistoryPage(1);
      setCheckHistoryPage(1);
      setSelectedEndpoint(projectEndpoint);
      void fetchCheckResults(endpointId);
    };

    void loadProjectEndpoint();

    return () => {
      isCurrent = false;
    };
  }, [
    endpointId,
    fetchCheckResults,
    fetchEndpoints,
    router,
    selectedProject?.id,
    setSelectedEndpoint,
  ]);

  useEffect(() => {
    if (!endpointId || !selectedProject?.id || endpoint?.id !== endpointId) {
      return;
    }

    const refreshTimer = setInterval(() => {
      void fetchCheckResults(endpointId);
    }, 30_000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [endpoint?.id, endpointId, fetchCheckResults, selectedProject?.id]);

  const latestResult = useMemo(() => {
    return (
      checkResults
        .slice()
        .sort(
          (a, b) =>
            new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
        )[0] ?? null
    );
  }, [checkResults]);

  const averageResponseTime = useMemo(() => {
    const responseTimes = checkResults
      .map((result) => result.responseTimeMs)
      .filter((value): value is number => value != null);

    if (!responseTimes.length) {
      return null;
    }

    return (
      responseTimes.reduce((sum, value) => sum + value, 0) /
      responseTimes.length
    );
  }, [checkResults]);

  const uptime = useMemo(() => {
    if (!checkResults.length) {
      return null;
    }

    const upChecks = checkResults.filter(
      (result) => result.status === "UP",
    ).length;

    return (upChecks / checkResults.length) * 100;
  }, [checkResults]);

  const sortedCheckResults = useMemo(() => {
    return checkResults
      .slice()
      .sort(
        (a, b) =>
          new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
      );
  }, [checkResults]);

  const statusHistoryTotalPages = Math.max(
    1,
    Math.ceil(sortedCheckResults.length / STATUS_HISTORY_PAGE_SIZE),
  );

  const currentStatusHistoryPage = Math.min(
    statusHistoryPage,
    statusHistoryTotalPages,
  );

  const statusHistoryResults = useMemo(() => {
    const start = (currentStatusHistoryPage - 1) * STATUS_HISTORY_PAGE_SIZE;

    return sortedCheckResults
      .slice(start, start + STATUS_HISTORY_PAGE_SIZE)
      .reverse();
  }, [sortedCheckResults, currentStatusHistoryPage]);

  const checkHistoryTotalPages = Math.max(
    1,
    Math.ceil(sortedCheckResults.length / CHECK_HISTORY_PAGE_SIZE),
  );

  const currentCheckHistoryPage = Math.min(
    checkHistoryPage,
    checkHistoryTotalPages,
  );

  const paginatedCheckResults = useMemo(() => {
    const start = (currentCheckHistoryPage - 1) * CHECK_HISTORY_PAGE_SIZE;

    return sortedCheckResults.slice(start, start + CHECK_HISTORY_PAGE_SIZE);
  }, [sortedCheckResults, currentCheckHistoryPage]);

  if (selectedProject && !endpoint && !error) {
    return <EndpointLoadingState />;
  }

  if (!selectedProject) {
    return <ProjectRequiredState />;
  }

  if (error || !endpoint) {
    return (
      <div>
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to HTTP Monitoring
          </button>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-8">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400" />

              <div>
                <h2 className="text-sm font-medium text-zinc-200">
                  Endpoint not found
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {error ?? "The requested HTTP endpoint could not be loaded."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = latestResult?.status ?? "PENDING";

  const statusCode = latestResult?.statusCode ?? null;

  return (
    <div>
      <main>
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            HTTP Monitoring
          </button>

          <div className="mb-7">
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
              <Activity className="h-3.5 w-3.5" />

              <span>Monitoring</span>

              <span>/</span>

              <span>HTTP Monitoring</span>

              {selectedProject?.name && (
                <>
                  <span>/</span>
                  <span className="text-zinc-500">{selectedProject.name}</span>
                </>
              )}

              <span>/</span>

              <span className="text-zinc-500">{endpoint.name}</span>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                    {endpoint.name}
                  </h1>

                  <StatusBadge status={status} />

                  <MethodBadge method={endpoint.method as EndpointMethod} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-700" />

                  <p className="truncate font-mono text-xs text-zinc-600">
                    {endpoint.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    endpoint.isActive ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                />

                {endpoint.isActive ? "Monitoring active" : "Monitoring paused"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Activity}
              label="Current status"
              value={status}
              detail={
                statusCode != null ? `HTTP ${statusCode}` : "No check available"
              }
              positive={status === "UP"}
              negative={status === "DOWN"}
            />

            <MetricCard
              icon={Clock3}
              label="Uptime"
              value={uptime != null ? `${uptime.toFixed(2)}%` : "—"}
              detail={
                checkResults.length
                  ? `${checkResults.length} checks`
                  : "Waiting for checks"
              }
              positive={uptime != null}
            />

            <MetricCard
              icon={Gauge}
              label="Avg. response"
              value={
                averageResponseTime != null
                  ? `${Math.round(averageResponseTime)} ms`
                  : "—"
              }
              detail={
                checkResults.length
                  ? "Based on check history"
                  : "Waiting for checks"
              }
            />

            <MetricCard
              icon={Server}
              label="Total checks"
              value={String(checkResults.length)}
              detail={
                isLoadingCheckResults ? "Loading checks" : "Recorded checks"
              }
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className="rounded-xl border border-zinc-900 bg-zinc-950">
              <SectionHeader
                title="Response time"
                description="Response latency across recent HTTP checks."
              />

              <div className="border-t border-zinc-900 p-5">
                <ResponseTimeChart results={checkResults} />
              </div>
            </section>

            <section className="rounded-xl border border-zinc-900 bg-zinc-950">
              <SectionHeader
                title="Status history"
                description="Availability across recent checks, 20 per page."
              />

              <div className="border-t border-zinc-900 p-5">
                <p className="mb-3 text-[10px] text-zinc-700">
                  Showing {statusHistoryResults.length} of {checkResults.length}{" "}
                  checks
                </p>

                <div className="flex flex-wrap gap-1">
                  {statusHistoryResults.length ? (
                    statusHistoryResults.map((result) => (
                      <StatusBlock key={result.id} status={result.status} />
                    ))
                  ) : (
                    <div className="flex h-260px w-full items-center justify-center">
                      <p className="text-xs text-zinc-700">
                        No check history yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {statusHistoryResults.length > 0 && (
                <Pagination
                  page={currentStatusHistoryPage}
                  totalPages={statusHistoryTotalPages}
                  pageSize={STATUS_HISTORY_PAGE_SIZE}
                  totalItems={sortedCheckResults.length}
                  onPageChange={setStatusHistoryPage}
                />
              )}
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <section className="rounded-xl border border-zinc-900 bg-zinc-950">
              <SectionHeader
                title="Endpoint configuration"
                description="Configuration used by the HTTP monitor."
              />

              <div className="divide-y divide-zinc-900 border-t border-zinc-900">
                <ConfigRow label="URL" value={endpoint.url} mono />

                <ConfigRow label="Method" value={endpoint.method} />

                <ConfigRow
                  label="Expected status"
                  value={String(endpoint.expectedStatusCode)}
                  mono
                />

                <ConfigRow
                  label="Check interval"
                  value={`${endpoint.intervalSeconds}s`}
                  mono
                />

                <ConfigRow
                  label="Timeout"
                  value={`${endpoint.timeoutMs}ms`}
                  mono
                />

                <ConfigRow
                  label="Status"
                  value={endpoint.isActive ? "Active" : "Paused"}
                />
              </div>
            </section>

            <section className="rounded-xl border border-zinc-900 bg-zinc-950">
              <SectionHeader
                title="Check history"
                description="Individual HTTP monitoring results."
              />

              <div className="overflow-x-auto border-t border-zinc-900">
                {paginatedCheckResults.length ? (
                  <table className="w-full min-w-700px">
                    <thead>
                      <tr className="border-b border-zinc-900">
                        <TableHead>Status</TableHead>

                        <TableHead>Status code</TableHead>

                        <TableHead>Response</TableHead>

                        <TableHead>Checked at</TableHead>

                        <TableHead>Error</TableHead>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedCheckResults.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-zinc-900/70 last:border-0"
                        >
                          <td className="px-4 py-3">
                            <StatusBadge status={result.status} />
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                            {result.statusCode ?? "—"}
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                            {result.responseTimeMs != null
                              ? `${Math.round(result.responseTimeMs)} ms`
                              : "—"}
                          </td>

                          <td className="px-4 py-3 text-[11px] text-zinc-600">
                            {formatDate(result.checkedAt)}
                          </td>

                          <td className="max-w-240px truncate px-4 py-3 text-[11px] text-red-400/70">
                            {result.errorMessage ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex h-220px items-center justify-center">
                    <p className="text-xs text-zinc-700">
                      No check history available.
                    </p>
                  </div>
                )}
              </div>

              {checkResults.length > 0 && (
                <Pagination
                  page={currentCheckHistoryPage}
                  totalPages={checkHistoryTotalPages}
                  pageSize={CHECK_HISTORY_PAGE_SIZE}
                  totalItems={checkResults.length}
                  onPageChange={setCheckHistoryPage}
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function ResponseTimeChart({
  results,
}: {
  results: Array<{
    checkedAt: string;
    responseTimeMs: number | null;
  }>;
}) {
  const points = useMemo(() => {
    return results
      .filter(
        (result) =>
          result.responseTimeMs != null &&
          Number.isFinite(result.responseTimeMs),
      )
      .sort(
        (a, b) =>
          new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
      )
      .slice(-RESPONSE_TIME_GRAPH_POINTS);
  }, [results]);

  if (!points.length) {
    return (
      <div className="flex h-280px items-center justify-center">
        <div className="text-center">
          <Gauge className="mx-auto h-6 w-6 text-zinc-800" />

          <p className="mt-3 text-xs text-zinc-600">
            No response time data yet.
          </p>

          <p className="mt-1 text-[11px] text-zinc-800">
            The graph will appear after the first check.
          </p>
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 280;
  const padding = {
    top: 20,
    right: 20,
    bottom: 35,
    left: 55,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = points.map((point) => point.responseTimeMs as number);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const getX = (index: number) => {
    if (points.length === 1) {
      return padding.left + chartWidth / 2;
    }

    return padding.left + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return (
      padding.top + chartHeight - ((value - minValue) / range) * chartHeight
    );
  };

  const linePoints = points
    .map(
      (point, index) =>
        `${getX(index)},${getY(point.responseTimeMs as number)}`,
    )
    .join(" ");

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
            Recent response time
          </p>

          <p className="mt-1 font-mono text-lg font-semibold text-zinc-200">
            {Math.round(points[points.length - 1]?.responseTimeMs as number)} ms
          </p>
        </div>

        <p className="text-[10px] text-zinc-700">
          Latest {points.length} measurements
        </p>
      </div>

      <div className="overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-280px w-full"
          role="img"
          aria-label="Response time history"
        >
          {[0, 0.5, 1].map((ratio) => {
            const value = maxValue - ratio * range;
            const y = padding.top + ratio * chartHeight;

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  className="stroke-zinc-900"
                />

                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-700 text-[10px]"
                >
                  {Math.round(value)}ms
                </text>
              </g>
            );
          })}

          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500"
          />

          {points.map((point, index) => (
            <circle
              key={`${point.checkedAt}-${index}`}
              cx={getX(index)}
              cy={getY(point.responseTimeMs as number)}
              r="3"
              className="fill-emerald-500"
            >
              <title>
                {`${Math.round(
                  point.responseTimeMs as number,
                )} ms — ${formatDate(point.checkedAt)}`}
              </title>
            </circle>
          ))}

          <text
            x={padding.left}
            y={height - 10}
            className="fill-zinc-700 text-[10px]"
          >
            {formatTime(points[0]?.checkedAt ?? "")}
          </text>

          <text
            x={width - padding.right}
            y={height - 10}
            textAnchor="end"
            className="fill-zinc-700 text-[10px]"
          >
            {formatTime(points[points.length - 1]?.checkedAt ?? "")}
          </text>
        </svg>
      </div>
    </div>
  );
}

function formatTime(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EndpointLoadingState() {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
        Loading endpoint...
      </div>
    </div>
  );
}

function ProjectRequiredState() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-center">
      <div>
        <h1 className="text-sm font-medium text-zinc-200">Select a project</h1>
        <p className="mt-2 text-xs text-zinc-600">
          Choose a project to view its HTTP endpoints.
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-4">
      <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>

      <p className="mt-1 text-xs text-zinc-700">{description}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  positive,
  negative,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
      <div className="flex items-center gap-2 text-zinc-600">
        <Icon className="h-3.5 w-3.5" />

        <span className="text-[11px]">{label}</span>
      </div>

      <div
        className={`mt-3 text-xl font-semibold ${
          positive
            ? "text-emerald-400"
            : negative
              ? "text-red-400"
              : "text-zinc-200"
        }`}
      >
        {value}
      </div>

      <p className="mt-1 text-[10px] text-zinc-700">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "UP" | "DOWN" | "PENDING" }) {
  const isUp = status === "UP";
  const isPending = status === "PENDING";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] ${
        isUp ? "text-emerald-500" : isPending ? "text-zinc-600" : "text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isUp ? "bg-emerald-500" : isPending ? "bg-zinc-700" : "bg-red-400"
        }`}
      />

      {status}
    </span>
  );
}

function MethodBadge({ method }: { method: EndpointMethod }) {
  return (
    <span className="rounded-md border border-zinc-900 bg-black px-2 py-1 font-mono text-[9px] text-zinc-500">
      {method}
    </span>
  );
}

function StatusBlock({ status }: { status: CheckStatus }) {
  return (
    <div
      title={status}
      className={`h-8 flex-1 rounded-sm ${
        status === "UP" ? "bg-emerald-500/70" : "bg-red-500/70"
      }`}
    />
  );
}

function ConfigRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <span className="text-[11px] text-zinc-600">{label}</span>

      <span
        className={`max-w-[65%] truncate text-right text-[11px] text-zinc-400 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-medium text-zinc-700">
      {children}
    </th>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}
