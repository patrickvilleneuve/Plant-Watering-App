// ============================================================
// data.js — fictional starter content for the prototype.
// Plant changes are saved in this browser, not in this file.
// ============================================================

const STARTUP = {
  name: "Frond",
  tagline: "A calmer way to care for your plants.",
  pitch: "Know what needs water, keep your collection thriving, and find a plant sitter when life takes you away."
};

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const STARTER_PLANTS = [
  { id: "monstera", name: "Monstera", species: "Monstera deliciosa", icon: "🌿", interval: 7, lastWatered: dateDaysAgo(10), priority: 3 },
  { id: "peace-lily", name: "Peace lily", species: "Spathiphyllum", icon: "🌱", interval: 5, lastWatered: dateDaysAgo(6), priority: 3 },
  { id: "pothos", name: "Golden pothos", species: "Epipremnum aureum", icon: "🍃", interval: 9, lastWatered: dateDaysAgo(8), priority: 2 },
  { id: "snake-plant", name: "Snake plant", species: "Dracaena trifasciata", icon: "🪴", interval: 21, lastWatered: dateDaysAgo(16), priority: 1 }
];

const PLANT_SITTERS = [
  { id: "alex", name: "Alex Morgan", initials: "AM", specialty: "Tropical plants", rating: "4.9", visits: 38, price: "$18 / visit" },
  { id: "jules", name: "Jules Rivera", initials: "JR", specialty: "Succulents & cacti", rating: "5.0", visits: 24, price: "$15 / visit" },
  { id: "sam", name: "Sam Lee", initials: "SL", specialty: "Balcony gardens", rating: "4.8", visits: 51, price: "$20 / visit" }
];
