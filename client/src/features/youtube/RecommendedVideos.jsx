import React, { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Play,
  Calendar,
  UserCheck,
  AlertCircle,
  Sparkles,
  Video,
} from 'lucide-react';
import { fetchRecommendedVideos } from '../../services/api';

const YouTubeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/**
 * Format ISO date string into readable date (e.g. "Aug 15, 2023")
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const RecommendedVideos = ({
  courseTopic = '',
  moduleTitle = '',
  lessonTitle = '',
  learningObjective = '',
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryUsed, setQueryUsed] = useState('');

  // Fetch videos for current lesson
  const loadVideos = useCallback(async () => {
    if (!lessonTitle && !courseTopic) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchRecommendedVideos({
        courseTopic,
        moduleTitle,
        lessonTitle,
        learningObjective,
      });

      if (res.success && Array.isArray(res.videos)) {
        setVideos(res.videos);
        setQueryUsed(res.query || lessonTitle);
      } else {
        throw new Error(res.message || 'No video recommendations found.');
      }
    } catch (err) {
      console.error('Error fetching YouTube recommendations:', err);
      setError(
        err.message || 'Unable to load recommended videos. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [courseTopic, moduleTitle, lessonTitle, learningObjective]);

  // Load videos on mount or when lesson changes
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <YouTubeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Recommended Educational Videos
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono">
                YouTube v3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated visual explanations and deep-dive walkthroughs for this lesson
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadVideos}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
          title="Refresh video recommendations"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="w-full aspect-video bg-slate-800/80" />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                  <div className="h-3 bg-slate-800/60 rounded w-2/3" />
                </div>
                <div className="h-3 bg-slate-800/40 rounded w-1/3 pt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-3">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Could Not Load Recommended Videos</span>
          </div>
          <p>{error}</p>
          <button
            onClick={loadVideos}
            className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-white font-semibold text-xs transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video, idx) => (
            <a
              key={video.videoId || idx}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-rose-500/40 rounded-xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/20"
            >
              {/* Thumbnail Container with Play Overlay */}
              <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* YouTube Play Icon Button */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-300">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                {/* YouTube Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center space-x-1 border border-white/10">
                  <YouTubeIcon className="w-3 h-3 text-rose-500" />
                  <span>YouTube</span>
                </div>
              </div>

              {/* Video Info Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>

                {/* Channel & Metadata Footer */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5 truncate max-w-[170px]" title={video.channelTitle}>
                    <UserCheck className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate font-medium text-slate-300">
                      {video.channelTitle}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {video.publishedAt && (
                      <span className="text-[10px] text-slate-500">
                        {formatDate(video.publishedAt)}
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-xs">
          No video recommendations available for this lesson. Click "Refresh Recommendations" to search again.
        </div>
      )}
    </div>
  );
};

export default RecommendedVideos;
