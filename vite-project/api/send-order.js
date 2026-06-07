const handleOrder = async () => {
  const orderData = {
    product: "iPhone 15", // Masalan, mahsulot nomi
    name: "Ali",          // Mijoz ismi
    phone: "+998901234567" // Telefon raqami
  };

  try {
    const response = await fetch('/api/order', { // Bu yerda /api/order yoziladi
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      alert("Buyurtmangiz muvaffaqiyatli yuborildi!");
    } else {
      alert("Xatolik yuz berdi.");
    }
  } catch (error) {
    console.error("Xatolik:", error);
  }
};  