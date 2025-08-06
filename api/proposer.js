export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const testData = [
    { id: 1, titre: "Test", description: "Test", lien: "https://test.com", categorie: "petitions" }
  ];

  const save = await fetch(process.env.JSONBIN_PROPOSITIONS_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_KEY
    },
    body: JSON.stringify(testData)
  });

  const saveText = await save.text();
  console.log("JSONBIN SAVE RESPONSE:", save.status, saveText);

  if (!save.ok) {
    return res.status(500).json({ error: saveText });
  }

  res.status(200).json({ ok: true });
}