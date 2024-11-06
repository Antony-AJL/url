'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Activity, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getDomain } from '@/lib/domains'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { Database } from '@/lib/supabase/types'
import { supabase } from '@/lib/supabase/client'

type Domain = Database['public']['Tables']['domains']['Row']
type HealthLog = Database['public']['Tables']['domain_health_logs']['Row']

export default function DomainHealthPage({ params }: { params: { domainId: string } }) {
  const [domain, setDomain] = useState<Domain | null>(null)
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [domainData, { data: logs }] = await Promise.all([
        getDomain(params.domainId),
        supabase
          .from('domain_health_logs')
          .select('*')
          .eq('domain_id', params.domainId)
          .order('created_at', { ascending: false })
          .limit(100)
      ])

      setDomain(domainData)
      setHealthLogs(logs || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading health data",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    if (!domain) return

    setChecking(true)
    try {
      const response = await fetch('/api/domains/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId: domain.id }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      await loadData()

      toast({
        title: data.health.isHealthy ? "Domain is healthy" : "Domain health check failed",
        description: data.health.isHealthy 
          ? `Response time: ${data.health.responseTime}ms`
          : data.health.error,
        variant: data.health.isHealthy ? "default" : "destructive"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Health check failed",
        description: error.message,
      })
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!domain) {
    return <div>Domain not found</div>
  }

  const chartData = healthLogs.map(log => ({
    time: new Date(log.created_at).toLocaleTimeString(),
    responseTime: log.response_time,
    status: log.status_code
  })).reverse()

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/domains/${domain.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Health Monitoring</h2>
        </div>
        <Button onClick={checkHealth} disabled={checking}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {checking ? 'Checking...' : 'Check Now'}
        </Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {domain.is_healthy ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-2xl font-bold">
                  {domain.is_healthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Check</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domain.last_health_check
                  ? new Date(domain.last_health_check).toLocaleString()
                  : 'Never'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Response Time History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="hsl(var(--primary))" 
                    name="Response Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {log.is_healthy ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        Status: {log.status_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{log.response_time}ms</p>
                    {log.error_message && (
                      <p className="text-sm text-red-500">{log.error_message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}