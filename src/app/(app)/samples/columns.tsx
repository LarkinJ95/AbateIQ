
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react"

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
import { AddSampleDialog } from "./add-sample-dialog"
import Link from "next/link"

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

export const columns = (options: { onEdit: (sample: Sample) => void; onDelete: (id: string) => void }): ColumnDef<SampleWithDetails>[] => [
  {
    accessorKey: "id",
    header: "Sample ID",
    cell: ({ row }) => (
      <Link href={`/samples/${row.original.id}`} className="hover:underline font-medium">
        {row.original.id}
      </Link>
    )
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
    cell: ({ row }) => {
      const sample = row.original;
      const personnelId = (sample as any).personnelId;
      if (!personnelId) return sample.personnelName;
      return (
        <Link href={`/personnel/${personnelId}`} className="hover:underline">
          {sample.personnelName}
        </Link>
      )
    }
  },
    {
    accessorKey: "analyte",
    header: "Analyte",
  },
  {
    accessorKey: "concentration",
    header: "Result",
    cell: ({ row }) => {
      const sample = row.original as any;
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
            <DropdownMenuItem asChild>
              <Link href={`/samples/${sample.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <AddSampleDialog onSave={options.onEdit} sample={sample}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
            </AddSampleDialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => options.onDelete(sample.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
