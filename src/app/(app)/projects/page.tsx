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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { AddProjectDialog } from './add-project-dialog';

export default function ProjectsPage() {
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Clients & Projects" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            Manage Projects
          </h2>
          <AddProjectDialog />
        </div>
        <Card>
          <Accordion type="single" collapsible className="w-full">
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
                              {project.name}
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
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Delete</DropdownMenuItem>
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
