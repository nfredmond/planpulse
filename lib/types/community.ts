// Shared types for community engagement features

export interface CommunityInput {
  id: string;
  input_type: string;
  category: string;
  title: string;
  content: string;
  sentiment: string;
  upvotes: number;
  photo_urls: string[];
  moderation_status: string;
  created_at: string;
  lat?: number;
  lng?: number;
}

export interface Engagement {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  base_map_style: string;
  moderation_enabled: boolean;
  public_url?: string;
}

