
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Company } from '@/lib/types';
import { Building, Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialCompanies: Company[] = [
    { id: 'comp-1', name: 'Bierlein Companies', contactName: 'John Larkin', contactEmail: 'jlarkin@bierlein.com', status: 'active', createdAt: '2024-01-01T10:00:00Z', weatherApiKey: '9567e2b1ebb94c4989c131321250610' },
    { id: 'comp-2', name: 'ACME Demolition', contactName: 'Jane Smith', contactEmail: 'jane@acme.com', status: 'active', createdAt: '2024-02-15T10:00:00Z' },
    { id: 'comp-3', name: 'Inactive Corp', contactName: 'Bob Johnson', contactEmail: 'bob@inactive.com', status: 'inactive', createdAt: '2024-03-20T10:00:00Z' },
];

export default function SuperAdminPage() {
    const [companies, setCompanies] = useState<Company[]>(initialCompanies);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const handleOpenModal = (company: Company | null = null) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    const handleSaveCompany = (formData: Omit<Company, 'id' | 'createdAt'>) => {
        if (editingCompany) {
            // Update
            const updatedCompany = { ...editingCompany, ...formData };
            setCompanies(companies.map(c => c.id === editingCompany.id ? updatedCompany : c));
            toast({ title: "Company Updated", description: `${updatedCompany.name} details have been saved.` });
        } else {
            // Create
            const newCompany: Company = {
                id: `comp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                ...formData
            };
            setCompanies([newCompany, ...companies]);
            toast({ title: "Company Added", description: `${newCompany.name} has been added.` });
        }
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const handleDeleteCompany = (companyId: string) => {
        setCompanies(companies.filter(c => c.id !== companyId));
        toast({ title: "Company Deleted", variant: 'destructive' });
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const getStatusVariant = (status: Company['status']) => {
        switch(status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'suspended': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title="Super Admin: Company Management" />
            <main className="flex-1 p-4 md:p-8 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline flex items-center gap-2"><Building /> Manage Companies</CardTitle>
                                <CardDescription>Add, edit, or remove companies from the platform.</CardDescription>
                            </div>
                            <Button onClick={() => handleOpenModal()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Company
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center py-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by company, contact..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCompanies.map(company => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">{company.name}</TableCell>
                                            <TableCell>
                                                <div>{company.contactName}</div>
                                                <div className="text-muted-foreground text-xs">{company.contactEmail}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={getStatusVariant(company.status)}>{company.status}</Badge></TableCell>
                                            <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onSelect={() => handleOpenModal(company)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete {company.name} and all associated data. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteCompany(company.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                            <DialogDescription>Fill out the details for the company below.</DialogDescription>
                        </DialogHeader>
                        <CompanyForm
                            company={editingCompany}
                            onSave={handleSaveCompany}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}


interface CompanyFormProps {
  company: Company | null;
  onSave: (formData: Omit<Company, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
    const [name, setName] = useState(company?.name || '');
    const [contactName, setContactName] = useState(company?.contactName || '');
    const [contactEmail, setContactEmail] = useState(company?.contactEmail || '');
    const [status, setStatus] = useState<Company['status']>(company?.status || 'active');
    const [weatherApiKey, setWeatherApiKey] = useState(company?.weatherApiKey || '');
    const [logoUrl, setLogoUrl] = useState(company?.logoUrl || '');
    const [primaryColor, setPrimaryColor] = useState(company?.primaryColor || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, contactName, contactEmail, status, weatherApiKey, logoUrl, primaryColor });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                 <Select value={status} onValueChange={(value) => setStatus(value as Company['status'])}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="weatherApiKey">Weather API Key</Label>
                <Input id="weatherApiKey" value={weatherApiKey} onChange={e => setWeatherApiKey(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
             <div>
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <Input id="primaryColor" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#00BFFF" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Company</Button>
            </div>
        </form>
    );
}
