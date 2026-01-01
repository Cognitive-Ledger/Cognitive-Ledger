-- Create live stream chat messages table
CREATE TABLE public.live_stream_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_stream_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can view stream messages"
ON public.live_stream_messages
FOR SELECT
USING (true);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
ON public.live_stream_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.live_stream_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_messages;

-- Add index for faster queries
CREATE INDEX idx_stream_messages_stream_id ON public.live_stream_messages(stream_id);
CREATE INDEX idx_stream_messages_created_at ON public.live_stream_messages(created_at DESC);