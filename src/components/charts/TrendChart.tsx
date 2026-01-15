"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { filterByDateRange, fillTimeSeriesGaps, formatChartDate } from "@/lib/chart-utils"

export interface TrendChartProps<T> {
    data: T[]
    title: string
    description?: string
    dataKeys: Array<{ key: string; label: string; color: string }>
    timeRanges?: Array<{ value: string; label: string; days: number }>
    defaultTimeRange?: string
    height?: number
    transformData?: (data: T[], days: number) => Array<{ date: string;[key: string]: any }>
}

const defaultTimeRanges = [
    { value: "7d", label: "Last 7 days", days: 7 },
    { value: "30d", label: "Last 30 days", days: 30 },
    { value: "90d", label: "Last 90 days", days: 90 },
]

export function TrendChart<T>({
    data,
    title,
    description,
    dataKeys,
    timeRanges = defaultTimeRanges,
    defaultTimeRange = "30d",
    height = 250,
    transformData,
}: TrendChartProps<T>) {
    const [timeRange, setTimeRange] = React.useState(defaultTimeRange)

    const selectedRange = timeRanges.find(r => r.value === timeRange) || timeRanges[0]

    const chartData = React.useMemo(() => {
        // Cast to any to assume the data strictly satisfies the utils requirements (has created_at)
        // or that transformData handles it.
        const filtered = filterByDateRange(data as any[], selectedRange.days)

        if (transformData) {
            return transformData(filtered as T[], selectedRange.days)
        }

        // Default transformation: count items per day
        const grouped = filtered.reduce((acc, item) => {
            const date = new Date(item.created_at).toISOString().split('T')[0]
            if (!acc[date]) {
                acc[date] = { date, count: 0 }
            }
            acc[date].count++
            return acc
        }, {} as Record<string, { date: string; count: number }>)

        const timeSeries = Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date))
        return fillTimeSeriesGaps(timeSeries as any[], selectedRange.days)
    }, [data, selectedRange.days, transformData])

    const chartConfig = React.useMemo(() => {
        return dataKeys.reduce((config, { key, label, color }) => {
            config[key] = { label, color }
            return config
        }, {} as ChartConfig)
    }, [dataKeys])

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select time range"
                    >
                        <SelectValue placeholder={selectedRange.label} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {timeRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} className="rounded-lg">
                                {range.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height }}>
                    <AreaChart data={chartData}>
                        <defs>
                            {dataKeys.map(({ key, color }) => (
                                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => formatChartDate(value, 'short')}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => formatChartDate(value, 'long')}
                                    indicator="dot"
                                />
                            }
                        />
                        {dataKeys.map(({ key }, index) => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`url(#fill${key})`}
                                stroke={dataKeys[index].color}
                                stackId={dataKeys.length > 1 ? "a" : undefined}
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
