export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Mungon ID e videos VOE!' });
  }

  // Provon endpoint-in e brendshëm të player-it nëse ekziston
  const targetUrl = `https://voe.sx/e/${id}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://voe.sx/'
      }
    });

    const html = await response.text();

    let streamUrl = null;

    // Metoda 1: Kërkon për tagun e hls direkt në burim
    const match1 = html.match(/['"]hls['"]\s*:\s*['"]([^'"]+)['"]/);
    if (match1 && match1[1]) {
      streamUrl = match1[1];
    }

    // Metoda 2: Kërkon për çdo lidhje që përfundon në .m3u8 ose master.m3u8
    if (!streamUrl) {
      const match2 = html.match(/https?:\/\/[^"']+\/master\.m3u8[^"']*/);
      if (match2 && match2[0]) {
        streamUrl = match2[0];
      }
    }

    // Metoda 3: Kërkon për çdo linjë që përmban .m3u8 në script
    if (!streamUrl) {
      const match3 = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
      if (match3 && match3[0]) {
        streamUrl = match3[0];
      }
    }

    if (streamUrl) {
      const cleanUrl = streamUrl.replace(/\\/g, '');
      return res.redirect(302, cleanUrl);
    } else {
      // Nëse Cloudflare përsëri bllokon, kthen një përgjigje që mundëson përdorimin e një parametri alternativ
      return res.status(422).json({ 
        error: 'Cloudflare bllokoi kërkesën direkte.',
        note: 'Për këtë ID, skripti kërkon kalim manual të cookies ose përdorim të një tokeni të ruajtur.' 
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Gabim në server.', details: err.message });
  }
}
