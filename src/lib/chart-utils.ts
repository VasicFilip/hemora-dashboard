import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export interface TimeSeriesData {
    date: string
    [key: string]: string | number
}

export interface DistributionData {
    name: string
    value: number
    fill?: string
}

/**
 * Transform API data to time series format for charts
 */
export function transformToTimeSeries<T extends { created_at: string }>(
    data: T[],
    valueKey: keyof T,
    dateKey: keyof T = 'created_at' as keyof T
): TimeSeriesData[] {
    const grouped = data.reduce((acc, item) => {
        const date = format(new Date(item[dateKey] as string), 'yyyy-MM-dd')
        if (!acc[date]) {
            acc[date] = { date, count: 0 }
        }
        acc[date].count++
        return acc
    }, {} as Record<string, { date: string; count: number }>)

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Aggregate data by time period (day, week, month)
 */
export function aggregateByPeriod<T extends { created_at: string }>(
    data: T[],
    period: 'day' | 'week' | 'month' = 'day'
): TimeSeriesData[] {
    const formatString = period === 'month' ? 'yyyy-MM' : period === 'week' ? 'yyyy-ww' : 'yyyy-MM-dd'

    const grouped = data.reduce((acc, item) => {
        const date = format(new Date(item.created_at), formatString)
        if (!acc[date]) {
            acc[date] = { date, count: 0 }
        }
        acc[date].count++
        return acc
    }, {} as Record<string, { date: string; count: number }>)

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { created_at: string }>(
    data: T[],
    days: number
): T[] {
    const cutoffDate = subDays(new Date(), days)
    return data.filter(item => new Date(item.created_at) >= cutoffDate)
}

/**
 * Calculate distribution percentages for pie charts
 */
export function calculateDistribution<T>(
    data: T[],
    groupByKey: keyof T
): DistributionData[] {
    const grouped = data.reduce((acc, item) => {
        const key = String(item[groupByKey])
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
    }))
}

/**
 * Generate chart colors from theme
 */
export function getChartColors(count: number): string[] {
    const colors = [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
    ]

    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

/**
 * Format date for chart display
 */
export function formatChartDate(dateString: string, formatType: 'short' | 'long' = 'short'): string {
    const date = new Date(dateString)

    if (formatType === 'long') {
        return format(date, 'MMM dd, yyyy')
    }

    return format(date, 'MMM dd')
}

/**
 * Generate empty time series data for a date range
 */
export function generateEmptyTimeSeries(days: number): TimeSeriesData[] {
    return Array.from({ length: days }, (_, i) => ({
        date: format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd'),
        count: 0,
    }))
}

/**
 * Merge actual data with empty time series to fill gaps
 */
export function fillTimeSeriesGaps(
    data: TimeSeriesData[],
    days: number
): TimeSeriesData[] {
    const empty = generateEmptyTimeSeries(days)
    const dataMap = new Map(data.map(d => [d.date, d]))

    return empty.map(item => dataMap.get(item.date) || item)
}
