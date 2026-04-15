"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiUrl } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const scenarioTypes = [
  "success",
  "validation_error",
  "system_error",
  "slow_request",
  "teapot",
] as const;

const formSchema = z.object({
  type: z.enum(scenarioTypes),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ScenarioRun = {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  createdAt: string;
};

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "completed") return "default";
  if (status === "validation_error") return "secondary";
  if (status === "failed" || status === "error") return "destructive";
  if (status === "teapot") return "secondary";
  return "secondary";
}

function statusBadgeClass(status: string): string | undefined {
  if (status === "completed") return "bg-emerald-600 text-white hover:bg-emerald-600";
  if (status === "validation_error") return "bg-amber-500 text-black hover:bg-amber-500";
  return undefined;
}

export default function Home() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: "success", name: "" },
  });

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/health"));
      if (!res.ok) throw new Error("API unreachable");
      return res.json() as Promise<{ status: string; timestamp: string }>;
    },
    refetchInterval: 30_000,
  });

  const runsQuery = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/scenarios/runs"));
      if (!res.ok) throw new Error("Failed to load runs");
      return res.json() as Promise<ScenarioRun[]>;
    },
    refetchInterval: 15_000,
  });

  const runMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch(apiUrl("/api/scenarios/run"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          ...(data.name?.trim() ? { name: data.name.trim() } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 418) {
        return {
          teapot: true as const,
          message: String((body as { message?: string }).message ?? "I'm a teapot"),
          signal: (body as { signal?: number }).signal,
        };
      }
      if (!res.ok) {
        const msg =
          typeof body?.message === "string"
            ? body.message
            : Array.isArray(body?.message)
              ? body.message.join(", ")
              : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      return body as { id: string; status: string; duration: number };
    },
    onSuccess: (data) => {
      if ("teapot" in data) {
        toast.success(`${data.message} (signal=${data.signal ?? "?"})`);
      } else {
        toast.success(`Run ${data.id.slice(0, 8)}… completed`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
    onSettled: () => {
      void runsQuery.refetch();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Signal Lab
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>API</span>
            {healthQuery.isLoading ? (
              <Badge variant="secondary">…</Badge>
            ) : healthQuery.isError ? (
              <Badge variant="destructive">down</Badge>
            ) : (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                ok
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Run scenario</CardTitle>
            <CardDescription>
              Each type updates Prometheus metrics, Loki JSON logs, and Sentry on system_error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => runMutation.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="type">Scenario type</Label>
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarioTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.type && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Label (optional)</Label>
                <Input id="name" placeholder="e.g. demo-1" {...form.register("name")} />
              </div>
              <Button type="submit" disabled={runMutation.isPending}>
                {runMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  "Run scenario"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observability</CardTitle>
            <CardDescription>Live stack (compose).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="/grafana"
              target="_blank"
              rel="noreferrer"
            >
              Grafana — /grafana (proxied from this app)
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="http://localhost:9090"
              target="_blank"
              rel="noreferrer"
            >
              Prometheus — :9090
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="http://localhost:3100"
              target="_blank"
              rel="noreferrer"
            >
              Loki — :3100 (Explore from Grafana is easier)
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="http://localhost:3001/metrics"
              target="_blank"
              rel="noreferrer"
            >
              Raw metrics — /metrics
            </a>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noreferrer"
            >
              Swagger — /api/docs
            </a>
            <p className="text-muted-foreground text-xs">
              Set <code className="rounded bg-muted px-1">SENTRY_DSN</code> in the environment to
              capture <code className="rounded bg-muted px-1">system_error</code>.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Run history</CardTitle>
            <CardDescription>Last 20 runs from PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            {runsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : runsQuery.isError ? (
              <p className="text-sm text-destructive">Could not load history.</p>
            ) : runsQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            ) : (
              <ul className="space-y-2">
                {runsQuery.data?.map((run) => (
                  <li
                    key={run.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {run.id.slice(0, 12)}…
                      </span>
                      <Badge variant="outline">{run.type}</Badge>
                      <Badge
                        variant={statusBadgeVariant(run.status)}
                        className={statusBadgeClass(run.status)}
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {run.duration != null ? `${run.duration} ms · ` : ""}
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
