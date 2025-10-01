import { Header } from '@/components/header';
import { documents } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Documents" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload New Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="document">Select File</Label>
              <div className="flex gap-2">
                <Input id="document" type="file" />
                <Button>
                  <FileUp className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">
            Project Files
          </h2>
          <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="p-0 relative">
                  <Image
                    src={doc.thumbnailUrl}
                    alt={`Thumbnail for ${doc.name}`}
                    width={400}
                    height={300}
                    className="aspect-[4/3] object-cover"
                    data-ai-hint={doc.thumbnailHint}
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.type}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {doc.uploadDate}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
