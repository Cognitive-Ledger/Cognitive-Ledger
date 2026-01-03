import { PortalLayout } from "@/components/portal/PortalLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const PlaceholderPage = ({ title, role }: { title: string; role: "admin" | "editor" }) => (
  <PortalLayout requiredRole={role}>
    <Helmet><title>{title} | Portal</title></Helmet>
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Construction className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is being migrated to the portal.</p>
      </CardContent>
    </Card>
  </PortalLayout>
);

// Admin pages
export const AdminVideosList = () => <PlaceholderPage title="Videos" role="admin" />;
export const AdminVideoEditor = () => <PlaceholderPage title="Video Editor" role="admin" />;
export const AdminModelsList = () => <PlaceholderPage title="AI Models" role="admin" />;
export const AdminModelEditor = () => <PlaceholderPage title="Model Editor" role="admin" />;
export const AdminBreakingNews = () => <PlaceholderPage title="Breaking News" role="admin" />;
export const AdminDailyBrief = () => <PlaceholderPage title="Daily Brief" role="admin" />;
export const AdminPodcastsList = () => <PlaceholderPage title="Podcasts" role="admin" />;
export const AdminPodcastEditor = () => <PlaceholderPage title="Podcast Editor" role="admin" />;
export const AdminStreamsList = () => <PlaceholderPage title="Live Streams" role="admin" />;
export const AdminStreamEditor = () => <PlaceholderPage title="Stream Editor" role="admin" />;
export const AdminNewsletter = () => <PlaceholderPage title="Newsletter" role="admin" />;
export const AdminNewsletterCompose = () => <PlaceholderPage title="Compose Newsletter" role="admin" />;
export const AdminTeam = () => <PlaceholderPage title="Team Management" role="admin" />;

// Editor pages
export const EditorVideosList = () => <PlaceholderPage title="Videos" role="editor" />;
export const EditorVideoEditor = () => <PlaceholderPage title="Video Editor" role="editor" />;
export const EditorModelsList = () => <PlaceholderPage title="AI Models" role="editor" />;
export const EditorModelEditor = () => <PlaceholderPage title="Model Editor" role="editor" />;
export const EditorBreakingNews = () => <PlaceholderPage title="Breaking News" role="editor" />;
export const EditorDailyBrief = () => <PlaceholderPage title="Daily Brief" role="editor" />;
export const EditorPodcastsList = () => <PlaceholderPage title="Podcasts" role="editor" />;
export const EditorPodcastEditor = () => <PlaceholderPage title="Podcast Editor" role="editor" />;
export const EditorStreamsList = () => <PlaceholderPage title="Live Streams" role="editor" />;
export const EditorStreamEditor = () => <PlaceholderPage title="Stream Editor" role="editor" />;
export const EditorNewsletter = () => <PlaceholderPage title="Newsletter" role="editor" />;
export const EditorNewsletterCompose = () => <PlaceholderPage title="Compose Newsletter" role="editor" />;
