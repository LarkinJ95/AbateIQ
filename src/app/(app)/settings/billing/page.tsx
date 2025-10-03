
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Activity, BarChart3, Bot, Calendar, CreditCard, DollarSign, CheckCircle } from 'lucide-react';

// Mock Data
const currentPlan = {
  name: 'Pro Plan',
  price: 99,
  nextBilling: 'August 3, 2024',
};

const usageStats = {
  projects: { current: 12, limit: 20, name: 'Active Projects' },
  reports: { current: 45, limit: 100, name: 'AI Reports / month' },
  samples: { current: 350, limit: 1000, name: 'Air Samples / month' },
};

const billingHistory = [
  { id: 'inv-001', date: 'July 3, 2024', amount: 99.00, status: 'Paid' },
  { id: 'inv-002', date: 'June 3, 2024', amount: 99.00, status: 'Paid' },
  { id: 'inv-003', date: 'May 3, 2024', amount: 99.00, status: 'Paid' },
];

const paymentMethod = {
  type: 'Visa',
  last4: '4242',
  expiry: '08/2026',
};

export default function BillingPage() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: 'Action Triggered',
      description: `You clicked on "${action}". This feature is not yet implemented.`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Billing & Subscription" />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <CreditCard />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  You are currently on the {currentPlan.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="text-2xl font-bold">${currentPlan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></h3>
                    <p className="text-sm text-muted-foreground">Next payment on {currentPlan.nextBilling}</p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button variant="outline" onClick={() => handleAction('Change Plan')}>Change Plan</Button>
                    <Button onClick={() => handleAction('Manage Subscription')}>Manage Subscription</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Activity />
                  Usage This Cycle
                </CardTitle>
                <CardDescription>
                  Your usage for the current billing period.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.values(usageStats).map((stat) => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <span className="text-sm text-muted-foreground">{stat.current} / {stat.limit}</span>
                    </div>
                    <Progress value={(stat.current / stat.limit) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Payment Method & History */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires {paymentMethod.expiry}</p>
                    </div>
                  </div>
                  <Button variant="link" size="sm" onClick={() => handleAction('Update Payment Method')}>Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                             <CheckCircle className="h-3 w-3 mr-1" />
                             {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleAction(`Download Invoice ${invoice.id}`)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
