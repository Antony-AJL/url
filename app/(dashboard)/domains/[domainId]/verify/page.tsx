'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getDomain, verifyDomain } from '@/lib/domains';
import { DnsInstructions } from './dns-instructions';

export default function VerifyDomainPage({ params }: { params: { domainId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [domain, setDomain] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDomain() {
      try {
        const domainData = await getDomain(params.domainId);
        setDomain(domainData);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: 'Error loading domain',
          description: err.message,
          variant: 'destructive',
        });
      }
    }
    loadDomain();
  }, [params.domainId, toast]);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);

    try {
      const result = await verifyDomain(params.domainId);
      
      if (result.status === 'verified') {
        toast({
          title: 'Domain verified!',
          description: 'Your domain has been successfully verified.',
        });
        router.refresh();
      } else {
        setError(result.error || 'Verification failed');
        toast({
          title: 'Verification failed',
          description: result.error || 'Please check your DNS settings and try again.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Verification error',
        description: err.message,
        variant: 'destructive',
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
          <RefreshCw className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Verify Domain Ownership</h1>
            <p className="text-muted-foreground mt-2">
              Follow these steps to verify your ownership of {domain.domain}
            </p>
          </div>

          <DnsInstructions domain={domain} />

          <div className="space-y-4">
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              ) : domain.verification_status === 'verified' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : null}
              {verifying
                ? 'Verifying...'
                : domain.verification_status === 'verified'
                ? 'Verified'
                : 'Verify Domain'}
            </Button>

            {error && (
              <div className="flex items-center space-x-2 text-destructive">
                <XCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}