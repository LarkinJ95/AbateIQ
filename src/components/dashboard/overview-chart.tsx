
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { averageResultsData } from '@/lib/data';

const chartConfig = {
  average: {
    label: 'Average',
    color: 'hsl(var(--chart-1))',
  },
};

export function OverviewChart() {
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
                return `${props.payload.analyte}: ${value} ${props.payload.units}`;
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
