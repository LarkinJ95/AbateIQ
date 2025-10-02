
'use client';

import { useState, useMemo } from "react";
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { surveys as initialSurveys, personnel as allPersonnel } from "@/lib/data";
import { Search, Plus, MapPin, Calendar, User, Edit, FileText, Filter, Download, Trash2, X, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { Survey } from "@/lib/types";
import Link from "next/link";
import Image from 'next/image';
import { AddEditSurveyDialog } from "./add-edit-survey-dialog";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Simulate loading

  const handleSaveSurvey = (surveyData: Omit<Survey, 'id' | 'sitePhotoUrl' | 'sitePhotoHint'> & { id?: string }) => {
    if (surveyData.id) {
        // Edit existing survey
        setSurveys(prev => prev.map(s => s.id === surveyData.id ? { ...s, ...surveyData } as Survey : s));
    } else {
        // Add new survey
        const newSurvey: Survey = {
            ...surveyData,
            id: `surv-${Date.now()}`,
        };
        setSurveys(prev => [newSurvey, ...prev]);
    }
  };


  const handleBulkAction = (action: 'download' | 'delete') => {
    if (selectedSurveys.length === 0) {
      toast({
        title: 'No Surveys Selected',
        description: `Please select surveys to ${action}.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedSurveys.length} surveys? This action cannot be undone.`)) {
        setSurveys(prev => prev.filter(s => !selectedSurveys.includes(s.id)));
        toast({
          title: 'Surveys Deleted',
          description: `Successfully deleted ${selectedSurveys.length} surveys.`,
        });
        setSelectedSurveys([]);
      }
    } else {
       toast({
        title: 'Reports Generated',
        description: `Successfully generated ${selectedSurveys.length} reports. (Simulated)`,
      });
      setSelectedSurveys([]);
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedSurveys(filteredSurveys.map(survey => survey.id));
    } else {
      setSelectedSurveys([]);
    }
  };

  const handleSelectSurvey = (surveyId: string, checked: boolean) => {
    if (checked) {
      setSelectedSurveys([...selectedSurveys, surveyId]);
    } else {
      setSelectedSurveys(selectedSurveys.filter(id => id !== surveyId));
    }
  };

  const filteredSurveys = useMemo(() => {
    let filtered = surveys.filter((survey) =>
      survey.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.inspector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.surveyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.jobNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }
 
    if (typeFilter !== "all") {
      filtered = filtered.filter(survey => survey.surveyType === typeFilter);
    }

    if (dateRange?.from) {
      filtered = filtered.filter(survey => new Date(survey.surveyDate) >= dateRange.from!);
    }
    if (dateRange?.to) {
      filtered = filtered.filter(survey => new Date(survey.surveyDate) <= dateRange.to!);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.siteName.localeCompare(b.siteName);
        case "name-desc":
          return b.siteName.localeCompare(a.siteName);
        case "date-asc":
          return new Date(a.surveyDate).getTime() - new Date(b.surveyDate).getTime();
        case "date-desc":
          return new Date(b.surveyDate).getTime() - new Date(a.surveyDate).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [surveys, searchQuery, statusFilter, typeFilter, dateRange, sortBy]);
  
  const getStatusVariant = (status: Survey['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'Completed': return 'default';
          case 'In Progress': return 'secondary';
          case 'On Hold': return 'destructive';
          default: return 'outline';
      }
  }


  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Header title="Surveys" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
       <Header title="Surveys" />
       <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-headline font-bold" data-testid="surveys-title">All Surveys</h1>
                <AddEditSurveyDialog onSave={handleSaveSurvey} survey={null}>
                    <Button data-testid="button-create-survey">
                        <Plus className="h-4 w-4 mr-2" />
                        New Survey
                    </Button>
                </AddEditSurveyDialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search surveys by site name, address, job number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-surveys"
                    />
                </div>
                </div>

                <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="button-toggle-filters"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                    <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="date-desc">Latest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                </Select>

                {selectedSurveys.length > 0 && (
                    <>
                    <Button
                        variant="outline"
                        onClick={() => handleBulkAction('download')}
                        data-testid="button-bulk-download"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download ({selectedSurveys.length})
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleBulkAction('delete')}
                        data-testid="button-bulk-delete"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedSurveys.length})
                    </Button>
                    </>
                )}
                </div>
            </div>

            {showFilters && (
                <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div>
                    <label className="text-sm font-medium mb-2 block">Survey Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger data-testid="select-type-filter">
                        <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Asbestos">Asbestos</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Cadmium">Cadmium</SelectItem>
                          <SelectItem value="Asbestos + Lead">Asbestos + Lead</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="button-date-range"
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange?.to ? (
                                `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                            ) : (
                                format(dateRange.from, "MMM dd, yyyy")
                            )
                            ) : (
                            "Pick a date range"
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={(range) => setDateRange(range)}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    </div>

                    <div className="flex items-end">
                    <Button
                        variant="outline"
                        onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setDateRange(undefined);
                        setSearchQuery("");
                        }}
                        data-testid="button-clear-filters"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                    </div>
                </div>
                </Card>
            )}

            {filteredSurveys.length === 0 ? (
                <Card>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateRange ? "No surveys found matching your filters." : "No surveys created yet."}
                    </p>
                    {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && !dateRange && (
                    <AddEditSurveyDialog onSave={handleSaveSurvey} survey={null}>
                        <Button 
                            className="mt-4"
                            data-testid="button-create-first-survey"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Survey
                        </Button>
                    </AddEditSurveyDialog>
                    )}
                </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                {filteredSurveys.length > 1 && (
                    <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                        checked={selectedSurveys.length > 0 && selectedSurveys.length === filteredSurveys.length ? true : selectedSurveys.length > 0 ? 'indeterminate' : false}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all"
                    />
                    <span className="text-sm text-muted-foreground">
                        {selectedSurveys.length > 0 ? `${selectedSurveys.length} of ${filteredSurveys.length} selected` : `Select all (${filteredSurveys.length} surveys)`}
                    </span>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSurveys.map((survey) => (
                    
                    <Card key={survey.id} className="hover:shadow-lg transition-shadow relative group/survey-card" data-testid={`card-survey-${survey.id}`}>
                        <div className="absolute top-3 left-3 z-10">
                            <Checkbox
                            checked={selectedSurveys.includes(survey.id)}
                            onCheckedChange={(checked) => handleSelectSurvey(survey.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`checkbox-select-${survey.id}`}
                            />
                        </div>
                        
                        <div className="p-4">
                          <Link href={`/surveys/${survey.id}`} className="block pl-8">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg truncate pr-2 font-headline">{survey.siteName}</CardTitle>
                              <Badge variant={getStatusVariant(survey.status)} data-testid={`status-${survey.status}`}>
                                {survey.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{survey.surveyType}</p>
                          </Link>

                          {survey.sitePhotoUrl && (
                            <Link href={`/surveys/${survey.id}`} className="block pl-8 mt-4">
                              <div className="aspect-video relative rounded-md overflow-hidden">
                                  <Image
                                      src={survey.sitePhotoUrl}
                                      alt={`Site photo for ${survey.siteName}`}
                                      fill
                                      className="object-cover"
                                      data-ai-hint={survey.sitePhotoHint}
                                  />
                              </div>
                             </Link>
                          )}
                          <CardContent className="pt-4 px-0 pb-0 space-y-2 pl-8">
                              {survey.address && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">{survey.address}</span>
                                </div>
                              )}
                              {survey.jobNumber && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">Job #{survey.jobNumber}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-muted-foreground">
                                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{survey.inspector}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>{new Date(survey.surveyDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-end pt-2">
                                <AddEditSurveyDialog onSave={handleSaveSurvey} survey={survey}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="h-8 w-8 p-0"
                                        data-testid={`button-edit-${survey.id}`}
                                        >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </AddEditSurveyDialog>
                              </div>
                          </CardContent>
                        </div>
                    </Card>
                   
                    ))}
                </div>
                </div>
            )}
        </main>
    </div>
  );
}
