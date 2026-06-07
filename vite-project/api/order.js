// api/order.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { product, name, phone } = req.body;
    const token = process.env.BOT_TOKEN; // Buni Vercel'ga qo'shamiz
    const chatId = process.env.CHAT_ID;  // Buni Vercel'ga qo'shamiz

    const text = `Yangi buyurtma! 🛒%0A Mahsulot: ${product}%0A Mijoz: ${name}%0A Tel: ${phone}`;
    
    await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`);
    
    res.status(200).json({ message: "Yuborildi!" });
  }
}