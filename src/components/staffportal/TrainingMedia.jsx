import { useState } from "react";
import { Video, Mic, Play, X, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const VIDEOS = [
  { title: "Eliminating Violence, Exploitation, Neglect and Abuse", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/620fcec69_NDISCodeofConductEliminatingviolenceexploitationneglectandabuse.mp4" },
  { title: "Individual Rights", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/d5e3ff78e_NDISCodeofConductIndividualrights.mp4" },
  { title: "Integrity, Honesty and Transparency", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/b35675a8a_NDISCodeofConductIntegrityhonestyandtransparency.mp4" },
  { title: "Privacy", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/b015533ed_NDISCodeofConductPrivacy.mp4" },
  { title: "Promptly Act on Concerns", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/d14748494_NDISCodeofConductPromptlyactonconcerns.mp4" },
  { title: "Safety and Competency", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/58b160823_NDISCodeofConductSafetyandcompetency.mp4" },
  { title: "Restrictive Practices", url: "https://media.base44.com/videos/public/69d54775d9a169daad84a133/b064a6df8_RestrictivePractices.mp4" },
];

const PODCASTS = [
  { title: "Training Podcasts Overview", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/432cec629_index.html" },
  { title: "Training Podcasts Library", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/8b9eea103_trainingpodcasts.html" },
];

const VIDEO_ACCENT = "bg-purple-500";
const VIDEO_ICON = "bg-purple-100 text-purple-600";
const VIDEO_BADGE = "bg-purple-100 text-purple-700";
const PODCAST_ACCENT = "bg-indigo-500";
const PODCAST_ICON = "bg-indigo-100 text-indigo-600";
const PODCAST_BADGE = "bg-indigo-100 text-indigo-700";

export default function TrainingMedia({ search }) {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [viewingPodcast, setViewingPodcast] = useState(null);

  const filteredVideos = VIDEOS.filter(v =>
    v.title.toLowerCase().includes((search || "").toLowerCase())
  );

  if (viewingPodcast) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setViewingPodcast(null)}
            className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition">
            ← Back to Podcasts
          </button>
          <div className="flex gap-2">
            <a href={viewingPodcast.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs gap-1">
                <ExternalLink size={12} /> Open in New Tab
              </Button>
            </a>
            <Button size="sm" variant="ghost" onClick={() => setViewingPodcast(null)} className="rounded-xl text-xs gap-1 px-2">
              <X size={14} />
            </Button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Mic size={14} className="text-primary" />
            <p className="text-sm font-bold truncate">{viewingPodcast.title}</p>
          </div>
          <iframe src={viewingPodcast.url} title={viewingPodcast.title} className="w-full" style={{ height: "80vh", border: "none" }} />
        </div>
      </div>
    );
  }

  if (playingVideo) {
    return (
      <div className="space-y-3">
        <button onClick={() => setPlayingVideo(null)}
          className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition">
          ← Back to Videos
        </button>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary px-4 py-2.5 border-b border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Video size={14} className="text-primary shrink-0" />
              <p className="text-sm font-bold truncate">{playingVideo.title}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPlayingVideo(null)} className="rounded-xl text-xs gap-1 px-2 shrink-0">
              <X size={14} />
            </Button>
          </div>
          <video controls className="w-full" style={{ maxHeight: "75vh", background: "#000" }}>
            <source src={playingVideo.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── VIDEOS ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-primary" />
          <h3 className="font-black text-base">Training Videos</h3>
          <span className="text-xs text-muted-foreground">({VIDEOS.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video, i) => (
            <button key={i} onClick={() => setPlayingVideo(video)}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col text-left">
              <div className={`h-1.5 ${VIDEO_ACCENT}`} />
              <div className="aspect-video bg-secondary relative flex items-center justify-center overflow-hidden">
                <video className="w-full h-full object-cover" muted>
                  <source src={video.url} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">
                    <Play size={20} className="text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1">
                <p className="font-bold text-sm leading-snug min-h-[2.5rem]">{video.title}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-2 inline-block ${VIDEO_BADGE}`}>
                  NDIS Code of Conduct
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── PODCASTS ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic size={16} className="text-primary" />
          <h3 className="font-black text-base">Training Podcasts</h3>
          <span className="text-xs text-muted-foreground">({PODCASTS.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PODCASTS.map((podcast, i) => (
            <button key={i} onClick={() => setViewingPodcast(podcast)}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col text-left">
              <div className={`h-1.5 ${PODCAST_ACCENT}`} />
              <div className="p-4 pb-2">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${PODCAST_ICON}`}>
                  <Mic size={20} />
                </div>
              </div>
              <div className="px-4 flex-1">
                <p className="font-bold text-sm leading-snug min-h-[2.5rem]">{podcast.title}</p>
              </div>
              <div className="p-4 pt-3 flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PODCAST_BADGE}`}>
                  Audio Learning
                </span>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  Open <BookOpen size={12} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}