"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { calculateDistribution, getChartColors } from "@/lib/chart-utils"

export interface DistributionChartProps<T> {
    data: T[]
    title: string
    description?: string
    groupByKey: keyof T
    labelFormatter?: (value: string) => string
    height?: number
    showLabel?: boolean
}

export function DistributionChart<T>({
    data,
    title,
    description,
    groupByKey,
    labelFormatter = (v) => v,
    height = 250,
    showLabel = true,
}: DistributionChartProps<T>) {
    const chartData = React.useMemo(() => {
        const distribution = calculateDistribution(data, groupByKey)
        const colors = getChartColors(distribution.length)

        return distribution.map((item, index) => ({
            ...item,
            fill: colors[index],
            label: labelFormatter(item.name),
        }))
    }, [data, groupByKey, labelFormatter])

    const chartConfig = React.useMemo(() => {
        return chartData.reduce((config, item) => {
            config[item.name] = {
                label: item.label,
                color: item.fill,
            }
            return config
        }, {} as ChartConfig)
    }, [chartData])

    const total = React.useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0)
    }, [chartData])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square pb-0"
                    style={{ maxHeight: height }}
                >
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{chartConfig[name]?.label || name}:</span>
                                            <span className="font-bold">{value}</span>
                                            <span className="text-muted-foreground">
                                                ({((Number(value) / total) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            label={showLabel}
                            labelLine={showLabel}
                        />
                    </PieChart>
                </ChartContainer>
                {chartData.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-4">
                        {chartData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {item.label}: {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
