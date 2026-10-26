export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  imageAlt: string;
  color: string;
  availableForRent?: boolean;
  badge?: string;
};

export const featuredProducts: Product[] = [
  {
    id: "argentina-home-2022",
    name: "Argentina Home Jersey",
    category: "National jerseys",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Football supporters in a packed stadium",
    color: "Blue",
    availableForRent: true,
    badge: "Fan favorite",
  },
  {
    id: "barcelona-home-2024",
    name: "Barcelona Home Jersey",
    category: "Club jerseys",
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Players competing on a football pitch",
    color: "Blue",
    availableForRent: true,
  },
  {
    id: "liverpool-home-2024",
    name: "Liverpool Home Jersey",
    category: "Club jerseys",
    price: 2400,
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Football match under stadium lights",
    color: "Red",
    availableForRent: false,
    badge: "New season",
  },
  {
    id: "brazil-classic-2002",
    name: "Brazil Classic 2002",
    category: "Retro classics",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Footballer carrying the ball during a match",
    color: "Yellow",
    availableForRent: true,
  },
  {
    id: "france-away-2024",
    name: "France Away Jersey",
    category: "National jerseys",
    price: 2300,
    image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Football fans gathered before a match",
    color: "White",
  },
  {
    id: "milan-retro-1990",
    name: "Milan Retro 1990",
    category: "Retro classics",
    price: 3100,
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Football on a green pitch",
    color: "Red",
  },
  {
    id: "city-third-2024",
    name: "City Third Jersey",
    category: "Special editions",
    price: 2600,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Footballer running with the ball",
    color: "White",
  },
  {
    id: "argentina-away-2024",
    name: "Argentina Away Jersey",
    category: "National jerseys",
    price: 2500,
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Supporters celebrating in a stadium",
    color: "Blue",
  },
];

export function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}