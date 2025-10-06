
'use client';

import { Header } from '@/components/header';
import { projects as initialProjects } from '@/lib/data';
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
import { Card, CardContent } from '@/components/ui/card';
import { AddProjectDialog } from './add-project-dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Project } from '@/lib/types';
import { DialogTrigger } from '@/components/ui/dialog';

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects.sort((a, b) => (a.jobNumber || '').localeCompare(b.jobNumber || '')));


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

  const handleSaveProject = (projectData: Omit<Project, 'id'> & { id?: string }) => {
    if (projectData.id) {
        // Edit existing project
        setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } as Project : p));
    } else {
        // Add new project
        const newProject: Project = {
            ...projectData,
            id: `proj-${Date.now()}`
        };
        setProjects(prev => [newProject, ...prev]);
    }
  };


  const handleDelete = (projectToDelete: Project) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
    toast({
      title: 'Project Deleted',
      description: `${projectToDelete.name} has been deleted.`,
      variant: 'destructive',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Projects" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            Manage Projects
          </h2>
          <AddProjectDialog project={null} onSave={handleSaveProject}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </AddProjectDialog>
        </div>
        <Card>
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Job Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                           <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.name}
                           </Link>
                        </TableCell>
                        <TableCell>{project.jobNumber}</TableCell>
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
                              <AddProjectDialog project={project} onSave={handleSaveProject}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                              </AddProjectDialog>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project)}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
