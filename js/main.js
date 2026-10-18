lucide.createIcons();

// WhatsApp rezervacije
const reservationMessage = [
    "Guten Tag, ich möchte gerne einen Tisch reservieren.",
    "",
    "📅 Datum:",
    "🕒 Uhrzeit:",
    "👥 Personen:",
    "👤 Name:"
].join("\n");

document.querySelectorAll(".navbar-reservation").forEach((link) => {
    link.href = `https://wa.me/491729450190?text=${encodeURIComponent(reservationMessage)}`;
});