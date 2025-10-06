
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import type { Sample, ExposureLimit } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';


const chartConfig = {
  average: {
    label: 'Average',
    color: 'hsl(var(--chart-1))',
  },
};

interface OverviewChartProps {
  samples: Sample[];
}

export function OverviewChart({ samples }: OverviewChartProps) {
  const { user } = useUser();
  const orgId = user?.orgId;
  const firestore = useFirestore();

  const limitsQuery = useMemoFirebase(() => orgId ? query(collection(firestore, 'orgs', orgId, 'exposureLimits')) : null, [firestore, orgId]);
  const { data: exposureLimits } = useCollection<ExposureLimit>(limitsQuery);

  const averageResultsData = useMemo(() => {
    if (!samples || samples.length === 0) {
      if (!exposureLimits) return [];
      // Find the first 4 exposure limits to show as example data
      return exposureLimits.slice(0, 4).map(limit => ({
        analyte: limit.analyte,
        average: 0,
        units: limit.units,
      }));
    }

    const resultsByAnalyte: { [key: string]: { total: number; count: number, units: string } } = {};

    samples.forEach(sample => {
      if (sample.result && sample.result.concentration !== null && sample.result.status !== 'Pending') {
        const analyte = sample.result.analyte;
        if (!resultsByAnalyte[analyte]) {
          resultsByAnalyte[analyte] = { total: 0, count: 0, units: sample.result.units || '' };
        }
        resultsByAnalyte[analyte].total += sample.result.concentration;
        resultsByAnalyte[analyte].count += 1;
      }
    });

    return Object.keys(resultsByAnalyte).map(analyte => ({
      analyte,
      average: resultsByAnalyte[analyte].total / resultsByAnalyte[analyte].count,
      units: resultsByAnalyte[analyte].units,
    }));
  }, [samples, exposureLimits]);

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={averageResultsData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="analyte"
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent
              indicator="dot"
              formatter={(value, name, props) => {
                const avg = typeof value === 'number' ? value.toFixed(3) : value;
                return `${props.payload.analyte}: ${avg} ${props.payload.units}`;
              }}
              />}
          />
          <Bar
            dataKey="average"
            fill="var(--color-average)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
