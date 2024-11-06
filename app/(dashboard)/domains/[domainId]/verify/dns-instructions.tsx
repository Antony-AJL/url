'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DnsInstructionsProps {
  domain: {
    domain: string;
    verification_token: string;
  };
}

export function DnsInstructions({ domain }: DnsInstructionsProps) {
  const { toast } = useToast();
  const domainParts = domain.domain.split('.');
  const rootDomain = domainParts.slice(-2).join('.');
  const isSubdomain = domainParts.length > 2;
  const value = `bing-indexnow=${domain.verification_token}`;
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add the following TXT record to {isSubdomain ? `the root domain (${rootDomain})` : 'your domain'}:
      </p>
      <div className="grid gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Host/Name:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard('@', "Host/Name copied to clipboard")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <code className="block p-4 bg-muted rounded-lg">
            @
          </code>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Value/Content:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(value, "Value/Content copied to clipboard")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <code className="block p-4 bg-muted rounded-lg">
            {value}
          </code>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          Note: DNS changes can take up to 24-48 hours to propagate, but usually take effect within a few minutes.
          {isSubdomain && " For subdomains, add the TXT record to the root domain."}
        </p>
      </div>
    </div>
  );
}