class GeminiJS {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.model = options.model || 'gemini-1.5-pro';
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 30000;
        this.baseUrl = 'https://api.gemini.ai/v1'; // Example base URL
        this.rateLimit = 0; // Track rate limit
    }

    async generateText(params) {
        const { prompt, temperature = 0.7, maxTokens = 256, topP = 0.9, topK = 40 } = params;
        return this._makeRequest('/generate-text', {
            prompt,
            temperature,
            maxTokens,
            topP,
            topK
        });
    }

    async createChat() {
        return new Chat(this);
    }

    async generateTextStream(params) {
        const { prompt, onToken, onComplete, onError } = params;

        const url = `${this.baseUrl}/generate-text-stream`;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ prompt })
        };

        const eventSource = new EventSource(url, options);

        eventSource.onmessage = (event) => {
            const token = JSON.parse(event.data);
            if (onToken) onToken(token);
        };

        eventSource.onerror = (error) => {
            if (onError) onError(error);
            eventSource.close();
        };

        eventSource.oncomplete = () => {
            if (onComplete) onComplete();
            eventSource.close();
        };
    }

    async _makeRequest(endpoint, body) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        };

        for (let i = 0; i < this.maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                this._manageRateLimit(data);
                return data;
            } catch (error) {
                if (i === this.maxRetries - 1) throw error; // Rethrow if max retries reached
            }
        }
    }

    _manageRateLimit(data) {
        // Example of managing rate limit based on response headers
        if (data.rateLimit) {
            this.rateLimit = data.rateLimit; // Update rate limit status
        }
    }
}

class Chat {
    constructor(gemini) {
        this.gemini = gemini;
        this.messages = [];
    }

    async sendMessage(message) {
        this.messages.push({ role: 'user', content: message });
        const response = await this.gemini.generateText({
            prompt: this.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
        });
        this.messages.push({ role: 'ai', content: response.text });
        return response;
    }

    get lastResponse() {
        return this.messages[this.messages.length - 1];
    }
}
