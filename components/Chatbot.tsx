

import React, { useEffect, useRef, FormEvent, useMemo } from 'react';
import ViewHeader from './common/ViewHeader';
import { ChatBottleIcon } from './icons/FeatureIcons';
import { useTranslation } from '../hooks/useTranslation';
import { useChat, Message } from '../hooks/useChat';
import { MicrophoneIcon, SendIcon, SpeakerOnIcon, SpeakerOffIcon } from './icons/VoiceIcons';
import { YouTubeVideo } from '../types';

const getSuggestionPrompts = (t: (key: string) => string) => [
    t('chatbot_suggestion_1'),
    t('chatbot_suggestion_2'),
    t('chatbot_suggestion_3'),
];

interface ChatbotProps {
  onBack: () => void;
}

const YouTubePreview: React.FC<YouTubeVideo> = ({ title, videoId, thumbnailUrl }) => (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-200 rounded-lg overflow-hidden transition-transform transform hover:scale-105 w-48 flex-shrink-0"
    >
      <img src={thumbnailUrl} alt={title} className="w-full h-24 object-cover" />
      <div className="p-2">
        <p className="text-xs font-semibold text-brand-text truncate">{title}</p>
      </div>
    </a>
);
  
const Chatbot: React.FC<ChatbotProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const suggestionPrompts = useMemo(() => getSuggestionPrompts(t), [t]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const greetingMessage = useMemo(() => t('chatbot_greeting'), [t]);

  const { 
    messages, 
    input, 
    setInput, 
    isLoading, 
    isListening, 
    isSpeaking,
    isMuted,
    toggleMute,
    speakMessage,
    stopSpeaking,
    sendMessage, 
    toggleListening 
  } = useChat(greetingMessage);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: FormEvent) => {
      e.preventDefault();
      sendMessage(input);
  }
  
  const ChatBubble: React.FC<{message: Message}> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    if (message.sender === 'bot' && message.text.startsWith('PLASTIVIZE_YOUTUBE_LIST[')) {
        try {
            const jsonString = message.text.substring('PLASTIVIZE_YOUTUBE_LIST['.length, message.text.length - 1);
            let parsedJson: any = JSON.parse(jsonString);
            
            // Ensure we're working with an array, as the model might return a single object
            const videos: any[] = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
            
            // Map to a consistent format, handling potential model errors ('videoold' vs 'videoId')
            const formattedVideos: YouTubeVideo[] = videos.map(v => ({
                title: v.title,
                thumbnailUrl: v.thumbnailUrl,
                videoId: v.videoId || v.videoold, 
            }));

            return (
                 <div className="flex justify-start chat-bubble w-full">
                     <div className="flex space-x-3 overflow-x-auto py-2 max-w-full">
                        {formattedVideos.map(video => video.videoId && <YouTubePreview key={video.videoId} {...video} />)}
                     </div>
                </div>
            );
        } catch (e) {
            console.error("Failed to parse YouTube JSON list", e);
        }
    }
    
    const processBotText = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
        const linkClass = 'text-brand-primary-dark font-bold underline hover:text-brand-primary';
        const withLinks = text.replace(linkRegex, `<a href="$2" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`);
        return withLinks.replace(/\n/g, '<br />');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} chat-bubble group`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl relative ${isUser ? 'bg-brand-green text-white rounded-br-lg' : 'bg-gray-200 text-brand-text rounded-bl-lg'}`}>
                <p className="text-sm break-words" dangerouslySetInnerHTML={{ __html: isUser ? message.text.replace(/\n/g, '<br />') : processBotText(message.text) }} />
                {!isUser && (
                    <div className="flex justify-end mt-1">
                        <button
                            type="button"
                            onClick={() => speakMessage(message.text)}
                            className="text-gray-400 hover:text-brand-green p-1 transition-colors rounded text-xs flex items-center space-x-1"
                            title="Listen to this message"
                            aria-label="Listen to message"
                        >
                            <SpeakerOnIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  };
  
  const TypingIndicator = () => (
    <div className="flex justify-start chat-bubble">
      <div className="px-4 py-2 rounded-2xl bg-gray-200 text-brand-text rounded-bl-lg flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <ViewHeader title={t('chatbot_title')} onBack={onBack} />
      <div className="flex flex-col flex-grow bg-white rounded-xl shadow-md max-h-[70vh] lg:max-h-[calc(100vh-240px)] overflow-hidden">
        <div className="relative flex-shrink-0 p-4 bg-brand-green text-white flex justify-between items-center overflow-hidden">
            <div className="absolute -bottom-8 -left-4 text-white/10">
                <ChatBottleIcon className="w-24 h-24 transform rotate-12" />
            </div>
            <div className="z-10">
                <h3 className="font-bold text-lg">AI Sustainability Assistant</h3>
                <p className="text-xs opacity-90">Powered by Gemini</p>
            </div>
            <div className="z-10">
                <button
                    type="button"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute Voice" : (isSpeaking ? "Mute Voice (Speaking)" : "Mute Voice")}
                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-white/30 animate-pulse text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    aria-label={isMuted ? "Unmute voice audio" : "Mute voice audio"}
                >
                    {isMuted ? <SpeakerOffIcon className="w-5 h-5" /> : <SpeakerOnIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200">
          {messages.length <= 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-3">
                  {suggestionPrompts.map(prompt => (
                      <button key={prompt} onClick={() => sendMessage(prompt)} className="px-3 py-1 bg-brand-gray text-brand-text-light text-xs rounded-full hover:bg-gray-300 transition-colors">
                          {prompt}
                      </button>
                  ))}
              </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : t('chatbot_placeholder')}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-light"
              disabled={isLoading || isListening}
            />
            <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
            >
                <MicrophoneIcon className="h-6 w-6"/>
            </button>
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-green text-white p-2 rounded-full hover:bg-brand-green-dark disabled:bg-gray-400 transition-colors">
                <SendIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;