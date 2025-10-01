
'use client';

import { Header } from '@/components/header';
import { clients, projects } from '@/lib/data';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, PlusCircle, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { AddProjectDialog } from './add-project-dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsPage() {
  const { toast } = useToast();
  const getStatusVariant = (status: 'Active' | 'Completed' | 'On Hold') => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleDelete = (projectName: string) => {
    toast({
      title: 'Project Deleted',
      description: `${projectName} has been deleted.`,
      variant: 'destructive',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Clients & Projects" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            Manage Projects
          </h2>
          <AddProjectDialog project={null}>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
            </Button>
          </AddProjectDialog>
        </div>
        <Card>
          <Accordion type="single" collapsible className="w-full" defaultValue='client-1'>
            {clients.map((client) => (
              <AccordionItem value={`client-${client.id}`} key={client.id}>
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center gap-4">
                    <Image
                      src={client.logoUrl}
                      alt={`${client.name} logo`}
                      width={40}
                      height={40}
                      className="rounded-full"
                      data-ai-hint={client.logoHint}
                    />
                    <span className="text-lg font-medium">{client.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects
                        .filter((p) => p.clientId === client.id)
                        .map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">
                               <Link href={`/projects/${project.id}`} className="hover:underline">
                                {project.name}
                               </Link>
                            </TableCell>
                            <TableCell>{project.location}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(project.status)}>
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/projects/${project.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <AddProjectDialog project={project}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                  </AddProjectDialog>
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.name)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </main>
    </div>
  );
}
