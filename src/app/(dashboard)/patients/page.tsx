"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePatients, useDeactivatePatient, useActivatePatient } from "@/lib/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, UserCheck, UserX, Eye, Users } from "lucide-react"
import { CreatePatientDialog } from "@/components/create-patient-dialog"
import { useTranslation } from "@/lib/i18n-context"

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { t } = useTranslation()

  const { data: patientsData, isLoading, error } = usePatients({ page_size: 200 })
  const deactivatePatient = useDeactivatePatient()
  const activatePatient = useActivatePatient()

  const patients = patientsData?.data || []

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    const email = (patient.email || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '-'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('patients.title')}</h1>
          <p className="text-muted-foreground">{t('patients.description')}</p>
        </div>
        <CreatePatientDialog />
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('patients.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('patients.count', { filtered: filteredPatients.length, total: patients.length })}
        </p>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('patients.records_title')}</CardTitle>
          <CardDescription>{t('patients.records_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
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
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('patients.failed_load')}</h3>
              <p className="text-muted-foreground">{t('patients.try_again')}</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? t('patients.no_patients_found') : t('patients.no_patients_yet')}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm
                  ? t('patients.no_match', { term: searchTerm })
                  : t('patients.get_started')
                }
              </p>
              {!searchTerm && <CreatePatientDialog />}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('patients.col_name')}</TableHead>
                  <TableHead>{t('patients.col_age')}</TableHead>
                  <TableHead>{t('patients.col_gender')}</TableHead>
                  <TableHead>{t('patients.col_email')}</TableHead>
                  <TableHead>{t('patients.col_phone')}</TableHead>
                  <TableHead>{t('patients.col_created')}</TableHead>
                  <TableHead>{t('patients.col_last_analysis')}</TableHead>
                  <TableHead>{t('patients.col_status')}</TableHead>
                  <TableHead className="text-right">{t('patients.col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <Link href={`/patients/${patient.id}`} className="hover:underline">
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                    <TableCell>{patient.gender || '-'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{patient.email || '-'}</TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>{formatDate(patient.createdAt)}</TableCell>
                    <TableCell>
                      {patient.lastAnalysisDate
                        ? formatDate(patient.lastAnalysisDate)
                        : t('patients.no_analysis')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.isActive ? "default" : "secondary"}>
                        {patient.isActive ? t('patients.active') : t('patients.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/patients/${patient.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('patients.view_details')}
                            </Link>
                          </DropdownMenuItem>
                          {patient.isActive ? (
                            <DropdownMenuItem
                              onClick={() => deactivatePatient.mutate(patient.id)}
                              className="text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              {t('patients.deactivate')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => activatePatient.mutate(patient.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              {t('patients.activate')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!isLoading && !error && filteredPatients.length > itemsPerPage && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                {t('patients.showing', { from: startIndex + 1, to: Math.min(endIndex, filteredPatients.length), total: filteredPatients.length })}
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
