import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";
import { useLanguage, LanguageCode } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getRecyclingRules } from '../services/geminiService';
import { searchYouTube } from '../services/youtubeService';
import { useToast } from '../contexts/ToastContext';
import { View, YouTubeVideo } from '../types';

// Add type definitions for the Web Speech API, which is not standard and may not be in default TS types.
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
    item(index: number): SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous?: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onstart: () => void;
    onend: () => void;
    start(): void;
    stop(): void;
}
declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
};
// FIX: Augment the global Window interface to include SpeechRecognition APIs. This is necessary because this file is a module, and interface declarations are locally scoped by default.
declare global {
  interface Window {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const navigateToDeclaration: FunctionDeclaration = {
  name: 'navigateTo',
  description: 'Navigates to a specific view within the application. Use this whenever the user wants to go to a page like "scanner", "dashboard", "calculator", "home", "community", "globe", "profile", "about", "contact", "guide", "marketplace", or "database".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      view: {
        type: Type.STRING,
        description: 'The name of the view to navigate to.',
        enum: ['home', 'scanner', 'dashboard', 'calculator', 'chatbot', 'community', 'globe', 'profile', 'about', 'contact', 'guide', 'marketplace', 'database']
      },
    },
    required: ['view'],
  },
};

const getRecyclingRulesDeclaration: FunctionDeclaration = {
  name: 'getRecyclingRules',
  description: 'Fetches local recycling rules for a specific plastic type and location. Use this if the user asks about recycling rules for a specific item in a specific place.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      plasticType: {
        type: Type.STRING,
        description: 'The type of plastic, e.g., PET, HDPE.',
      },
      location: {
        type: Type.STRING,
        description: 'The city or region, e.g., "London, UK".',
      },
    },
    required: ['plasticType', 'location'],
  },
};

const searchYouTubeDeclaration: FunctionDeclaration = {
  name: 'searchYouTube',
  description: 'Searches YouTube for a DIY or craft video for reusing a specific item. Use this when the user asks for a video tutorial on how to reuse something.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The item to search for, e.g., "plastic bottle", "old t-shirt".',
      },
    },
    required: ['query'],
  },
};


const tools = [{ functionDeclarations: [navigateToDeclaration, getRecyclingRulesDeclaration, searchYouTubeDeclaration] }];

const langToBcp47: Record<LanguageCode, string> = {
    en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', bn: 'bn-IN',
    mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', or: 'or-IN',
    pa: 'pa-IN', as: 'as-IN',
};

