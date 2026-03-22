"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatFileSize, getExpiryStatus, getInitials } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-[#C9C1B1]/30 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#C9C1B1]/30 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-[#C9C1B1]/30 rounded-xl animate-pulse" />
          <div className="h-64 bg-[#C9C1B1]/30 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2632]">Dashboard</h1>
          <p className="text-sm text-[#C9C1B1] mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/clients">
            <Users className="w-4 h-4" />
            View Clients
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={<Users className="w-6 h-6" />}
          description={`${stats.individualClients} individual · ${stats.companyClients} company`}
          accent
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatCard
          title="Uploaded This Month"
          value={stats.documentsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          description="New documents"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringDocuments}
          icon={<AlertCircle className="w-6 h-6" />}
          description="Within 30 days"
        />
      </div>

      {/* Recent data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Clients</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/clients">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#C9C1B1]/30">
              {stats.recentClients.length === 0 ? (
                <p className="text-sm text-[#C9C1B1] text-center py-8">
                  No clients yet
                </p>
              ) : (
                stats.recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#EEE9DF]/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#EEE9DF] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#2C3B4D]">
                        {getInitials(client.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B2632] truncate">
                        {client.name}
                      </p>
                      <p className="text-xs text-[#C9C1B1] truncate">
                        {client.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant={
                          client.type === "individual" ? "individual" : "company"
                        }
                      >
                        {client.type}
                      </Badge>
                      <p className="text-xs text-[#C9C1B1] mt-1">
                        {client._count?.documents ?? 0} docs
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/documents">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#C9C1B1]/30">
              {stats.recentUploads.length === 0 ? (
                <p className="text-sm text-[#C9C1B1] text-center py-8">
                  No documents yet
                </p>
              ) : (
                stats.recentUploads.map((doc) => {
                  const expiry = getExpiryStatus(doc.expiryDate);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#EEE9DF] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#2C3B4D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1B2632] truncate">
                          {doc.documentType}
                        </p>
                        <p className="text-xs text-[#C9C1B1] truncate">
                          {doc.client?.name} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        {expiry === "expired" && (
                          <Badge variant="danger">Expired</Badge>
                        )}
                        {expiry === "expiring-soon" && (
                          <Badge variant="warning">Expiring</Badge>
                        )}
                        {expiry === "valid" && doc.expiryDate && (
                          <Badge variant="success">Valid</Badge>
                        )}
                        <p className="text-xs text-[#C9C1B1]">
                          {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
