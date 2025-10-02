
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { personnelExposureData } from '@/lib/data';

const chartConfig = {
  asbestos: {
    label: 'Asbestos',
    color: 'hsl(var(--chart-1))',
  },
  silica: {
    label: 'Silica',
    color: 'hsl(var(--chart-2))',
  },
  'heavy-metals': {
    label: 'Heavy Metals',
    color: 'hsl(var(--chart-3))',
  },
};

export function OverviewChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={personnelExposureData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent
              indicator="dot"
              formatter={(value, name) => `${chartConfig[name as keyof typeof chartConfig]?.label}: ${value}% of Limit`}
              />}
          />
          <Bar
            dataKey="asbestos"
            fill="var(--color-asbestos)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="silica"
            fill="var(--color-silica)"
            radius={[4, 4, 0, 0]}
          />
           <Bar
            dataKey="heavy-metals"
            fill="var(--color-heavy-metals)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
