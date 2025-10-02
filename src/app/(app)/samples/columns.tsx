
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Sample } from "@/lib/types"

type SampleWithDetails = Sample & {
  projectName?: string;
  taskName?: string;
  personnelName?: string;
  status: string;
  analyte?: string;
  concentration?: number;
  units?: string;
};


const getStatusVariant = (status: string) => {
    switch (status) {
      case '>PEL':
      case '>EL':
        return 'destructive';
      case '≥AL':
        return 'secondary';
      case 'OK':
        return 'default';
      default:
        return 'outline';
    }
  };

export const columns: ColumnDef<SampleWithDetails>[] = [
  {
    accessorKey: "id",
    header: "Sample ID",
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "personnelName",
    header: "Personnel",
  },
    {
    accessorKey: "analyte",
    header: "Analyte",
  },
  {
    accessorKey: "concentration",
    header: "Result",
    cell: ({ row }) => {
      const sample = row.original
      const resultText = sample.concentration !== undefined && sample.result?.status !== 'Pending'
        ? `${sample.concentration} ${sample.units}`
        : 'Pending';
      return <span>{resultText}</span>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sample = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(sample.id)}
            >
              Copy sample ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View sample details</DropdownMenuItem>
            <DropdownMenuItem>Edit sample</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
