import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Eye, Users, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function NewsletterCompose() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: subscriberCount } = useQuery({
    queryKey: ["newsletter-subscriber-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .not("confirmed_at", "is", null);

      if (error) throw error;
      return count || 0;
    },
  });

  const sendNewsletter = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("newsletter-send", {
        body: { subject, content },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Newsletter sent to ${data.sent} subscribers!`);
      if (data.failed > 0) {
        toast.warning(`${data.failed} emails failed to send`);
      }
      setSubject("");
      setContent("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send newsletter");
    },
  });

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please fill in both subject and content");
      return;
    }
    sendNewsletter.mutate();
  };

  const previewHtml = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">The Intelligence Age</h1>
        <p style="color: #666; font-size: 14px;">Your weekly AI briefing</p>
      </div>
      <div style="margin-bottom: 30px;">
        ${content || '<p style="color: #999;">Your content will appear here...</p>'}
      </div>
      <div style="text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>You received this email because you subscribed to The Intelligence Age newsletter.</p>
        <p><a href="#" style="color: #888;">Unsubscribe</a></p>
      </div>
    </div>
  `;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="headline-secondary">Compose Newsletter</h1>
          <p className="text-muted-foreground mt-1">
            Send a newsletter to all active subscribers
          </p>
        </div>

        {/* Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-semibold">{subscriberCount ?? "..."}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {subscriberCount === 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No confirmed subscribers yet. Newsletters can only be sent to confirmed subscribers.
            </p>
          </div>
        )}

        {/* Compose Form */}
        <Tabs defaultValue="compose" className="space-y-4">
          <TabsList>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="e.g., This Week in AI: GPT-5 Announced"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                placeholder="Write your newsletter content here. You can use HTML for formatting..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a href=""&gt; for formatting
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSend}
                disabled={sendNewsletter.isPending || !subject.trim() || !content.trim() || subscriberCount === 0}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {sendNewsletter.isPending ? "Sending..." : `Send to ${subscriberCount} subscribers`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
                <CardDescription>
                  Subject: {subject || "(No subject)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-white text-black rounded-lg p-4 border"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
