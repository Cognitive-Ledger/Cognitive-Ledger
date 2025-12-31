import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Send, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us | Cognitive Ledger</title>
        <meta name="description" content="Get in touch with the Cognitive Ledger team. Send us story tips, feedback, or partnership inquiries." />
      </Helmet>

      <article className="container max-w-5xl py-12">
        <header className="mb-12 text-center">
          <h1 className="headline-hero text-headline mb-4">Contact Us</h1>
          <p className="text-xl text-body-text max-w-2xl mx-auto">
            Have a question, story tip, or feedback? We'd love to hear from you.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="headline-tertiary text-headline mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-headline">Email</h3>
                    <a href="mailto:hello@cognitiveledger.com" className="text-primary hover:underline">
                      hello@cognitiveledger.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-headline">Press Inquiries</h3>
                    <a href="mailto:press@cognitiveledger.com" className="text-primary hover:underline">
                      press@cognitiveledger.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-headline">Location</h3>
                    <p className="text-body-text">Remote-first, globally distributed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 p-6 rounded-lg border border-divider">
              <h3 className="font-serif font-semibold text-headline mb-3">Story Tips</h3>
              <p className="text-sm text-body-text">
                Have a scoop or lead on an AI story? Send tips to{" "}
                <a href="mailto:tips@cognitiveledger.com" className="text-primary hover:underline">
                  tips@cognitiveledger.com
                </a>
                . Confidentiality guaranteed.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-secondary/30 p-8 rounded-lg border border-divider">
              <h2 className="headline-tertiary text-headline mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="story-tip">Story Tip</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="press">Press Inquiry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
