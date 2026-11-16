export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Mungon ID e videos VOE!' });
  }

  const voeUrl = `https://voe.sx/e/${id}`;

  try {
    const response = await fetch(voeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://voe.sx/'
      }
    });

    const html = await response.text();
    const match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);

    if (match && match[0]) {
      return res.redirect(302, match[0]);
    } else {
      return res.status(404).json({ error: 'Linku .m3u8 nuk u gjet ose video u fshi.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Gabim gjatë përpunimit të kërkesës.' });
  }
}
