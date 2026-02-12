import { cn } from '@/lib/utils'
import Image from 'next/image'

interface HemoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function HemoraLogo({
  size = 'md',
  showText = true,
  className,
}: HemoraLogoProps) {
  const sizeMap = {
    sm: { width: 48, height: 48, text: 'text-lg' },
    md: { width: 64, height: 64, text: 'text-xl' },
    lg: { width: 96, height: 96, text: 'text-4xl' },
    xl: { width: 228, height: 228, text: 'text-6xl' },
  }

  const sizeConfig = sizeMap[size] || sizeMap.md

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Image
        src="/36638184-e29c-4762-86eb-0e6647f9dfe8.png"
        alt="Hemora Logo"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="rounded-full dark:invert"
        priority
      />
    </div>
  )
}
