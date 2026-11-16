export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Mungon ID e videos VOE!' });
  }

  const voeUrl = `https://voe.sx/e/${id}`;

  try {
    const response = await fetch(voeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://voe.sx/'
      }
    });

    const html = await response.text();
    
    // Provon të kapë linkun m3u8 ose hls nga skriptet e brendshme të faqes
    let match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
    
    if (!match) {
      // Nëse nuk e gjen direkt, kërkon për variablat e transmetimit të fshehura
      const hlsMatch = html.match(/'hls':\s*'([^']+)'/) || html.match(/"hls":\s*"([^"]+)"/);
      if (hlsMatch && hlsMatch[1]) {
        match = [hlsMatch[1]];
      }
    }

    if (match && match[0]) {
      // Pastron backslash-et nëse ka
      const cleanUrl = match[0].replace(/\\/g, '');
      return res.redirect(302, cleanUrl);
    } else {
      return res.status(404).json({ error: 'Linku .m3u8 nuk u gjet ose video mbrohet nga Cloudflare.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Gabim gjatë përpunimit të kërkesës.' });
  }
}
