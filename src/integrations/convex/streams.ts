import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface LiveStream {
  _id: Id<"liveStreams">;
  title: string;
  description: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  scheduledAt: number;
  isLive: boolean;
  isPremium: boolean;
  viewersCount: number;
  streamKey?: string;
  playbackUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StreamMessage {
  _id: Id<"liveStreamMessages">;
  streamId: Id<"liveStreams">;
  userId?: Id<"users">;
  userName: string;
  message: string;
  createdAt: number;
}

export function useLiveStreams() {
  const streams = useQuery(api.liveStreams.getAll);
  return {
    data: streams,
    isLoading: streams === undefined,
  };
}

export function useLiveStream(id: Id<"liveStreams"> | undefined) {
  const stream = useQuery(api.liveStreams.getById, id ? { id } : "skip");
  return {
    data: stream,
    isLoading: stream === undefined,
  };
}

export function useCurrentlyLiveStreams() {
  const streams = useQuery(api.liveStreams.getLive);
  return {
    data: streams,
    isLoading: streams === undefined,
  };
}

export function useUpcomingStreams() {
  const streams = useQuery(api.liveStreams.getUpcoming);
  return {
    data: streams,
    isLoading: streams === undefined,
  };
}

export function useCreateStream() {
  const createMutation = useMutation(api.liveStreams.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateStream() {
  const updateMutation = useMutation(api.liveStreams.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteStream() {
  const deleteMutation = useMutation(api.liveStreams.remove);
  return {
    mutateAsync: (id: Id<"liveStreams">) => deleteMutation({ id }),
    isPending: false,
  };
}

export function useStreamMessages(streamId: Id<"liveStreams"> | undefined) {
  const messages = useQuery(
    api.liveStreams.getMessages,
    streamId ? { streamId } : "skip"
  );
  return {
    data: messages,
    isLoading: messages === undefined,
  };
}

export function useSendStreamMessage() {
  const sendMutation = useMutation(api.liveStreams.sendMessage);
  return {
    mutateAsync: sendMutation,
    isPending: false,
  };
}
