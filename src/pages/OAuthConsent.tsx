import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// The Supabase JS OAuth namespace is in beta; type it locally so this file compiles.
type OAuthNamespace = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: any; error: { message: string } | null }>;
};

function getOAuth(): OAuthNamespace | null {
  const anyAuth = (supabase.auth as unknown) as { oauth?: OAuthNamespace };
  return anyAuth.oauth ?? null;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const oauth = getOAuth();
      if (!oauth) {
        setError(
          "This Supabase project does not have the OAuth 2.1 authorization server enabled. Enable it in the Supabase dashboard under Authentication → OAuth server, then try again.",
        );
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    const oauth = getOAuth();
    if (!oauth) return;
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect an app to Meal Magic</CardTitle>
          <CardDescription>
            Approve to let this app read and modify your meal plans and shopping list on your behalf.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && !details && (
            <p className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading authorization request…
            </p>
          )}
          {details && (
            <>
              <p className="text-sm">
                <strong>{details.client?.name ?? "An external app"}</strong> is requesting access to
                your Meal Magic account.
              </p>
              <div className="flex gap-2">
                <Button disabled={busy} onClick={() => decide(true)} className="flex-1">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Approve
                </Button>
                <Button
                  disabled={busy}
                  variant="outline"
                  onClick={() => decide(false)}
                  className="flex-1"
                >
                  Deny
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
