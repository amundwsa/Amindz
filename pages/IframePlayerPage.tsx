import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const IframePlayerPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [unmuted, setUnmuted] = useState(false);

    const { item, streamUrl, liveChannels, currentChannelIndex, logo } = location.state || {};

    const backButtonRef = useRef<HTMLButtonElement>(null);
    const unmuteButtonRef = useRef<HTMLButtonElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);

    // Redirect if state is missing
    React.useEffect(() => {
        if (!item || !streamUrl || !liveChannels) {
            navigate('/home', { replace: true });
        } else {
            // Reset unmute state when channel changes
            setUnmuted(false);
        }
    }, [item, streamUrl, liveChannels, navigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            
            const active = document.activeElement;
            const focusable = [backButtonRef.current, !unmuted ? unmuteButtonRef.current : null, nextButtonRef.current].filter(Boolean) as HTMLElement[];
            if (focusable.length === 0) return;
            
            const currentIndex = focusable.indexOf(active as HTMLElement);
            if (currentIndex === -1) return;

            if (e.key === 'ArrowRight') {
                const nextIndex = (currentIndex + 1) % focusable.length;
                focusable[nextIndex].focus();
            } else if (e.key === 'ArrowLeft') {
                const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
                focusable[prevIndex].focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [unmuted]);


    if (!item || !streamUrl || !liveChannels) {
        return null;
    }

    const handleNextChannel = () => {
        if (!liveChannels || typeof currentChannelIndex !== 'number') return;
        
        const nextIndex = (currentChannelIndex + 1) % liveChannels.length;
        const nextChannel = liveChannels[nextIndex];

        const nextState = {
            item: { id: nextChannel.id, name: nextChannel.name, title: nextChannel.name },
            streamUrl: nextChannel.streamUrl,
            liveChannels: liveChannels,
            currentChannelIndex: nextIndex,
            logo: nextChannel.logo,
        };

        if (nextChannel.playerType === 'iframe') {
            navigate('/iframe-player', { state: nextState, replace: true });
        } else {
            navigate('/player', { state: { ...nextState, type: 'movie' }, replace: true });
        }
    };

    const handleUnmute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUnmuted(true);
        setTimeout(() => nextButtonRef.current?.focus(), 50);
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'black',
            overflow: 'hidden'
        }}>
            <iframe
                key={streamUrl + (unmuted ? '_unmuted' : '_muted')}
                src={streamUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                allow="autoplay; fullscreen"
                allowFullScreen
            ></iframe>

            {/* Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <button 
                    ref={backButtonRef}
                    onClick={() => navigate(-1)} 
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white text-xl btn-press focusable"
                    aria-label="Go Back"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                  {logo && (
                    <img src={logo} alt={`${item.name} logo`} className="h-10 max-w-[120px] object-contain" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                    {!unmuted && (
                        <button
                            ref={unmuteButtonRef}
                            onClick={handleUnmute}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white text-xl btn-press focusable animate-pulse"
                            aria-label="Unmute Video"
                        >
                            <i className="fa-solid fa-volume-xmark"></i>
                        </button>
                    )}
                    <button
                        ref={nextButtonRef}
                        onClick={handleNextChannel}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white text-xl btn-press focusable"
                        aria-label="Next Channel"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IframePlayerPage;