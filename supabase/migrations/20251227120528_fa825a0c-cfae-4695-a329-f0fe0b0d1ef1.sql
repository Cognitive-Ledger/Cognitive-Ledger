-- Enable realtime for live_streams table
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;

-- Ensure full replica identity for complete row data
ALTER TABLE public.live_streams REPLICA IDENTITY FULL;