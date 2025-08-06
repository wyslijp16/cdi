export default async function handler(req, res) {
  const response = await fetch(process.env.JSONBIN_RESSOURCES_URL, {
    headers: { "X-Master-Key": process.env.JSONBIN_KEY }
  });
  const data = await response.json();
  res.status(200).json(data.record || []);
}
