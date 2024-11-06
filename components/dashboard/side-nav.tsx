'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  Globe, 
  FileSearch, 
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Domains',
    icon: Globe,
    href: '/domains',
  },
  {
    label: 'Pages',
    icon: FileSearch,
    href: '/pages',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-[calc(100vh-4rem)] w-[200px] border-r">
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={pathname === route.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}