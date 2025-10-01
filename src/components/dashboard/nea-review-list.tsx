import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NeaReview } from '@/lib/types';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NeaReviewListProps {
  reviews: NeaReview[];
}

export function NeaReviewList({ reviews }: NeaReviewListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">NEAs for Review</CardTitle>
        <CardDescription>
          These assessments require your attention soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="ml-4 flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {review.projectName} - {review.task}
                </p>
                <p className="text-sm text-muted-foreground">{review.analyte}</p>
              </div>
              <div className="ml-auto font-medium text-sm">Due in {review.dueDate}</div>
              <Button variant="outline" size="sm" className="ml-4">
                Review
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
