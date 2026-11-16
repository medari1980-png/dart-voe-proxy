export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Mungon ID e videos VOE!' });
  }

  const targetUrl = `https://voe.sx/e/${id}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://voe.sx/'
      }
    });

    const html = await response.text();

    // Kërkon për linkun m3u8 në stile ose skripte të ndryshme të faqes
    let streamUrl = null;
    
    const m3u8Match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
    if (m3u8Match) {
      streamUrl = m3u8Match[0];
    } else {
      const hlsMatch = html.match(/'hls':\s*'([^']+)'/) || html.match(/"hls":\s*"([^"]+)"/);
      if (hlsMatch && hlsMatch[1]) {
        streamUrl = hlsMatch[1];
      }
    }

    if (streamUrl) {
      const cleanUrl = streamUrl.replace(/\\/g, '');
      // Ridrejton direkt panelin ose lojtarin tek linku i videos
      return res.redirect(302, cleanUrl);
    } else {
      return res.status(404).json({ error: 'Transmetimi nuk u gjet. Provoni një ID tjetër.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Gabim në lidhje me serverin.' });
  }
}
