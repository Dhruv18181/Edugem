interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
}

interface SerperResponse {
  searchParameters: {
    q: string;
    type: string;
  };
  organic: SerperSearchResult[];
  videos?: Array<{
    title: string;
    link: string;
    snippet: string;
    imageUrl: string;
    duration: string;
    source: string;
    channel: string;
    date: string;
  }>;
  news?: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
    imageUrl?: string;
  }>;
}

export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev';

  constructor() {
    this.apiKey = import.meta.env.VITE_SERPER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Serper API key not found. Web search functionality will be limited.');
    }
  }

  async search(query: string, type: 'search' | 'news' | 'videos' = 'search'): Promise<SerperResponse | null> {
    if (!this.apiKey) {
      throw new Error('Serper API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Serper search error:', error);
      return null;
    }
  }

  async searchWithVideos(query: string): Promise<{
    web: SerperSearchResult[];
    videos: Array<{
      title: string;
      link: string;
      snippet: string;
      imageUrl: string;
      duration: string;
      source: string;
      channel: string;
      date: string;
    }>;
  }> {
    try {
      const [webResults, videoResults] = await Promise.all([
        this.search(query, 'search'),
        this.search(query, 'videos')
      ]);

      return {
        web: webResults?.organic || [],
        videos: videoResults?.videos || []
      };
    } catch (error) {
      console.error('Combined search error:', error);
      return { web: [], videos: [] };
    }
  }

  formatSearchResults(results: SerperResponse): string {
    let formatted = '';

    if (results.organic && results.organic.length > 0) {
      formatted += '## Web Results:\n\n';
      results.organic.slice(0, 5).forEach((result, index) => {
        formatted += `${index + 1}. **[${result.title}](${result.link})**\n`;
        formatted += `   ${result.snippet}\n\n`;
      });
    }

    if (results.videos && results.videos.length > 0) {
      formatted += '## Video Results:\n\n';
      results.videos.slice(0, 3).forEach((video, index) => {
        formatted += `${index + 1}. **[${video.title}](${video.link})** (${video.duration})\n`;
        formatted += `   Channel: ${video.channel}\n`;
        formatted += `   ${video.snippet}\n\n`;
      });
    }

    if (results.news && results.news.length > 0) {
      formatted += '## News Results:\n\n';
      results.news.slice(0, 3).forEach((news, index) => {
        formatted += `${index + 1}. **[${news.title}](${news.link})**\n`;
        formatted += `   Source: ${news.source} | ${news.date}\n`;
        formatted += `   ${news.snippet}\n\n`;
      });
    }

    return formatted;
  }
}

export const serperService = new SerperService();