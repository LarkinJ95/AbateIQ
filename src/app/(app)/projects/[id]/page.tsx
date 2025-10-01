import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, clients, samples, tasks, personnel } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = projects.find(p => p.id === params.id);

  if (!project) {
    notFound();
  }

  const client = clients.find(c => c.id === project.clientId);
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectSamples = samples
    .filter(s => s.projectId === project.id)
    .map(sample => {
        const task = tasks.find(t => t.id === sample.taskId);
        const person = personnel.find(p => p.id === sample.personnelId);
        return {
            ...sample,
            taskName: task?.name || 'N/A',
            personnelName: person?.name || 'N/A',
            status: sample.result?.status || 'Pending',
        }
    });

  const getStatusVariant = (status: "Active" | "Completed" | "On Hold") => {
    switch (status) {
      case "Active":
        return "default";
      case "Completed":
        return "secondary";
      case "On Hold":
        return "outline";
      default:
        return "default";
    }
  };

  const getSampleStatusVariant = (status: string) => {
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


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={`Project: ${project.name}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Project Details</CardTitle>
            <CardDescription>
              Detailed information for project ID: {project.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                <p className="text-lg font-semibold">{project.name}</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Job Number</p>
                <p className="text-lg font-semibold">{project.jobNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg font-semibold">{client?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{project.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="text-lg font-semibold">{project.startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p className="text-lg font-semibold">{project.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectTasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell>{task.name}</TableCell>
                                <TableCell>{task.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Project Samples</CardTitle>
            </CardHeader>
            <CardContent>
               {projectSamples.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sample ID</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Personnel</TableHead>
                            <TableHead>Analyte</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projectSamples.map(sample => (
                             <TableRow key={sample.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/samples/${sample.id}`} className="hover:underline">
                                        {sample.id}
                                    </Link>
                                </TableCell>
                                <TableCell>{sample.taskName}</TableCell>
                                <TableCell>{sample.personnelName}</TableCell>
                                <TableCell>{sample.result?.analyte || 'N/A'}</TableCell>
                                <TableCell>
                                    {sample.result?.concentration !== undefined && sample.result.status !== 'Pending'
                                    ? `${sample.result.concentration} ${sample.result.units}`
                                    : 'Pending'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getSampleStatusVariant(sample.status)}>
                                    {sample.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
               ) : (
                <p className="text-sm text-muted-foreground">No samples have been logged for this project yet.</p>
               )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
