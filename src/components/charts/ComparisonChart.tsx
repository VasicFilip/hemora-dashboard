"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { formatChartDate } from "@/lib/chart-utils"

export interface ComparisonChartProps {
    data: Array<{ date: string;[key: string]: any }>
    title: string
    description?: string
    dataKeys: Array<{ key: string; label: string; color: string }>
    height?: number
    allowToggle?: boolean
}

export function ComparisonChart({
    data,
    title,
    description,
    dataKeys,
    height = 250,
    allowToggle = false,
}: ComparisonChartProps) {
    const [activeChart, setActiveChart] = React.useState(dataKeys[0]?.key || "")

    const chartConfig = React.useMemo(() => {
        return dataKeys.reduce((config, { key, label, color }) => {
            config[key] = { label, color }
            return config
        }, {} as ChartConfig)
    }, [dataKeys])

    const totals = React.useMemo(() => {
        return dataKeys.reduce((acc, { key }) => {
            acc[key] = data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0)
            return acc
        }, {} as Record<string, number>)
    }, [data, dataKeys])

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {allowToggle && (
                    <div className="flex">
                        {dataKeys.map(({ key, label, color }) => (
                            <button
                                key={key}
                                data-active={activeChart === key}
                                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(key)}
                            >
                                <span className="text-xs text-muted-foreground">{label}</span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {totals[key].toLocaleString()}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height }}>
                    <BarChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
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
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    labelFormatter={(value) => formatChartDate(value, 'long')}
                                />
                            }
                        />
                        {allowToggle ? (
                            <Bar dataKey={activeChart} fill={chartConfig[activeChart]?.color} />
                        ) : (
                            dataKeys.map(({ key, color }) => (
                                <Bar key={key} dataKey={key} fill={color} />
                            ))
                        )}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
