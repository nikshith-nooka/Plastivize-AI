// services/youtubeService.ts
import type { YouTubeVideo } from '../types';

// IMPORTANT: In a real-world application, this API key should be stored securely on a backend server
// and not exposed on the client-side. For this project's constraints, it's included here.
const YOUTUBE_API_KEY = 'AIzaSyAH3AmPb0-Z2E8u_ucOjxOKPZeog6wQ9og';

const API_URL = 'https://www.googleapis.com/youtube/v3/search';

export const searchYouTube = async (query: string): Promise<{ success: boolean; videos?: YouTubeVideo[]; error?: string }> => {
    // Enhance the query for better results
    const searchQuery = `${query} diy reuse craft 5 minute`;

    try {
        const response = await fetch(`${API_URL}?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&videoDuration=medium&key=${YOUTUBE_API_KEY}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error:', errorData);
            throw new Error(errorData.error.message || 'Failed to fetch from YouTube API');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videos: YouTubeVideo[] = data.items.map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
            }));
            return { success: true, videos };
        } else {
            return { success: false, error: 'No relevant videos found.' };
        }

    } catch (error) {
        console.error('Error searching YouTube:', error);
        return { success: false, error: (error as Error).message };
    }
};