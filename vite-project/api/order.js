export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { product, name, phone } = req.body;
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    const text = `Yangi buyurtma! 🛒%0A Mahsulot: ${product}%0A Mijoz: ${name}%0A Tel: ${phone}`;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`);
      const data = await response.json();
      
      if (data.ok) {
        res.status(200).json({ message: "Yuborildi!" });
      } else {
        res.status(500).json({ error: "Telegram API xatoligi", details: data });
      }
    } catch (err) {
      res.status(500).json({ error: "Server xatoligi" });
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}