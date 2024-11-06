'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getDomain, verifyDomain as verifyDomainAPI } from '@/lib/domains';
import { DnsInstructions } from './dns-instructions';
import { FileInstructions } from './file-instructions';
import { useToast } from '@/components/ui/use-toast';

interface Domain {
  id: string;
  domain: string;
  verification_token: string;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_method: 'dns' | 'file';
}

export default function VerifyDomainClient({ domainId }: { domainId: string }) {
  const router = useRouter();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadDomain() {
      try {
        const domainData = await getDomain(domainId);
        setDomain(domainData);
        
        // If domain is already verified, redirect to dashboard
        if (domainData.verification_status === 'verified') {
          router.push('/dashboard');
        }
      } catch (err) {
        setError('Failed to load domain');
        console.error('Error loading domain:', err);
      }
    }
    loadDomain();
  }, [domainId, router]);

  const verifyDomain = async () => {
    if (!domain) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      const result = await verifyDomainAPI(domain.id);
      
      if (result.status === 'verified') {
        toast({
          title: 'Domain verified!',
          description: 'Your domain has been successfully verified.',
        });
        // Redirect to dashboard on success
        router.push('/dashboard');
      } else {
        setError(result.error || 'Verification failed. Please check your settings and try again.');
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.error || 'Please check your settings and try again.',
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Verification error",
        description: err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  if (!domain) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Verify Domain</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Domain Verification</CardTitle>
            <CardDescription>
              Verify ownership of {domain.domain}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Alert>
              {domain.verification_status === 'verified' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : domain.verification_status === 'failed' ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <AlertDescription>
                {domain.verification_status === 'verified'
                  ? 'Domain is verified'
                  : domain.verification_status === 'failed'
                  ? 'Verification failed'
                  : 'Verification pending'}
              </AlertDescription>
            </Alert>

            {domain.verification_method === 'dns' ? (
              <DnsInstructions domain={domain} />
            ) : (
              <FileInstructions domain={domain} />
            )}

            <div className="flex space-x-2">
              <Button
                onClick={verifyDomain}
                disabled={verifying}
                className="flex-1"
              >
                {verifying ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Domain'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}