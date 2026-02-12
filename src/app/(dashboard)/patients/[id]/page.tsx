"use client"

import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { usePatient } from "@/lib/hooks"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  Activity,
  FileText,
  Download,
  Eye,
  Loader2
} from "lucide-react"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params

  return <PatientDetailPageClient patientId={id} />
}

function PatientDetailPageClient({ patientId }: { patientId: string }) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const { data: patient, isLoading, error } = usePatient(patientId)

  const { data: analysesData } = useQuery({
    queryKey: ['analyses', { patient_id: patientId }],
    queryFn: () => api.getAnalyses({ patient_id: patientId, page: 1, page_size: 100 }),
    enabled: !!patient,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !patient) {
    notFound()
  }

  const analyses = analysesData?.data || []

  // Pagination
  const totalPages = Math.ceil(analyses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAnalyses = analyses.slice(startIndex, endIndex)

  const fullName = `${patient.firstName} ${patient.lastName}`

  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(dateString))
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="text-muted-foreground">Patient Details & Analysis History</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Activity className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {/* Patient Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p className="text-lg font-semibold">
                {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} years` : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="text-lg font-semibold capitalize">{patient.gender || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
              <p className="text-lg font-semibold">{analyses.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Patient Since</p>
              <p className="text-lg font-semibold">{formatDate(patient.created_at)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patient.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.dateOfBirth && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Born {formatDate(patient.dateOfBirth)}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{patient.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Complete timeline of all blood analyses for this patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Markers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAnalyses.map((analysis) => (
                    <TableRow key={analysis.analysis_id}>
                      <TableCell>{formatDate(analysis.created_at)}</TableCell>
                      <TableCell>{analysis.lab_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          analysis.status === 'analyzed' ? 'default' :
                            analysis.status === 'failed' ? 'destructive' :
                              'secondary'
                        }>
                          {analysis.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{analysis.marker_count}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/results/${analysis.analysis_id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {analyses.length > itemsPerPage && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, analyses.length)} of {analyses.length} analyses
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
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-4">
                This patient hasn't had any blood analyses performed yet.
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Activity className="mr-2 h-4 w-4" />
                  Start First Analysis
                </Link>
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}