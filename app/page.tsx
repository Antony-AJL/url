'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe, Zap, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold">BingIndex</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Sign In
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Fast Bing Indexing for Your Websites
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Submit and monitor your website pages in Bing Search using the IndexNow API. Get your content indexed faster than ever.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-x-4"
              >
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div className="flex flex-col items-center space-y-4">
                <Globe className="h-12 w-12" />
                <h3 className="text-xl font-bold">Multiple Domains</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Monitor and manage multiple domains from a single dashboard
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Zap className="h-12 w-12" />
                <h3 className="text-xl font-bold">Instant Indexing</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Get your pages indexed quickly with Bing&apos;s IndexNow API
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <BarChart2 className="h-12 w-12" />
                <h3 className="text-xl font-bold">Detailed Analytics</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Track your indexing performance with comprehensive analytics
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 BingIndex. All rights reserved.
        </p>
      </footer>
    </div>
  )
}