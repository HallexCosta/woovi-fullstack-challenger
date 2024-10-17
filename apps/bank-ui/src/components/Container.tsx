import { cn } from '@/lib/utils'

export const Container = ({
  children,
  className
}: { className: string; children: React.ReactNode }) => {
  return (
    <div className={cn(`max-w-[640px] md:max-w-[1800px] mx-auto`, className)}>
      {children}
    </div>
  )
}
