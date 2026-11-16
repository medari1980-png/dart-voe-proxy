export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Mungon ID e videos VOE!' });
  }

  const targetUrl = `https://voe.sx/e/${id}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="8", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://voe.sx/'
      }
    });

    const html = await response.text();

    // Kërkon për formatet e ndryshme të transmetimit HLS / m3u8 në burimin e faqes
    let streamUrl = null;

    // 1. Kërkim direkt për m3u8
    const m3u8Match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
    if (m3u8Match) {
      streamUrl = m3u8Match[0];
    } 
    
    // 2. Kërkim për variablat e hls në skriptet e brendshme
    if (!streamUrl) {
      const hlsMatch = html.match(/'hls':\s*'([^']+)'/) || html.match(/"hls":\s*"([^"]+)"/) || html.match(/sources:\s*\[["']([^"']+)["']/);
      if (hlsMatch && hlsMatch[1]) {
        streamUrl = hlsMatch[1];
      }
    }

    // 3. Kërkim për player-in e fshehur hls tag ose eval
    if (!streamUrl) {
      const evalMatch = html.match(/https:\/\/[^\s"'+\\]+master\.m3u8[^\s"'+\\]*/);
      if (evalMatch) {
        streamUrl = evalMatch[0];
      }
    }

    if (streamUrl) {
      const cleanUrl = streamUrl.replace(/\\/g, '');
      // Ridrejton direkt pleyerin/panelin te linku i videos
      return res.redirect(302, cleanUrl);
    } else {
      // Nëse prapë bllokohet, kthen përmbajtjen për debug
      return res.status(404).json({ 
        error: 'Transmetimi nuk u gjet ose u bllokua nga Cloudflare.',
        debug_hint: 'Faqja kërkon verifikim shtesë.' 
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Gabim në lidhje me serverin.', details: err.message });
  }
}
