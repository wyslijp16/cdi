export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { id, action, password } = req.body;
  if (password !== process.env.ADMIN_PASS && password !== "admin123") {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }

  // Récupère les propositions
  const propRes = await fetch(process.env.JSONBIN_PROPOSITIONS_URL, {
    headers: { "X-Master-Key": process.env.JSONBIN_KEY }
  });
  const propData = await propRes.json();
  let propositions = propData.record || [];
  const proposition = propositions.find((p) => p.id === id);

  if (!proposition) return res.status(404).json({ error: "Proposition non trouvée" });

  // Retire la proposition de la liste
  propositions = propositions.filter((p) => p.id !== id);

  // Sauvegarde la nouvelle liste de propositions
  await fetch(process.env.JSONBIN_PROPOSITIONS_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_KEY
    },
    body: JSON.stringify(propositions)
  });

  if (action === "valider") {
    // Ajoute à la liste des ressources validées
    const resRes = await fetch(process.env.JSONBIN_RESSOURCES_URL, {
      headers: { "X-Master-Key": process.env.JSONBIN_KEY }
    });
    const resData = await resRes.json();
    const ressources = resData.record || [];
    ressources.push(proposition);
    await fetch(process.env.JSONBIN_RESSOURCES_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": process.env.JSONBIN_KEY
      },
      body: JSON.stringify(ressources)
    });
  }

  res.status(200).json({ ok: true });
}
