"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Search, Users, Loader2, Eye, MoreVertical, UserMinus, UserCheck } from "lucide-react"
import { usePatients, useUpdatePatient } from "@/lib/hooks"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PatientResponse } from "@/types"
import { CreatePatientDialog } from "@/components/create-patient-dialog"

function PatientRow({ patient, formatDate, calculateAge }: {
  patient: PatientResponse;
  formatDate: (d?: string) => string;
  calculateAge: (d?: string) => string;
}) {
  const updatePatient = useUpdatePatient(patient.id)

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault()
    updatePatient.mutate({ is_active: patient.is_active === false })
  }

  return (
    <TableRow key={patient.id} className={patient.is_active === false ? "opacity-50" : ""}>
      <TableCell className="font-medium">
        {`${patient.firstName} ${patient.lastName}`}
      </TableCell>
      <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
      <TableCell>{patient.gender || '-'}</TableCell>
      <TableCell className="text-muted-foreground">{patient.email || '-'}</TableCell>
      <TableCell>{patient.phone || '-'}</TableCell>
      <TableCell>{formatDate(patient.created_at)}</TableCell>
      <TableCell>
        <span className="text-muted-foreground">No analysis</span>
      </TableCell>
      <TableCell>
        <Badge variant={patient.is_active === false ? "secondary" : "default"} className={patient.is_active === false ? "" : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none"}>
          {patient.is_active === false ? 'Inactive' : 'Active'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/patients/${patient.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus} disabled={updatePatient.isPending}>
                {patient.is_active !== false ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" /> Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" /> Activate
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: patientsData, isLoading, error } = usePatients({ page: 1, page_size: 50 })

  const patients = patientsData?.data || []
  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No analysis"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(dateString))
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-'
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    return age.toString()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading patients...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6 p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load patients</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6 container mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and blood analysis history
          </p>
        </div>
        <CreatePatientDialog />
      </div>

      {/* Search and Stats */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        /* Patients Table */
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              Click on a patient to view their detailed records and analysis history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Analysis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    formatDate={formatDate}
                    calculateAge={calculateAge}
                  />
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredPatients.length > itemsPerPage && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
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
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No patients found" : "No patients yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchTerm
                ? `No patients match "${searchTerm}". Try adjusting your search.`
                : "Get started by adding your first patient to the system."
              }
            </p>
            {!searchTerm && (
              <CreatePatientDialog />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}