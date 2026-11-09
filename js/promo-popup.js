document.addEventListener("DOMContentLoaded", () => {

    // PROMOTION SETTINGS
    const promotion = {
        enabled: true,
        id: "martinstag-2026",
        image: "images/promotions/martinstag-2026.png",
        alt: "Martinstag: Gänsekeule 33,50 Euro und Gänsebrust 32,50 Euro mit Rotkohl und Klößen."
    };

    // Check if promotion is enabled
    if (!promotion.enabled) return;

    // Show only once per browser session


    // Create Bootstrap modal
    const modalHTML = `
        <div
            class="modal fade promo-popup"
            id="promotionModal"
            tabindex="-1"
            aria-labelledby="promotionTitle"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-dialog-centered">

                <div class="modal-content">

                    <h2 id="promotionTitle" class="visually-hidden">
                        Aktuelles Angebot – Restaurant Dalmacija
                    </h2>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Schließen"
                    ></button>

                    <img class="promo-image" alt="">
                    <img
    class="promo-date"
    src="images/promotions/date.png"
    alt="Vom 11.11.2026 bis 20.12.2026"
>

                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalElement = document.getElementById("promotionModal");
    const image = modalElement.querySelector(".promo-image");

    image.alt = promotion.alt;

    // Open only after image is loaded
    image.addEventListener("load", () => {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }, { once: true });

    image.addEventListener("error", () => {
        console.error("Promotion image could not be loaded.");
    }, { once: true });

    image.src = promotion.image;

    // Remember that the visitor has seen the popup


});