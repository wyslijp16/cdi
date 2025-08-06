export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { titre, description, lien } = req.body;
  if (!titre || !description || !lien) return res.status(400).json({ error: "Champs manquants" });

  // Récupère les propositions existantes
  const response = await fetch(process.env.JSONBIN_PROPOSITIONS_URL, {
    headers: { "X-Master-Key": process.env.JSONBIN_KEY }
  });
  const data = await response.json();
  const propositions = data.record || [];

  // Ajoute la nouvelle proposition
  propositions.push({ id: Date.now(), titre, description, lien });

  // Sauvegarde
  await fetch(process.env.JSONBIN_PROPOSITIONS_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_KEY
    },
    body: JSON.stringify(propositions)
  });

  res.status(200).json({ ok: true });
}
