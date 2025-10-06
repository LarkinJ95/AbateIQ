
'use client';

import { Header } from '@/components/header';
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
import { useState, useMemo } from 'react';
import type { Project } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, deleteDoc, doc, query, where, addDoc, updateDoc } from 'firebase/firestore';

export default function ProjectsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const orgId = user?.orgId;

  const projectsQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(firestore, 'orgs', orgId, 'jobs'));
  }, [firestore, orgId]);
  const { data: projectsData, isLoading } = useCollection<Project>(projectsQuery);

  const projects = useMemo(() => {
    if (!projectsData) return [];
    return projectsData.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  }, [projectsData]);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!user || !orgId) {
        toast({ title: "Not authenticated", variant: 'destructive' });
        return;
    }
    const dataToSave = { ...projectData, orgId };
    
    try {
        if (projectData.id) {
            const projectRef = doc(firestore, 'orgs', orgId, 'jobs', projectData.id);
            await updateDoc(projectRef, dataToSave);
            toast({ title: 'Project Updated' });
        } else {
            await addDoc(collection(firestore, 'orgs', orgId, 'jobs'), dataToSave);
            toast({ title: 'Project Added' });
        }
    } catch (error) {
        console.error("Error saving project: ", error);
        toast({ title: 'Error saving project', variant: 'destructive' });
    }
  };


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

  const handleDelete = async (projectToDelete: Project) => {
    if (!firestore || !orgId) return;
    try {
        await deleteDoc(doc(firestore, 'orgs', orgId, 'jobs', projectToDelete.id));
        toast({
            title: 'Project Deleted',
            description: `${projectToDelete.clientName} has been deleted.`,
            variant: 'destructive',
        });
    } catch (error) {
        toast({
            title: 'Error Deleting Project',
            description: 'There was an error deleting the project.',
            variant: 'destructive',
        });
    }
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
                  {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Loading projects...
                        </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                           <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.clientName}
                           </Link>
                        </TableCell>
                        <TableCell>{project.id}</TableCell>
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
                    {!isLoading && projects.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No projects found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
