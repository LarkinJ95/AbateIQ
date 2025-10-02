
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Square } from 'lucide-react';
import type { Survey, ChecklistTemplate, ChecklistItem, ChecklistResponse } from '@/lib/types';
import { checklistTemplates as allTemplates } from '@/lib/data';

interface SurveyChecklistProps {
  survey: Survey;
}

export function SurveyChecklist({ survey }: SurveyChecklistProps) {
  const { toast } = useToast();
  const [responses, setResponses] = useState<ChecklistResponse>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'pre-survey': true,
    'safety': true,
  });

  const relevantTemplates = allTemplates.filter(t => survey.checklistTemplates?.includes(t.category));

  const handleResponseChange = (itemId: string, value: string, isCompleted?: boolean) => {
    const completed = isCompleted !== undefined ? isCompleted : value.length > 0;
    setResponses(prev => ({
      ...prev,
      [itemId]: { response: value, isCompleted: completed }
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const getCompletionStats = () => {
    const totalItems = relevantTemplates.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const completedItems = Object.values(responses).filter(r => r.isCompleted).length;
    const requiredItems = relevantTemplates.reduce((sum, checklist) => 
      sum + checklist.items.filter(item => item.isRequired).length, 0
    );
    const completedRequired = relevantTemplates.reduce((sum, checklist) => 
      sum + checklist.items.filter(item => 
        item.isRequired && responses[item.id]?.isCompleted
      ).length, 0
    );

    return {
      totalItems,
      completedItems,
      requiredItems,
      completedRequired,
      overallProgress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      requiredProgress: requiredItems > 0 ? Math.round((completedRequired / requiredItems) * 100) : 0,
    };
  };

  const renderChecklistItem = (item: ChecklistItem) => {
    const response = responses[item.id];
    const isCompleted = response?.isCompleted || false;

    return (
      <div 
        key={item.id} 
        className={`p-3 border rounded-lg ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30' : 'bg-background'}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {item.itemType === 'checkbox' ? (
              <Checkbox
                checked={response?.response === 'true'}
                onCheckedChange={(checked) => handleResponseChange(item.id, checked ? 'true' : 'false', !!checked)}
              />
            ) : (
              <div className="w-4 h-4 rounded-sm border-2 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium`}>
                  {item.text}
                  {item.isRequired && <span className="text-destructive ml-1">*</span>}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
            </div>

            {item.itemType === 'text_input' && (
              <Input
                placeholder="Enter response..."
                value={response?.response || ''}
                onChange={(e) => handleResponseChange(item.id, e.target.value)}
                onBlur={(e) => handleResponseChange(item.id, e.target.value, e.target.value.length > 0)}
                className="text-sm"
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (relevantTemplates.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              <p>No checklist template assigned to this survey type.</p>
          </div>
      )
  }

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{stats.overallProgress}%</span>
            </div>
            <Progress value={stats.overallProgress} className="h-2" />
            
            {stats.requiredItems > 0 && (
            <>
                <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    Required Items
                </span>
                <span>{stats.completedRequired}/{stats.requiredItems}</span>
                </div>
                <Progress value={stats.requiredProgress} className="h-2" indicatorClassName="bg-orange-500" />
            </>
            )}
        </div>
        {relevantTemplates.map((checklist) => (
            <div key={checklist.id} className="space-y-3 border-t pt-4">
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(checklist.category)}
            >
                <div className="flex items-center gap-2">
                <h3 className="font-medium">{checklist.name}</h3>
                {checklist.isRequired && (
                    <Badge variant="outline">
                    Required
                    </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                    {checklist.items.filter(item => responses[item.id]?.isCompleted).length}/
                    {checklist.items.length}
                </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="text-xl">{expandedCategories[checklist.category] ? '−' : '+'}</span>
                </Button>
            </div>
            
            {checklist.description && (
                <p className="text-sm text-muted-foreground">{checklist.description}</p>
            )}

            {expandedCategories[checklist.category] && (
                <div className="space-y-2 pl-2 border-l-2 ml-2">
                {checklist.items.map(renderChecklistItem)}
                </div>
            )}
            </div>
        ))}
    </div>
  );
}
