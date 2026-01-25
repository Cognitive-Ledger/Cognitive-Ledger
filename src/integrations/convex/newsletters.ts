import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface NewsletterSubscriber {
  _id: Id<"newsletterSubscribers">;
  email: string;
  isActive: boolean;
  confirmationToken?: string;
  confirmedAt?: number;
  subscribedAt: number;
  unsubscribedAt?: number;
}

export interface ScheduledNewsletter {
  _id: Id<"scheduledNewsletters">;
  subject: string;
  content: string;
  scheduledFor: number;
  status: string;
  sentAt?: number;
  sentCount: number;
  failedCount: number;
  createdAt: number;
  updatedAt: number;
}

// Subscriber hooks
export function useNewsletterSubscribers() {
  const subscribers = useQuery(api.newsletters.getAllSubscribers);
  return {
    data: subscribers,
    isLoading: subscribers === undefined,
  };
}

export function useActiveSubscribers() {
  const subscribers = useQuery(api.newsletters.getActiveSubscribers);
  return {
    data: subscribers,
    isLoading: subscribers === undefined,
  };
}

export function useSubscribe() {
  const subscribeMutation = useMutation(api.newsletters.subscribe);
  return {
    mutateAsync: subscribeMutation,
    isPending: false,
  };
}

export function useConfirmSubscription() {
  const confirmMutation = useMutation(api.newsletters.confirmSubscription);
  return {
    mutateAsync: confirmMutation,
    isPending: false,
  };
}

export function useUnsubscribe() {
  const unsubscribeMutation = useMutation(api.newsletters.unsubscribe);
  return {
    mutateAsync: unsubscribeMutation,
    isPending: false,
  };
}

export function useDeleteSubscriber() {
  const deleteMutation = useMutation(api.newsletters.removeSubscriber);
  return {
    mutateAsync: (id: Id<"newsletterSubscribers">) => deleteMutation({ id }),
    isPending: false,
  };
}

// Newsletter hooks
export function useScheduledNewsletters() {
  const newsletters = useQuery(api.newsletters.getAllNewsletters);
  return {
    data: newsletters,
    isLoading: newsletters === undefined,
  };
}

export function usePendingNewsletters() {
  const newsletters = useQuery(api.newsletters.getPendingNewsletters);
  return {
    data: newsletters,
    isLoading: newsletters === undefined,
  };
}

export function useCreateNewsletter() {
  const createMutation = useMutation(api.newsletters.createNewsletter);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateNewsletter() {
  const updateMutation = useMutation(api.newsletters.updateNewsletter);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteNewsletter() {
  const deleteMutation = useMutation(api.newsletters.removeNewsletter);
  return {
    mutateAsync: (id: Id<"scheduledNewsletters">) => deleteMutation({ id }),
    isPending: false,
  };
}