export const useChat = (greetingMessage: string) => {
    const { language } = useLanguage();
    const { navigateTo } = useNavigation();
    const { addToast } = useToast();

    const [messages, setMessages] = useState<Message[]>([{ sender: 'bot', text: greetingMessage }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!('speechSynthesis' in window)) return;

        const getAndSetVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };
        
        window.speechSynthesis.addEventListener('voiceschanged', getAndSetVoices);
        getAndSetVoices(); // Initial check

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', getAndSetVoices);
        };
    }, []);

    const getLanguageName = useCallback((code: string) => {
        const langMap: Record<string, string> = {
            hi: 'Hindi', te: 'Telugu', ta: 'Tamil', bn: 'Bengali',
            mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam',
            or: 'Odia', pa: 'Punjabi', as: 'Assamese'
        };
        return langMap[code] || 'English';
    }, []);

    const speak = useCallback((text: string, lang: LanguageCode) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis not supported');
            return;
        }
        
        window.speechSynthesis.cancel(); // Stop any currently playing speech
        const utterance = new SpeechSynthesisUtterance(text);
        const bcp47Lang = langToBcp47[lang];
        utterance.lang = bcp47Lang;

        if (voices.length > 0) {
            // Find an exact match first (e.g., 'te-IN'), then a partial match (e.g., 'te').
            let voice = voices.find(v => v.lang === bcp47Lang);
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith(lang));
            }

            if (voice) {
                utterance.voice = voice;
            } else {
                console.warn(`No voice found for language: ${lang} (${bcp47Lang}). The browser will use its default.`);
            }
        } else {
            console.warn('Voices not loaded yet, the browser will use its default for the specified language.');
        }
        
        window.speechSynthesis.speak(utterance);
    }, [voices]);


    useEffect(() => {
        try {
            const key = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) || '';
            const languageName = getLanguageName(language);
            const ai = new GoogleGenAI({ apiKey: key || 'dummy-key' });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are a friendly and helpful assistant for PLASTIVIZE, an app focused on plastic recycling and sustainability. Provide factual, neutral, and encouraging information. Keep your answers concise (2-3 sentences max) and easy to understand. You can navigate the user around the app, fetch recycling information, and find YouTube DIY videos by calling functions. When a function call is needed, provide ONLY the function call. The system will execute it and return the result to you. Your subsequent response to the user should be a simple confirmation of the action taken (e.g., "Done! I've taken you to the dashboard.") or present the information found. When you receive a list of videos from the 'searchYouTube' function, YOU MUST respond with a single line of text in this exact format: PLASTIVIZE_YOUTUBE_LIST[...json_array...]. The JSON array must contain objects with these exact keys: "videoId", "title", and "thumbnailUrl". Do not add any other text or formatting. You must respond in ${languageName}.`,
                    tools,
                },
            });
            setMessages([{ sender: 'bot', text: greetingMessage }]);
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            setMessages([{ sender: 'bot', text: 'Sorry, I am unable to connect right now.'}]);
        }
    }, [language, getLanguageName, greetingMessage]);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === 'bot') {
            // Do not speak if it's a structured message
            if (lastMessage.text.startsWith('PLASTIVIZE_YOUTUBE_LIST[')) {
                speak('Here are a few videos I found for you.', language);
            } else {
                speak(lastMessage.text, language);
            }
        }
    }, [messages, language, speak]);

    const handleFunctionCall = useCallback(async (functionCalls: any[]) => {
        let functionResponseParts: Part[] = [];

        for (const call of functionCalls) {
            const { name, args } = call;
            let result: any;
            try {
                if (name === 'navigateTo') {
                    const view = args.view as View;
                    navigateTo(view);
                    result = { success: true, message: `Navigating to ${view}.` };
                } else if (name === 'getRecyclingRules') {
                    const rules = await getRecyclingRules(args.plasticType, args.location, language);
                    result = rules ? { success: true, data: rules } : { success: false, error: "Could not find rules." };
                } else if (name === 'searchYouTube') {
                    const searchResult = await searchYouTube(args.query);
                    if (searchResult.success && searchResult.videos) {
                        result = { success: true, videos: searchResult.videos };
                    } else {
                         result = { success: false, error: searchResult.error };
                    }
                }
                functionResponseParts.push({ functionResponse: { name, response: result } });
            } catch (error) {
                 functionResponseParts.push({ functionResponse: { name, response: { success: false, error: (error as Error).message } } });
            }
        }
        return functionResponseParts;
    }, [navigateTo, language]);
    
    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim()) return;

        setIsLoading(true);
        const userMessage: Message = { sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            if (!chatRef.current) throw new Error("Chat not initialized.");
            
            let response = await chatRef.current.sendMessage({ message: messageText });

            while(response.functionCalls && response.functionCalls.length > 0) {
                const functionResponseParts = await handleFunctionCall(response.functionCalls);
                // FIX: The sendMessage method expects a SendMessageParameters object. The function response parts (Part[]) should be passed as the 'message' property.
                response = await chatRef.current.sendMessage({ message: functionResponseParts });
            }
            
            const botText = response.text?.trim();
            if (botText) {
                const botMessage: Message = { sender: 'bot', text: botText };
                setMessages(prev => [...prev, botMessage]);
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
            addToast({type: 'error', title: 'Chat Error', message: 'Could not get a response from the AI.'});
        } finally {
            setIsLoading(false);
        }
    }, [addToast, handleFunctionCall]);
    
    const toggleListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addToast({type: 'error', title: 'Unsupported', message: 'Speech recognition is not supported in this browser.'});
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = langToBcp47[language];
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            addToast({type: 'error', title: 'Voice Error', message: `Could not recognize speech: ${event.error}`});
            setIsListening(false);
        };
        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); // Set as input to allow editing
            sendMessage(transcript);
        };
        
        recognitionRef.current.start();
    }, [isListening, language, addToast, sendMessage]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        isListening,
        sendMessage,
        toggleListening,
    };
};