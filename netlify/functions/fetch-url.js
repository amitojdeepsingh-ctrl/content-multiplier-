export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url || !url.startsWith('http')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'A valid URL is required' }) };
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return { statusCode: 400, body: JSON.stringify({ error: `Could not fetch page (${response.status})` }) };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('html') && !contentType.includes('text')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'URL must point to a webpage, not a file or image' }) };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';

    // Remove unwanted sections
    let cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Try to find main content area
    const mainMatch = cleaned.match(/<(?:article|main|div[^>]*(?:content|post|article|body)[^>]*)[\s\S]*?>([\s\S]+?)(?=<\/(?:article|main)>|$)/i);
    if (mainMatch) cleaned = mainMatch[1];

    // Strip all remaining HTML tags
    let text = cleaned
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Prepend title if found
    if (title && !text.startsWith(title)) {
      text = `${title}\n\n${metaDesc ? metaDesc + '\n\n' : ''}${text}`;
    }

    // Truncate to 10,000 chars (dashboard limit)
    if (text.length > 10000) {
      text = text.slice(0, 9900) + '\n\n[Content truncated to fit limit]';
    }

    if (text.length < 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Could not extract enough text from this page. Try copying the content manually.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, charCount: text.length }),
    };
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return { statusCode: 408, body: JSON.stringify({ error: 'Page took too long to load. Try a different URL.' }) };
    }
    console.error('Fetch URL error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch URL: ' + error.message }) };
  }
};
