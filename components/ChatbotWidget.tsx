

import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { ChatBottleIcon, CloseIcon } from './icons/FeatureIcons';
import { useTranslation } from '../hooks/useTranslation';
import { useChat, Message } from '../hooks/useChat';
import { MicrophoneIcon, SendIcon } from './icons/VoiceIcons';
import { YouTubeVideo } from '../types';

const getSuggestionPrompts = (t: (key: string) => string) => [
    t('chatbot_suggestion_1'),
    t('chatbot_suggestion_2'),
    t('chatbot_suggestion_3'),
];

const YouTubePreview: React.FC<YouTubeVideo> = ({ title, videoId, thumbnailUrl }) => (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-brand-gray rounded-lg overflow-hidden transition-transform transform hover:scale-105 w-40 flex-shrink-0"
    >
      <img src={thumbnailUrl} alt={title} className="w-full h-20 object-cover" />
      <div className="p-2">
        <p className="text-xs font-semibold text-brand-text truncate">{title}</p>
      </div>
    </a>
);

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    sendMessage, 
    toggleListening 
  } = useChat(greetingMessage);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFormSubmit = (e: FormEvent) => {
      e.preventDefault();
      sendMessage(input);
  };
  
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
                     <div className="flex space-x-2 overflow-x-auto py-2 max-w-full">
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
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} chat-bubble`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl ${isUser ? 'bg-brand-green text-white rounded-br-lg' : 'bg-brand-gray text-brand-text rounded-bl-lg'}`}>
                <p className="text-sm break-words" dangerouslySetInnerHTML={{ __html: isUser ? message.text.replace(/\n/g, '<br />') : processBotText(message.text) }} />
            </div>
        </div>
    );
  };
  
  const TypingIndicator = () => (
    <div className="flex justify-start chat-bubble">
      <div className="px-4 py-2 rounded-xl bg-brand-gray text-brand-text rounded-bl-lg flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-4">
        {isOpen && (
            <div className="w-80 sm:w-96 h-[70vh] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-chat-window-pop-in">
                <div className="relative flex-shrink-0 p-4 bg-brand-green text-white rounded-t-2xl flex justify-between items-center overflow-hidden">
                    <div className="absolute -bottom-8 -left-4 text-white/10">
                        <ChatBottleIcon className="w-24 h-24 transform rotate-12" />
                    </div>
                    <div className="z-10">
                        <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
                        <p className="text-xs opacity-90">AI Sustainability Assistant</p>
                    </div>
                </div>

                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                    {isLoading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>

                <div className="flex-shrink-0 p-3 border-t border-gray-200">
                    {messages.length <= 1 && !isLoading && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {suggestionPrompts.map(prompt => (
                                <button key={prompt} onClick={() => sendMessage(prompt)} className="px-2 py-1 bg-brand-gray text-brand-text-light text-xs rounded-full hover:bg-gray-300 transition-colors">
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
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-light text-sm"
                        disabled={isLoading || isListening}
                        />
                         <button
                            type="button"
                            onClick={toggleListening}
                            disabled={isLoading}
                            className={`p-2 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                        >
                            <MicrophoneIcon className="h-5 w-5"/>
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-green text-white w-9 h-9 flex-shrink-0 rounded-full hover:bg-brand-green-dark disabled:bg-gray-400 transition-colors flex items-center justify-center">
                          <SendIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        )}

        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-16 h-16 bg-gradient-to-br from-brand-green to-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:from-teal-600 hover:to-brand-green-dark transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-brand-green-light animate-widget-slide-in relative" 
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
            <div className={`absolute transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
                <ChatBottleIcon className="w-9 h-9" />
            </div>
            <div className={`absolute transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
                <CloseIcon className="w-8 h-8" />
            </div>
        </button>
    </div>
  );
};

export default ChatbotWidget;