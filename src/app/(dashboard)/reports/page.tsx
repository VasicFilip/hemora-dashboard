"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useReports } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  FileText,
  Search,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { t } = useTranslation()

  const { data: reportsData, isLoading, error } = useReports({ page_size: 100 })

  const reports = reportsData?.data || []

  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase()
    const patientName = report.patient
      ? `${report.patient.firstName} ${report.patient.lastName}`.toLowerCase()
      : ''
    const labName = (report.lab_test?.lab_name || '').toLowerCase()

    return patientName.includes(searchLower) || labName.includes(searchLower)
  })

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || 'unknown'

    if (statusLower.includes('complete') || statusLower === 'analyzed') {
      return <Badge variant="default">{t('reports.status_complete')}</Badge>
    }
    if (statusLower.includes('pending') || statusLower === 'analyzing') {
      return <Badge variant="secondary">{t('reports.status_processing')}</Badge>
    }
    if (statusLower.includes('failed') || statusLower.includes('error')) {
      return <Badge variant="destructive">{t('reports.status_failed')}</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {t('reports.description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Activity className="mr-2 h-4 w-4" />
            {t('reports.new_analysis')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.total_reports')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.all_time')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.this_month')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => {
                const reportDate = new Date(r.created_at)
                const now = new Date()
                return reportDate.getMonth() === now.getMonth() &&
                  reportDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.reports_generated')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.unique_patients')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(reports.map(r => r.patient_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.patients_analyzed')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('reports.all_reports')}</CardTitle>
              <CardDescription>
                {t('reports.complete_list')}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('reports.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('reports.error_title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('reports.error_description')}
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? t('reports.no_reports_found') : t('reports.no_reports_yet')}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? t('reports.adjust_search')
                  : t('reports.start_uploading')
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/upload">
                    <Activity className="mr-2 h-4 w-4" />
                    {t('reports.create_first')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.col_patient')}</TableHead>
                  <TableHead>{t('reports.col_lab')}</TableHead>
                  <TableHead>{t('reports.col_date')}</TableHead>
                  <TableHead>{t('reports.col_status')}</TableHead>
                  <TableHead>{t('reports.col_markers')}</TableHead>
                  <TableHead className="text-right">{t('reports.col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((report) => {
                  const patientName = report.patient
                    ? `${report.patient.firstName} ${report.patient.lastName}`
                    : t('reports.unknown_patient')

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/patients/${report.patient_id}`}
                          className="hover:underline"
                        >
                          {patientName}
                        </Link>
                      </TableCell>
                      <TableCell>{report.lab_test?.lab_name || report.source || 'N/A'}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.markers?.length || 0}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/results/${report.analysis_id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            {t('reports.view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && !error && filteredReports.length > itemsPerPage && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                {t('reports.showing', { from: startIndex + 1, to: Math.min(endIndex, filteredReports.length), total: filteredReports.length })}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
