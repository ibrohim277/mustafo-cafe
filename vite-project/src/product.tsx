import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useStore } from "../src/store/CartStore";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  model: string;
  description: string;
  price: number;
  image: string;
}

const Product = () => {
  // Store'dan kerakli ma'lumot va funksiyalarni olamiz
  const { cart, addToCart, setIsOpen } = useStore();

  // Tanstack Query orqali ma'lumotlarni olish
  const { data, isLoading } = useQuery<ProductItem[]>({
    queryKey: ["product"],
    queryFn: () =>
      axios
        .get("https://store-backend-d7nd.onrender.com/products")
        .then((res) => res.data),
  });

  // --- PREMIUM SKELETON LOADING ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-5 py-12">
        <div className="w-48 h-8 bg-gray-200 rounded-xl mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-100 p-4 space-y-4 shadow-sm"
            >
              <div className="w-full h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-5/6 animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-1/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5 py-12">
      {/* Sarlavha qismi */}
      <div className="flex flex-col mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Premium Mahsulotlar
        </h1>
        <div className="w-16 h-1 bg-blue-600 rounded-full mt-2"></div>
      </div>

      {/* Mahsulotlar Gridi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((item) => {
          // Mahsulot savatda bor yoki yo'qligini tekshirish
          const isInCart = cart.some((cartItem) => cartItem.id === item.id);

          return (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Rasm qismi */}
              <div className="p-4 bg-gray-50/50 m-2 rounded-2xl relative overflow-hidden flex items-center justify-center h-52">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 duration-500"
                />
                {isInCart && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 animate-fadeIn">
                    <Check size={12} strokeWidth={3} />
                    Savatda
                  </span>
                )}
              </div>

              {/* Ma'lumotlar qismi */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2 py-1 rounded-md">
                    {item.model || "iPhone"}
                  </span>

                  <h2 className="text-lg font-bold text-gray-900 mt-2.5 line-clamp-1 group-hover:text-blue-600 transition duration-200">
                    {item.name}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2 min-h-[36px]">
                    {item.description ||
                      "Premium Apple qurilmasi barcha qulayliklar va kafolatlar bilan."}
                  </p>
                </div>

                {/* Narx va Tugma qismi */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900">
                      ${item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Rasmiy kafolat
                    </span>
                  </div>

                  {/* Dinamik Tugma */}
                  {isInCart ? (
                    <button
                      onClick={() => setIsOpen(true)} // Savatda bo'lsa, savat panelini ochadi
                      className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-sm shadow-emerald-100"
                    >
                      Savatda
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                        })
                      }
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20"
                    >
                      <ShoppingBag size={14} />
                      Savatga
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Product;
