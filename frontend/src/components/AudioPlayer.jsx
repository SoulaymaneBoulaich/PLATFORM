import { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ src, isOwn }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 p-2 rounded-full min-w-[200px] ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white'}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden"
            />

            <button
                onClick={togglePlay}
                className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${isOwn ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-white dark:bg-slate-600 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-500 shadow-sm'}`}
            >
                {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            <div className="flex-1 flex flex-col justify-center min-w-[80px]">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isOwn ? 'bg-blue-300 accent-white' : 'bg-gray-300 dark:bg-slate-500 accent-primary-600'}`}
                />
            </div>

            <span className={`text-xs font-medium tabular-nums ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {formatTime(currentTime)}
            </span>
        </div>
    );
};

export default AudioPlayer;
