'use client';

interface FileInstructionsProps {
  domain: {
    verification_token: string;
  };
}

export function FileInstructions({ domain }: FileInstructionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Please ensure you&apos;ve uploaded the verification file to your domain&apos;s root directory:
      </p>
      <code className="block p-4 bg-muted rounded-lg">
        File: bing-indexnow-{domain.verification_token}.html
        <br />
        Content: {domain.verification_token}
      </code>
    </div>
  );
}