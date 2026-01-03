// This file now exports wrapper components that use the shared portal components

import PortalVideosList from "./shared/PortalVideosList";
import PortalVideoEditor from "./shared/PortalVideoEditor";
import PortalModelsList from "./shared/PortalModelsList";
import PortalModelEditor from "./shared/PortalModelEditor";
import PortalPodcastsList from "./shared/PortalPodcastsList";
import PortalPodcastEditor from "./shared/PortalPodcastEditor";
import PortalStreamsList from "./shared/PortalStreamsList";
import PortalStreamEditor from "./shared/PortalStreamEditor";
import PortalNewsletter from "./shared/PortalNewsletter";
import PortalNewsletterCompose from "./shared/PortalNewsletterCompose";
import PortalTeamManagement from "./shared/PortalTeamManagement";
import PortalBreakingNews from "./shared/PortalBreakingNews";
import PortalDailyBrief from "./shared/PortalDailyBrief";

// Admin pages
export const AdminVideosList = () => <PortalVideosList role="admin" baseUrl="/portal/admin" />;
export const AdminVideoEditor = () => <PortalVideoEditor role="admin" baseUrl="/portal/admin" />;
export const AdminModelsList = () => <PortalModelsList role="admin" baseUrl="/portal/admin" />;
export const AdminModelEditor = () => <PortalModelEditor role="admin" baseUrl="/portal/admin" />;
export const AdminBreakingNews = () => <PortalBreakingNews role="admin" baseUrl="/portal/admin" />;
export const AdminDailyBrief = () => <PortalDailyBrief role="admin" baseUrl="/portal/admin" />;
export const AdminPodcastsList = () => <PortalPodcastsList role="admin" baseUrl="/portal/admin" />;
export const AdminPodcastEditor = () => <PortalPodcastEditor role="admin" baseUrl="/portal/admin" />;
export const AdminStreamsList = () => <PortalStreamsList role="admin" baseUrl="/portal/admin" />;
export const AdminStreamEditor = () => <PortalStreamEditor role="admin" baseUrl="/portal/admin" />;
export const AdminNewsletter = () => <PortalNewsletter role="admin" baseUrl="/portal/admin" />;
export const AdminNewsletterCompose = () => <PortalNewsletterCompose role="admin" baseUrl="/portal/admin" />;
export const AdminTeam = () => <PortalTeamManagement />;

// Editor pages
export const EditorVideosList = () => <PortalVideosList role="editor" baseUrl="/portal/editor" />;
export const EditorVideoEditor = () => <PortalVideoEditor role="editor" baseUrl="/portal/editor" />;
export const EditorModelsList = () => <PortalModelsList role="editor" baseUrl="/portal/editor" />;
export const EditorModelEditor = () => <PortalModelEditor role="editor" baseUrl="/portal/editor" />;
export const EditorBreakingNews = () => <PortalBreakingNews role="editor" baseUrl="/portal/editor" />;
export const EditorDailyBrief = () => <PortalDailyBrief role="editor" baseUrl="/portal/editor" />;
export const EditorPodcastsList = () => <PortalPodcastsList role="editor" baseUrl="/portal/editor" />;
export const EditorPodcastEditor = () => <PortalPodcastEditor role="editor" baseUrl="/portal/editor" />;
export const EditorStreamsList = () => <PortalStreamsList role="editor" baseUrl="/portal/editor" />;
export const EditorStreamEditor = () => <PortalStreamEditor role="editor" baseUrl="/portal/editor" />;
export const EditorNewsletter = () => <PortalNewsletter role="editor" baseUrl="/portal/editor" />;
export const EditorNewsletterCompose = () => <PortalNewsletterCompose role="editor" baseUrl="/portal/editor" />;
