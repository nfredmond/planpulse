'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { toast } from 'sonner';
import { 
  MapPin, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  X, 
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Dynamic import for map
const PublicEngagementMap = dynamic(() => import('@/components/community/PublicEngagementMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface Engagement {
  id: string;
  name: string;
  description: string | null;
  status: string;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  allowed_input_types: string[];
  categories: string[];
  require_email: boolean;
}

interface CommunityInput {
  id: string;
  input_type: string;
  category: string;
  title: string;
  content: string;
  sentiment: string;
  upvotes: number;
  lat?: number;
  lng?: number;
  photo_urls?: string[];
}

const SENTIMENTS = [
  { id: 'positive', name: 'I like this', emoji: '👍', color: 'bg-emerald-500' },
  { id: 'negative', name: 'Concern', emoji: '⚠️', color: 'bg-red-500' },
  { id: 'suggestion', name: 'Suggestion', emoji: '💡', color: 'bg-blue-500' },
  { id: 'neutral', name: 'Comment', emoji: '💬', color: 'bg-slate-500' },
];

export default function PublicEngagementPage() {
  const params = useParams();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [inputs, setInputs] = useState<CommunityInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    sentiment: 'neutral',
    email: '',
    photo_urls: [] as string[],
  });

  // Session ID for upvoting (stored in localStorage)
  const [sessionId, setSessionId] = useState<string>('');
  const [upvotedInputs, setUpvotedInputs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('planpulse-session-id');
    if (!sid) {
      sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('planpulse-session-id', sid);
    }
    setSessionId(sid);

    // Load upvoted inputs
    const upvoted = localStorage.getItem(`planpulse-upvoted-${params.id}`);
    if (upvoted) {
      setUpvotedInputs(new Set(JSON.parse(upvoted)));
    }

    loadEngagement();
  }, [params.id]);

  const loadEngagement = async () => {
    try {
      const response = await fetch(`/api/engage/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEngagement(data.engagement);
        setInputs(data.inputs || []);
      } else {
        toast.error('Engagement not found');
      }
    } catch (err) {
      console.error('Error loading engagement:', err);
      toast.error('Failed to load engagement');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    if (engagement?.status !== 'active') return;
    setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
    setShowInputForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    
    try {
      // Convert to base64 for demo (in production, upload to Supabase Storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photo_urls: [...prev.photo_urls, base64]
        }));
        setUploadingPhoto(false);
        toast.success('Photo added');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (engagement?.require_email && !formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/engage/${params.id}/inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: selectedLocation ? 'pin' : 'comment',
          title: formData.title,
          content: formData.content,
          category: formData.category,
          sentiment: formData.sentiment,
          email: formData.email || null,
          photo_urls: formData.photo_urls,
          lat: selectedLocation?.lat,
          lng: selectedLocation?.lng,
          session_id: sessionId,
        }),
      });

      if (response.ok) {
        const newInput = await response.json();
        setInputs(prev => [newInput, ...prev]);
        setSubmitSuccess(true);
        
        // Reset form
        setTimeout(() => {
          setShowInputForm(false);
          setSelectedLocation(null);
          setSubmitSuccess(false);
          setFormData({
            title: '',
            content: '',
            category: '',
            sentiment: 'neutral',
            email: '',
            photo_urls: [],
          });
        }, 2000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      console.error('Error submitting input:', err);
      toast.error('Failed to submit your input. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (inputId: string) => {
    if (upvotedInputs.has(inputId)) {
      toast.info('You already upvoted this');
      return;
    }

    try {
      const response = await fetch(`/api/engage/${params.id}/inputs/${inputId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        setInputs(prev => prev.map(i => 
          i.id === inputId ? { ...i, upvotes: i.upvotes + 1 } : i
        ));
        
        const newUpvoted = new Set([...upvotedInputs, inputId]);
        setUpvotedInputs(newUpvoted);
        localStorage.setItem(`planpulse-upvoted-${params.id}`, JSON.stringify([...newUpvoted]));
        
        toast.success('Thanks for your vote!');
      }
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading engagement...</p>
        </div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Engagement Not Found</h1>
          <p className="text-slate-500">This engagement may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (engagement.status === 'closed') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800">{engagement.name}</h1>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Engagement Closed</h2>
            <p className="text-slate-500">
              This community engagement has ended. Thank you for your interest!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{engagement.name}</h1>
          {engagement.description && (
            <p className="text-sm text-slate-500 mt-1">{engagement.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            Open for input
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <PublicEngagementMap
            inputs={inputs}
            center={[engagement.center_lng, engagement.center_lat]}
            zoom={engagement.zoom_level}
            onMapClick={handleMapClick}
            selectedLocation={selectedLocation}
          />
          
          {/* Instruction overlay */}
          {!showInputForm && (
            <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-sm bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Share Your Input</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Click anywhere on the map to drop a pin and share your thoughts about that location.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - existing inputs */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-800">
              Community Input ({inputs.length})
            </h2>
          </div>
          <div className="divide-y">
            {inputs.map(input => (
              <div key={input.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    input.sentiment === 'positive' ? 'bg-emerald-100' :
                    input.sentiment === 'negative' ? 'bg-red-100' :
                    input.sentiment === 'suggestion' ? 'bg-blue-100' :
                    'bg-slate-100'
                  }`}>
                    <span className="text-sm">
                      {SENTIMENTS.find(s => s.id === input.sentiment)?.emoji || '💬'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{input.title}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{input.content}</p>
                    {input.photo_urls && input.photo_urls.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {input.photo_urls.slice(0, 2).map((url, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">{input.category}</span>
                      <button
                        onClick={() => handleUpvote(input.id)}
                        disabled={upvotedInputs.has(input.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          upvotedInputs.has(input.id)
                            ? 'text-emerald-500'
                            : 'text-slate-400 hover:text-emerald-500'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {input.upvotes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {inputs.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No input yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input form modal */}
      {showInputForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {submitSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h3>
                <p className="text-slate-500">Your input has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold text-slate-800">Share Your Input</h3>
                  <button
                    onClick={() => {
                      setShowInputForm(false);
                      setSelectedLocation(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Sentiment */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      How do you feel about this?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {SENTIMENTS.map(sentiment => (
                        <button
                          key={sentiment.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, sentiment: sentiment.id })}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.sentiment === sentiment.id
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{sentiment.emoji}</span>
                          <span className="text-xs text-slate-600">{sentiment.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    >
                      <option value="">Select a category</option>
                      {engagement.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of your input"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Details
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share more details about your input..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Add Photo (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.photo_urls.map((url, index) => (
                        <div key={index} className="relative w-20 h-20">
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {formData.photo_urls.length < 3 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6" />
                              <span className="text-xs mt-1">Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Email (if required) */}
                  {engagement.require_email && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Your email won&apos;t be displayed publicly
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Input
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

