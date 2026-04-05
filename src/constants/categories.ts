import {
    Home,
    Utensils,
    Car,
    Heart,
    Smartphone,
    GraduationCap,
    Shirt,
    ShoppingCart,
    Wifi,
    Tv,
    MoreHorizontal,
} from "lucide-react";

export const CATEGORIAS_DESPESA = [
    { id: "moradia", label: "Moradia", icone: Home, cor: "from-blue-500 to-blue-400" },
    { id: "alimentacao", label: "Alimentação", icone: Utensils, cor: "from-orange-500 to-orange-400" },
    { id: "transporte", label: "Transporte", icone: Car, cor: "from-purple-500 to-purple-400" },
    { id: "saude", label: "Saúde", icone: Heart, cor: "from-red-500 to-red-400" },
    { id: "educacao", label: "Educação", icone: GraduationCap, cor: "from-green-500 to-green-400" },
    { id: "lazer", label: "Lazer", icone: Smartphone, cor: "from-pink-500 to-pink-400" },
    { id: "vestuario", label: "Vestuário", icone: Shirt, cor: "from-indigo-500 to-indigo-400" },
    { id: "compras", label: "Compras", icone: ShoppingCart, cor: "from-teal-500 to-teal-400" },
    { id: "telecom", label: "Internet/TV/Telefone", icone: Wifi, cor: "from-cyan-500 to-cyan-400" },
    { id: "streaming", label: "Streaming", icone: Tv, cor: "from-rose-500 to-rose-400" },
    { id: "outros", label: "Outros", icone: MoreHorizontal, cor: "from-gray-500 to-gray-400" },
];
