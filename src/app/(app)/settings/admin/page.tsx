
'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Activity,
  UserPlus,
  Trash2,
  Edit,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Server,
  HardDrive,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  organization: string;
  jobTitle: string;
  lastLogin?: string;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalSurveys: number;
  totalAirSamples: number;
  databaseSize: string;
  systemUptime: string;
  lastBackup?: string;
}

const mockSystemStats: SystemStats = {
    totalUsers: 1,
    activeUsers: 1,
    totalSurveys: 4,
    totalAirSamples: 3,
    databaseSize: '2.3 MB',
    systemUptime: '99.9%',
    lastBackup: '2024-07-25 02:00 UTC'
};

const mockUsers: User[] = [
    {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Larkin',
        email: 'jlarkin@bierlein.com',
        role: 'admin',
        status: 'active',
        organization: 'Bierlein Companies',
        jobTitle: 'Software Engineer',
        lastLogin: '2024-07-25T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
    }
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const { toast } = useToast();

  const [systemStats] = useState<SystemStats>(mockSystemStats);
  const [users, setUsers] = useState<User[]>(mockUsers);


  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    jobTitle: "",
    role: "user" as 'admin' | 'manager' | 'user',
    status: "active" as 'active' | 'inactive' | 'pending'
  });

  const [editUserData, setEditUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    jobTitle: "",
    role: "user" as 'admin' | 'manager' | 'user',
    status: "active" as 'active' | 'inactive' | 'pending'
  });


  // Filtered users based on search
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditUserData({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      organization: user.organization,
      jobTitle: user.jobTitle,
      role: user.role,
      status: user.status
    });
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleSaveEditUser = () => {
    setUsers(prev => prev.map(u => u.id === editUserData.id ? { ...u, ...editUserData} : u));
    toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
    });
    setIsEditModalOpen(false);
  };

  const handleAddUser = () => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...newUserData
    }
    setUsers(prev => [newUser, ...prev]);
     toast({
        title: "User Added",
        description: "New user has been created successfully.",
      });
      setIsAddUserModalOpen(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        organization: "",
        jobTitle: "",
        role: "user",
        status: "active"
      });
  }
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
     toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
        variant: 'destructive'
      });
  }

  const handleExport = () => {
     toast({
        title: "Export Started",
        description: "System data export has been initiated. You will receive a download link via email.",
      });
  }


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header title="System Administration" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{systemStats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{systemStats?.activeUsers || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Surveys</p>
                <p className="text-2xl font-bold">{systemStats?.totalSurveys || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database Size</p>
                <p className="text-2xl font-bold">{systemStats?.databaseSize || "0 MB"}</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="super-admin">Super Admin</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                 <Button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    data-testid="button-add-user"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.organization}</div>
                            <div className="text-sm text-muted-foreground">{user.jobTitle}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.firstName} {user.lastName}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="super-admin">
            <Card>
                <CardHeader>
                    <CardTitle>Super Admin</CardTitle>
                    <CardDescription>Manage companies on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/settings/super-admin">
                        <Button>
                            <Building className="mr-2 h-4 w-4" /> Go to Company Management
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>System Uptime</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {systemStats?.systemUptime || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Connection</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Backup</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {systemStats?.lastBackup || "Never"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Storage Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Database Size</span>
                      <span>{systemStats?.databaseSize || "0 MB"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Uploaded Files</span>
                      <span>156 MB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure global system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">Allow New Registrations</Label>
                      <p className="text-sm text-muted-foreground">Enable or disable new user registration</p>
                    </div>
                    <Switch id="registration" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-verification">Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">New users must verify their email</p>
                    </div>
                    <Switch id="email-verification" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable access for maintenance</p>
                    </div>
                    <Switch id="maintenance" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="retention">Data Retention (days)</Label>
                    <Input id="retention" type="number" defaultValue="365" />
                  </div>
                   <div>
                        <Button onClick={handleExport} >
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                        </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={() => toast({ title: 'Configuration Saved!'})}>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with access to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-first-name">First Name</Label>
                <Input 
                  id="new-first-name"
                  value={newUserData.firstName}
                  onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                  placeholder="John"
                  data-testid="input-new-first-name"
                />
              </div>
              <div>
                <Label htmlFor="new-last-name">Last Name</Label>
                <Input 
                  id="new-last-name"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                  placeholder="Smith"
                  data-testid="input-new-last-name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input 
                id="new-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="john.smith@company.com"
                data-testid="input-new-email"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">Password</Label>
                <Input 
                  id="new-password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Enter password"
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={newUserData.confirmPassword}
                  onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            {newUserData.password && newUserData.confirmPassword && newUserData.password !== newUserData.confirmPassword && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}

            <div>
              <Label htmlFor="new-organization">Organization</Label>
              <Input 
                id="new-organization"
                value={newUserData.organization}
                onChange={(e) => setNewUserData({ ...newUserData, organization: e.target.value })}
                placeholder="Company Name"
                data-testid="input-new-organization"
              />
            </div>

            <div>
              <Label htmlFor="new-job-title">Job Title</Label>
              <Input 
                id="new-job-title"
                value={newUserData.jobTitle}
                onChange={(e) => setNewUserData({ ...newUserData, jobTitle: e.target.value })}
                placeholder="Environmental Consultant"
                data-testid="input-new-job-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData({ ...newUserData, role: value as any })}>
                  <SelectTrigger data-testid="select-new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-status">Status</Label>
                <Select value={newUserData.status} onValueChange={(value) => setNewUserData({ ...newUserData, status: value as any })}>
                  <SelectTrigger data-testid="select-new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddUserModalOpen(false)}
                data-testid="button-cancel-add-user"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || newUserData.password !== newUserData.confirmPassword}
                data-testid="button-create-user"
              >
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input 
                  id="edit-first-name"
                  value={editUserData.firstName}
                  onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
                  placeholder="John"
                  data-testid="input-edit-first-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input 
                  id="edit-last-name"
                  value={editUserData.lastName}
                  onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                  placeholder="Smith"
                  data-testid="input-edit-last-name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                placeholder="john.smith@company.com"
                data-testid="input-edit-email"
              />
            </div>

            <div>
              <Label htmlFor="edit-organization">Organization</Label>
              <Input 
                id="edit-organization"
                value={editUserData.organization}
                onChange={(e) => setEditUserData({ ...editUserData, organization: e.target.value })}
                placeholder="Company Name"
                data-testid="input-edit-organization"
              />
            </div>

            <div>
              <Label htmlFor="edit-job-title">Job Title</Label>
              <Input 
                id="edit-job-title"
                value={editUserData.jobTitle}
                onChange={(e) => setEditUserData({ ...editUserData, jobTitle: e.target.value })}
                placeholder="Environmental Consultant"
                data-testid="input-edit-job-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editUserData.role} onValueChange={(value) => setEditUserData({ ...editUserData, role: value as any })}>
                  <SelectTrigger data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editUserData.status} onValueChange={(value) => setEditUserData({ ...editUserData, status: value as any })}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                data-testid="button-cancel-edit-user"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEditUser}
                disabled={!editUserData.firstName || !editUserData.lastName || !editUserData.email}
                data-testid="button-update-user"
              >
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
