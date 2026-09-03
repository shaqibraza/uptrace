"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  Clock3,
  Gauge,
  MoreHorizontal,
  Plus,
  Search,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  ResponsiveDataTable,
  type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

import { useProjectStore } from "../../../stores/project.store";
import { useHttpEndpointStore } from "../../../stores/http-endpoint.store";
import { useAuthStore } from "../../../stores/auth.store";

type EndpointMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type EndpointStatus = "UP" | "DOWN" | "PENDING";

type HttpMonitoringEndpoint = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  method: EndpointMethod;
  url: string;
  status: EndpointStatus;
  responseTime: string;
  responseTimeMs: number | null;
  statusCode: number | null;
  uptime: string;
  lastChecked: string;
};

export default function HttpMonitoringPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(
    null,
  );
  const [deleteEndpointId, setDeleteEndpointId] = useState<string | null>(null);
  const [endpointName, setEndpointName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [endpointMethod, setEndpointMethod] = useState<
    "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"
  >("GET");

  const [expectedStatusCode, setExpectedStatusCode] = useState("200");

  const [intervalSeconds, setIntervalSeconds] = useState("60");

  const [timeoutMs, setTimeoutMs] = useState("5000");

  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const createEndpoint = useHttpEndpointStore((state) => state.createEndpoint);

  const updateEndpoint = useHttpEndpointStore((state) => state.updateEndpoint);

  const deleteEndpoint = useHttpEndpointStore((state) => state.deleteEndpoint);

  const isCreating = useHttpEndpointStore((state) => state.isCreating);

  const isUpdating = useHttpEndpointStore((state) => state.isUpdating);

  const isDeleting = useHttpEndpointStore((state) => state.isDeleting);

  const handleCreateEndpoint = async () => {
    setFormError(null);

    if (!selectedProject?.id) {
      setFormError("Please select a project first.");
      return;
    }

    const name = endpointName.trim();
    const url = endpointUrl.trim();

    if (!name) {
      setFormError("Endpoint name is required.");
      return;
    }
    if (!url) {
      setFormError("Endpoint URL is required.");
      return;
    }

    try {
      new URL(url);
    } catch (error) {
      setFormError("Please enter a valid URL.");
      return;
    }

    const statusCode = Number(expectedStatusCode);

    const interval = Number(intervalSeconds);

    const timeout = Number(timeoutMs);

    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      setFormError("Status code must be between 100 and 599.");
      return;
    }

    if (!Number.isInteger(interval) || interval <= 0) {
      setFormError("Check interval must be greater than 0.");
      return;
    }

    if (!Number.isInteger(timeout) || timeout <= 0) {
      setFormError("Timeout must be greater than 0.");
      return;
    }

    const endpoint = await createEndpoint(selectedProject.id, {
      name,
      url,
      method: endpointMethod,
      expectedStatusCode: statusCode,
      intervalSeconds: interval,
      timeoutMs: timeout,
    });

    if (!endpoint) {
      return;
    }

    setCreateOpen(false);

    setToast({
      type: "success",
      message: "HTTP endpoint created successfully.",
    });

    setEndpointName("");
    setEndpointUrl("");
    setEndpointMethod("GET");
    setExpectedStatusCode("200");
    setIntervalSeconds("60");
    setTimeoutMs("5000");
    setFormError(null);
  };

  const openCreateModal = () => {
    setEditingEndpointId(null);
    setEndpointName("");
    setEndpointUrl("");
    setEndpointMethod("GET");
    setExpectedStatusCode("200");
    setIntervalSeconds("60");
    setTimeoutMs("5000");
    setFormError(null);
    setCreateOpen(true);
  };

  const openEditModal = (endpoint: HttpMonitoringEndpoint) => {
    const source = endpoints.find((item) => item.id === endpoint.id);
    setEditingEndpointId(endpoint.id);
    setEndpointName(endpoint.name);
    setEndpointUrl(endpoint.url);
    setEndpointMethod(endpoint.method);
    setExpectedStatusCode(
      String(source?.expectedStatusCode ?? endpoint.statusCode),
    );
    setIntervalSeconds(String(source?.intervalSeconds ?? 60));
    setTimeoutMs(String(source?.timeoutMs ?? 5000));
    setFormError(null);
    setCreateOpen(true);
  };

  const handleUpdateEndpoint = async () => {
    setFormError(null);
    if (!editingEndpointId) {
      setFormError("No endpoint selected for update.");
      return;
    }
    const name = endpointName.trim();
    const url = endpointUrl.trim();
    if (!name) {
      setFormError("Endpoint name is required.");
      return;
    }
    if (!url) {
      setFormError("Endpoint URL is required.");
      return;
    }
    try {
      new URL(url);
    } catch {
      setFormError("Please enter a valid URL.");
      return;
    }
    const statusCode = Number(expectedStatusCode);
    const interval = Number(intervalSeconds);
    const timeout = Number(timeoutMs);
    if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
      setFormError("Status code must be between 100 and 599.");
      return;
    }
    if (!Number.isInteger(interval) || interval <= 0) {
      setFormError("Check interval must be greater than 0.");
      return;
    }
    if (!Number.isInteger(timeout) || timeout <= 0) {
      setFormError("Timeout must be greater than 0.");
      return;
    }
    const endpoint = await updateEndpoint(editingEndpointId, {
      name,
      url,
      method: endpointMethod,
      expectedStatusCode: statusCode,
      intervalSeconds: interval,
      timeoutMs: timeout,
    });
    if (!endpoint) return;
    setCreateOpen(false);
    setEditingEndpointId(null);
    setToast({
      type: "success",
      message: "HTTP endpoint updated successfully.",
    });
    setEndpointName("");
    setEndpointUrl("");
    setEndpointMethod("GET");
    setExpectedStatusCode("200");
    setIntervalSeconds("60");
    setTimeoutMs("5000");
    setFormError(null);
  };

  const handleDeleteEndpoint = async () => {
    if (!deleteEndpointId) return;
    const deleted = await deleteEndpoint(deleteEndpointId);
    if (deleted) {
      setDeleteEndpointId(null);
      setToast({
        type: "success",
        message: "HTTP endpoint deleted successfully.",
      });
    }
  };

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<"All methods" | EndpointMethod>(
    "All methods",
  );
  const [status, setStatus] = useState<"All statuses" | EndpointStatus>(
    "All statuses",
  );
  const [showFilters, setShowFilters] = useState(false);

  const selectedProject = useProjectStore((state) => state.selectedProject);

  const authStatus = useAuthStore((state) => state.status);
  const isAuthInitializing = useAuthStore((state) => state.isInitializing);

  const endpoints = useHttpEndpointStore((state) => state.endpoints);

  const isLoading = useHttpEndpointStore((state) => state.isLoading);

  const error = useHttpEndpointStore((state) => state.error);

  const fetchEndpoints = useHttpEndpointStore((state) => state.fetchEndpoints);

  const resetEndpoints = useHttpEndpointStore((state) => state.reset);

  const fetchAllLatestCheckResults = useHttpEndpointStore(
    (state) => state.fetchAllLatestCheckResults,
  );

  const latestCheckResults = useHttpEndpointStore(
    (state) => state.latestCheckResults,
  );

  const checkResults = useHttpEndpointStore((state) => state.checkResults);

  const fetchAllCheckResults = useHttpEndpointStore(
    (state) => state.fetchAllCheckResults,
  );

  const isLoadingCheckResults = useHttpEndpointStore(
    (state) => state.isLoadingCheckResults,
  );

  const checkResultsError = useHttpEndpointStore(
    (state) => state.checkResultsError,
  );

  const refreshEndpointData = useCallback(() => {
    if (isAuthInitializing || authStatus !== "authenticated") {
      return;
    }

    if (!selectedProject?.id) {
      resetEndpoints();
      return;
    }

    void fetchEndpoints(selectedProject.id);
  }, [
    authStatus,
    fetchEndpoints,
    isAuthInitializing,
    resetEndpoints,
    selectedProject?.id,
  ]);

  useEffect(() => {
    refreshEndpointData();
  }, [refreshEndpointData]);

  useEffect(() => {
    const refreshTimer = window.setInterval(refreshEndpointData, 30_000);

    return () => window.clearInterval(refreshTimer);
  }, [refreshEndpointData]);

  useEffect(() => {
    if (!endpoints.length) {
      return;
    }

    const endpointIds = endpoints.map((endpoint) => endpoint.id);

    void fetchAllLatestCheckResults(endpointIds);
    void fetchAllCheckResults(endpointIds);
  }, [endpoints, fetchAllLatestCheckResults, fetchAllCheckResults]);

  useEffect(() => {
    if (error) {
      setToast({
        type: "error",
        message: error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (checkResultsError) {
      setToast({
        type: "error",
        message: checkResultsError,
      });
    }
  }, [checkResultsError]);

  const monitoringEndpoints = useMemo<HttpMonitoringEndpoint[]>(
    () =>
      endpoints.map((endpoint) => {
        const result = latestCheckResults[endpoint.id];

        return {
          id: endpoint.id,
          projectId: endpoint.projectId,
          name: endpoint.name,
          description: `${endpoint.method} endpoint monitoring`,
          method: endpoint.method as EndpointMethod,
          url: endpoint.url,
          status: result?.status ?? "PENDING",
          responseTime:
            result?.responseTimeMs != null
              ? `${Math.round(result.responseTimeMs)} ms`
              : "—",
          responseTimeMs: result?.responseTimeMs ?? null,
          statusCode: result?.statusCode ?? null,
          uptime: (() => {
            const results = checkResults[endpoint.id] ?? [];

            if (!results.length) {
              return "—";
            }

            const upChecks = results.filter(
              (check) => check.status === "UP",
            ).length;

            return `${((upChecks / results.length) * 100).toFixed(2)}%`;
          })(),
          lastChecked: result?.checkedAt
            ? formatLastChecked(result.checkedAt)
            : "Not checked yet",
        };
      }),
    [endpoints, latestCheckResults, checkResults],
  );

  const averageUptime = useMemo(() => {
    const endpointUptimes = endpoints
      .map((endpoint) => {
        const results = checkResults[endpoint.id] ?? [];

        if (!results.length) {
          return null;
        }

        const upChecks = results.filter(
          (check) => check.status === "UP",
        ).length;

        return (upChecks / results.length) * 100;
      })
      .filter((uptime): uptime is number => uptime != null);

    if (!endpointUptimes.length) {
      return null;
    }

    return (
      endpointUptimes.reduce((sum, uptime) => sum + uptime, 0) /
      endpointUptimes.length
    );
  }, [endpoints, checkResults]);

  const filteredEndpoints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return monitoringEndpoints.filter((endpoint) => {
      const matchesSearch =
        !query ||
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.description.toLowerCase().includes(query) ||
        endpoint.url.toLowerCase().includes(query) ||
        endpoint.method.toLowerCase().includes(query);

      const matchesMethod =
        method === "All methods" || endpoint.method === method;

      const matchesStatus =
        status === "All statuses" || endpoint.status === status;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [monitoringEndpoints, search, method, status]);

  const endpointColumns: ResponsiveColumn<HttpMonitoringEndpoint>[] = [
    {
      key: "name",
      header: "Endpoint",
      mobileLabel: "Endpoint",
      render: (endpoint) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs text-zinc-400">
              {endpoint.name}
            </span>

            <EndpointMethodBadge method={endpoint.method} />
          </div>

          <p className="mt-1 truncate font-mono text-[10px] text-zinc-800">
            {endpoint.url}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (endpoint) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] ${
            endpoint.status === "UP" ? "text-emerald-500" : "text-red-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              endpoint.status === "UP" ? "bg-emerald-500" : "bg-red-400"
            }`}
          />

          {endpoint.status}
        </span>
      ),
    },
    {
      key: "responseTime",
      header: "Response",
      render: (endpoint) => (
        <span className="font-mono text-[11px] text-zinc-500">
          {endpoint.responseTime}
        </span>
      ),
    },
    {
      key: "statusCode",
      header: "Status code",
      render: (endpoint) => (
        <span
          className={`font-mono text-[11px] ${
            endpoint.statusCode != null && endpoint.statusCode >= 400
              ? "text-red-400"
              : "text-zinc-500"
          }`}
        >
          {endpoint.statusCode}
        </span>
      ),
    },
    {
      key: "uptime",
      header: "Uptime",
      render: (endpoint) => (
        <span className="font-mono text-[11px] text-zinc-500">
          {endpoint.uptime}
        </span>
      ),
    },
    {
      key: "lastChecked",
      header: "Last checked",
      render: (endpoint) => (
        <span className="text-[11px] text-zinc-700">
          {endpoint.lastChecked}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      mobileLabel: "Action",
      render: (endpoint) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Edit ${endpoint.name}`}
            onClick={() => openEditModal(endpoint)}
            disabled={isUpdating || isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            aria-label={`Delete ${endpoint.name}`}
            onClick={() => setDeleteEndpointId(endpoint.id)}
            disabled={isUpdating || isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const healthyCount = monitoringEndpoints.filter(
    (endpoint) => endpoint.status === "UP",
  ).length;

  const totalCount = monitoringEndpoints.length;

  const hasActiveFilters =
    search.trim().length > 0 ||
    method !== "All methods" ||
    status !== "All statuses";

  const resetFilters = () => {
    setSearch("");
    setMethod("All methods");
    setStatus("All statuses");
  };

  return (
    <div>
      <div>
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
            <Activity className="h-3.5 w-3.5" />

            <span>Monitoring</span>

            <span>/</span>

            <span>HTTP Monitoring</span>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                HTTP Monitoring
              </h1>

              <p className="mt-1 text-sm text-zinc-600">
                Monitor the availability and response time of your HTTP
                endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshEndpointData}
                disabled={!selectedProject || isLoading}
                className="flex h-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Refresh endpoints"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>

              <button
                type="button"
                className="
                                        flex h-9
                                        items-center gap-2
                                        rounded-lg
                                        border border-zinc-900
                                        bg-zinc-950
                                        px-3
                                        text-xs
                                        text-zinc-500
                                        transition-colors
                                        hover:border-zinc-800
                                        hover:text-zinc-300
                                    "
              >
                <Clock3 className="h-3.5 w-3.5" />
                Last 24 hours
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                disabled={!selectedProject}
                className="
                                        flex h-9
                                        items-center gap-2
                                        rounded-lg
                                        bg-zinc-100
                                        px-3
                                        text-xs
                                        font-medium
                                        text-black
                                        transition-colors
                                        hover:bg-white
                                    "
              >
                <Plus className="h-3.5 w-3.5" />
                Add endpoint
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Activity}
            label="Total endpoints"
            value={String(totalCount)}
            detail={`${healthyCount} healthy`}
          />

          <SummaryCard
            icon={Activity}
            label="Healthy endpoints"
            value={String(healthyCount)}
            detail={
              totalCount
                ? `${Math.round((healthyCount / totalCount) * 100)}% healthy`
                : "No endpoints"
            }
            positive={healthyCount > 0}
          />

          <SummaryCard
            icon={Gauge}
            label="Avg. response"
            value={
              monitoringEndpoints.some(
                (endpoint) => endpoint.responseTimeMs != null,
              )
                ? `${Math.round(
                    monitoringEndpoints
                      .filter((endpoint) => endpoint.responseTimeMs != null)
                      .reduce(
                        (sum, endpoint) => sum + (endpoint.responseTimeMs ?? 0),
                        0,
                      ) /
                      monitoringEndpoints.filter(
                        (endpoint) => endpoint.responseTimeMs != null,
                      ).length,
                  )} ms`
                : "—"
            }
            detail={
              isLoadingCheckResults
                ? "Loading checks"
                : monitoringEndpoints.some(
                      (endpoint) => endpoint.responseTimeMs != null,
                    )
                  ? "Based on latest checks"
                  : "Waiting for checks"
            }
          />
          <SummaryCard
            icon={Activity}
            label="Avg. uptime"
            value={averageUptime != null ? `${averageUptime.toFixed(2)}%` : "—"}
            detail={
              isLoadingCheckResults
                ? "Loading checks"
                : averageUptime != null
                  ? "Based on check history"
                  : "Waiting for check history"
            }
            positive={averageUptime != null && averageUptime >= 99}
          />
        </div>

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
          <div className="border-b border-zinc-900 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                <Search className="h-3.5 w-3.5 text-zinc-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-200">
                  HTTP endpoint explorer
                </h2>

                <p className="mt-1 text-xs text-zinc-700">
                  Search and filter your monitored HTTP endpoints.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search endpoints..."
                  className="
                                            h-10 w-full
                                            rounded-lg
                                            border border-zinc-900
                                            bg-black
                                            pl-9 pr-9
                                            text-xs text-zinc-300
                                            outline-none
                                            placeholder:text-zinc-800
                                            focus:border-zinc-700
                                        "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="
                                                absolute right-2
                                                top-1/2
                                                flex h-7 w-7
                                                -translate-y-1/2
                                                items-center
                                                justify-center
                                                rounded-md
                                                text-zinc-700
                                                hover:bg-zinc-900
                                                hover:text-zinc-400
                                            "
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(["All methods", "GET", "POST", "PUT", "DELETE"] as const).map(
                  (item) => (
                    <MetricFilter
                      key={item}
                      active={method === item}
                      onClick={() => setMethod(item)}
                    >
                      {item}
                    </MetricFilter>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className={`
                                        flex h-10 w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        transition-colors
                                        ${
                                          showFilters
                                            ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                            : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                        }
                                    `}
                aria-label="More filters"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-col gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-zinc-700">Status</span>

                  {["All statuses", "UP", "DOWN", "PENDING"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setStatus(item as "All statuses" | EndpointStatus)
                      }
                      className={`
                                                        rounded-md
                                                        px-2.5 py-1.5
                                                        text-[10px]
                                                        transition-colors
                                                        ${
                                                          status === item
                                                            ? "bg-zinc-800 text-zinc-300"
                                                            : "text-zinc-700 hover:bg-zinc-900 hover:text-zinc-500"
                                                        }
                                                    `}
                    >
                      {item}
                    </button>
                  ))}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="
                                                    rounded-md
                                                    px-2.5 py-1.5
                                                    text-[10px]
                                                    text-zinc-700
                                                    hover:bg-zinc-900
                                                    hover:text-zinc-400
                                                "
                    >
                      Clear
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-zinc-800">
                  {filteredEndpoints.length} matching endpoints
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
          <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Available HTTP endpoints
              </h2>

              <p className="mt-1 text-xs text-zinc-700">
                {filteredEndpoints.length}{" "}
                {filteredEndpoints.length === 1 ? "endpoint" : "endpoints"}{" "}
                matched
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
                Loading HTTP endpoints...
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/5">
                <Activity className="h-4 w-4 text-red-400" />
              </div>

              <h3 className="mt-4 text-sm font-medium text-zinc-400">
                Unable to load HTTP endpoints
              </h3>

              <p className="mt-1 max-w-sm text-xs text-zinc-700">{error}</p>
            </div>
          ) : filteredEndpoints.length > 0 ? (
            <ResponsiveDataTable
              data={filteredEndpoints}
              columns={endpointColumns}
              rowKey={(endpoint) => endpoint.id}
              onRowClick={(endpoint) => {
                router.push(`/dashboard/http-monitoring/${endpoint.id}`);
              }}
            />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <Search className="h-4 w-4 text-zinc-700" />
              </div>

              <h3 className="mt-4 text-sm font-medium text-zinc-400">
                {!selectedProject
                  ? "Select a project"
                  : "No HTTP endpoints found"}
              </h3>

              <p className="mt-1 text-xs text-zinc-700">
                {!selectedProject
                  ? "Select a project from the project switcher to view its HTTP endpoints."
                  : "Create an HTTP endpoint to start monitoring this project."}
              </p>

              {hasActiveFilters && selectedProject && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                                                mt-5
                                                rounded-lg
                                                border border-zinc-800
                                                bg-zinc-950
                                                px-3 py-2
                                                text-xs
                                                text-zinc-500
                                                transition-colors
                                                hover:bg-zinc-900
                                                hover:text-zinc-300
                                            "
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
          <div className="border-b border-zinc-900 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              Endpoint status
            </h2>

            <p className="mt-1 text-xs text-zinc-700">
              Current status of your monitored HTTP endpoints.
            </p>
          </div>

          <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
            <SourceCard
              icon={Server}
              name="Current project"
              metrics={`${totalCount} endpoints`}
              status={totalCount > 0 ? "Healthy" : "No endpoints"}
            />

            <SourceCard
              icon={Server}
              name="Healthy endpoints"
              metrics={`${healthyCount} endpoints`}
              status={
                healthyCount === totalCount && totalCount > 0
                  ? "Healthy"
                  : totalCount > 0
                    ? "Degraded"
                    : "No data"
              }
            />

            <SourceCard
              icon={Activity}
              name="Monitoring checks"
              metrics={
                isLoadingCheckResults
                  ? "Loading latest checks"
                  : `${
                      monitoringEndpoints.filter(
                        (endpoint) =>
                          endpoint.lastChecked !== "Not checked yet",
                      ).length
                    } latest checks loaded`
              }
              status={
                isLoadingCheckResults
                  ? "Checking"
                  : totalCount === 0
                    ? "No data"
                    : monitoringEndpoints.every(
                          (endpoint) => endpoint.status === "PENDING",
                        )
                      ? "Pending"
                      : monitoringEndpoints.every(
                            (endpoint) => endpoint.status === "UP",
                          )
                        ? "Healthy"
                        : "Degraded"
              }
            />
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <span>HTTP endpoints are loaded from the selected project.</span>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span>Monitoring ready</span>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {deleteEndpointId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting)
              setDeleteEndpointId(null);
          }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-900 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                Delete HTTP endpoint
              </h2>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                This endpoint and its configuration will be removed permanently.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setDeleteEndpointId(null)}
                disabled={isDeleting}
                className="rounded-lg border border-zinc-900 bg-black px-3.5 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEndpoint}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-red-400 disabled:opacity-50"
              >
                {isDeleting && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-200 border-t-white" />
                )}
                {isDeleting ? "Deleting..." : "Delete endpoint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/70
            px-4
            backdrop-blur-sm
        "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreateOpen(false);
            }
          }}
        >
          <div
            className="
                w-full max-w-lg
                overflow-hidden
                rounded-xl
                border border-zinc-800
                bg-zinc-950
                shadow-2xl
            "
          >
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">
                  {editingEndpointId
                    ? "Edit HTTP endpoint"
                    : "Add HTTP endpoint"}
                </h2>

                <p className="mt-1 text-xs text-zinc-700">
                  {editingEndpointId
                    ? "Update the configuration of this endpoint."
                    : "Configure an endpoint to monitor."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="
                        flex h-7 w-7
                        items-center justify-center
                        rounded-md
                        text-zinc-700
                        transition-colors
                        hover:bg-zinc-900
                        hover:text-zinc-400
                    "
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {formError && (
                <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  Endpoint name
                </label>

                <input
                  value={endpointName}
                  onChange={(event) => setEndpointName(event.target.value)}
                  placeholder="Production API"
                  maxLength={100}
                  className="
                            h-10 w-full
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            px-3
                            text-xs text-zinc-300
                            outline-none
                            placeholder:text-zinc-800
                            focus:border-zinc-700
                        "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  URL
                </label>

                <input
                  value={endpointUrl}
                  onChange={(event) => setEndpointUrl(event.target.value)}
                  placeholder="https://api.example.com/health"
                  type="url"
                  className="
                            h-10 w-full
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            px-3
                            font-mono
                            text-xs text-zinc-300
                            outline-none
                            placeholder:text-zinc-800
                            focus:border-zinc-700
                        "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  HTTP method
                </label>

                <select
                  value={endpointMethod}
                  onChange={(event) =>
                    setEndpointMethod(
                      event.target.value as typeof endpointMethod,
                    )
                  }
                  className="
                            h-10 w-full
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            px-3
                            text-xs text-zinc-300
                            outline-none
                            focus:border-zinc-700
                        "
                >
                  <option value="GET">GET</option>

                  <option value="POST">POST</option>

                  <option value="PUT">PUT</option>

                  <option value="PATCH">PATCH</option>

                  <option value="DELETE">DELETE</option>

                  <option value="HEAD">HEAD</option>

                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                    Expected status
                  </label>

                  <input
                    value={expectedStatusCode}
                    onChange={(event) =>
                      setExpectedStatusCode(event.target.value)
                    }
                    type="number"
                    min={100}
                    max={599}
                    step={1}
                    className="
                                h-10 w-full
                                rounded-lg
                                border border-zinc-900
                                bg-black
                                px-3
                                font-mono
                                text-xs text-zinc-300
                                outline-none
                                focus:border-zinc-700
                            "
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                    Interval (sec)
                  </label>

                  <input
                    value={intervalSeconds}
                    onChange={(event) => setIntervalSeconds(event.target.value)}
                    type="number"
                    min={1}
                    step={1}
                    className="
                                h-10 w-full
                                rounded-lg
                                border border-zinc-900
                                bg-black
                                px-3
                                font-mono
                                text-xs text-zinc-300
                                outline-none
                                focus:border-zinc-700
                            "
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                    Timeout (ms)
                  </label>

                  <input
                    value={timeoutMs}
                    onChange={(event) => setTimeoutMs(event.target.value)}
                    type="number"
                    min={1}
                    step={1}
                    className="
                                h-10 w-full
                                rounded-lg
                                border border-zinc-900
                                bg-black
                                px-3
                                font-mono
                                text-xs text-zinc-300
                                outline-none
                                focus:border-zinc-700
                            "
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-900 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setEditingEndpointId(null);
                  setFormError(null);
                }}
                disabled={isCreating || isUpdating}
                className="
                        rounded-lg
                        border border-zinc-900
                        bg-black
                        px-3.5 py-2
                        text-xs
                        text-zinc-500
                        transition-colors
                        hover:border-zinc-800
                        hover:text-zinc-300
                        disabled:opacity-40
                    "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  editingEndpointId
                    ? handleUpdateEndpoint
                    : handleCreateEndpoint
                }
                disabled={isCreating || isUpdating}
                className="
                        flex items-center gap-2
                        rounded-lg
                        bg-zinc-100
                        px-3.5 py-2
                        text-xs
                        font-medium
                        text-black
                        transition-colors
                        hover:bg-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
              >
                {(isCreating || isUpdating) && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-black" />
                )}

                {isUpdating
                  ? "Updating..."
                  : isCreating
                    ? "Creating..."
                    : editingEndpointId
                      ? "Update endpoint"
                      : "Create endpoint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatLastChecked(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4000);

    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="fixed right-4 top-4 z-[200] w-[min(360px,calc(100vw-2rem))]">
      <div
        className={`rounded-xl border bg-zinc-950 px-4 py-3 shadow-2xl ${
          type === "success" ? "border-emerald-500/20" : "border-red-500/20"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-300">
              {type === "success" ? "Success" : "Error"}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-700 transition-colors hover:text-zinc-400"
            aria-label="Close notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  positive,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
          <Icon className="h-4 w-4 text-zinc-700" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
        {value}
      </p>

      <div className="mt-1 flex items-center gap-1.5 text-[10px]">
        {positive && <TrendingUp className="h-3 w-3 text-emerald-500" />}

        <span className={positive ? "text-emerald-500" : "text-zinc-700"}>
          {detail}
        </span>
      </div>
    </div>
  );
}

function MetricChart({
  title,
  metric,
  value,
  change,
  data,
  positive,
}: {
  title: string;
  metric: string;
  value: string;
  change: string;
  data: number[];
  positive?: boolean;
}) {
  const max = data.length ? Math.max(...data) : 0;

  return (
    <section className="rounded-xl border border-zinc-900 bg-zinc-950">
      <div className="flex items-start justify-between border-b border-zinc-900 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{title}</p>

          <p className="mt-1 font-mono text-[10px] text-zinc-700">{metric}</p>
        </div>

        <button
          type="button"
          aria-label={`More options for ${title}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-zinc-100">
              {value}
            </p>

            <div
              className={`mt-1 flex items-center gap-1 text-[10px] ${
                positive ? "text-emerald-500" : "text-zinc-700"
              }`}
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}

              {change}
            </div>
          </div>

          <span className="text-[9px] uppercase tracking-wider text-zinc-800">
            Last 24h
          </span>
        </div>

        <div className="relative mt-6 h-48">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="border-t border-zinc-900" />
            ))}
          </div>

          {data.length > 0 ? (
            <div className="absolute inset-0 flex items-end gap-[3px]">
              {data.map((item, index) => (
                <div key={index} className="group flex h-full flex-1 items-end">
                  <div
                    className="
                                                w-full
                                                rounded-t-[2px]
                                                bg-zinc-800
                                                transition-colors
                                                group-hover:bg-zinc-600
                                            "
                    style={{
                      height: `${max ? (item / max) * 100 : 0}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-zinc-800">
                No historical data available
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
          <span>24h ago</span>
          <span>18h</span>
          <span>12h</span>
          <span>6h</span>
          <span>Now</span>
        </div>
      </div>
    </section>
  );
}

function EndpointMethodBadge({ method }: { method: EndpointMethod }) {
  const styles: Record<EndpointMethod, string> = {
    GET: "border-cyan-500/10 bg-cyan-500/5 text-cyan-500",
    POST: "border-amber-500/10 bg-amber-500/5 text-amber-500",
    PUT: "border-violet-500/10 bg-violet-500/5 text-violet-400",
    PATCH: "border-blue-500/10 bg-blue-500/5 text-blue-400",
    DELETE: "border-red-500/10 bg-red-500/5 text-red-400",
    HEAD: "border-sky-500/10 bg-sky-500/5 text-sky-400",
    OPTIONS: "border-fuchsia-500/10 bg-fuchsia-500/5 text-fuchsia-400",
  };

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium ${styles[method]}`}
    >
      {method}
    </span>
  );
}

function SourceCard({
  icon: Icon,
  name,
  metrics,
  status,
}: {
  icon: typeof Server;
  name: string;
  metrics: string;
  status: string;
}) {
  const isDegraded = status === "Degraded";

  return (
    <div className="bg-zinc-950 p-5 transition-colors hover:bg-zinc-900/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
            <Icon className="h-3.5 w-3.5 text-zinc-600" />
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400">{name}</p>

            <p className="mt-1 text-[10px] text-zinc-800">{metrics}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 text-[10px] ${
            isDegraded
              ? "text-red-500"
              : status === "Healthy"
                ? "text-emerald-600"
                : "text-zinc-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDegraded
                ? "bg-red-500"
                : status === "Healthy"
                  ? "bg-emerald-500"
                  : "bg-zinc-700"
            }`}
          />

          {status}
        </span>
      </div>
    </div>
  );
}

function MetricFilter({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 shrink-0 rounded-lg border px-3 text-xs transition-colors ${
        active
          ? "border-zinc-700 bg-zinc-900 text-zinc-200"
          : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}
