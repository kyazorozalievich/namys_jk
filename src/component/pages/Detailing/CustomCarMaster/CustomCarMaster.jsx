import React, { useState } from "react";
import scss from "./CustomCarMaster.module.scss";

const TG_BOT_TOKEN = "8735673140:AAHT5xSLgnazXY56Q_miz-_XWilPnOL2ydQ";
const TG_CHAT_ID = "-1004353082934";
const TG_GROUP_LINK = "https://t.me/detailing_namysjk";

const COUNTRIES_DATA = {
  "🇩🇪 Германия": [
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Porsche",
    "Volkswagen",
    "Smart",
  ],
  "🇯🇵 Япония": [
    "Toyota",
    "Nissan",
    "Lexus",
    "Honda",
    "Mazda",
    "Subaru",
    "Mitsubishi",
    "Infiniti",
    "Acura",
  ],
  "🇺🇸 США": [
    "Ford",
    "Dodge",
    "Chevrolet",
    "Jeep",
    "GMC",
    "Cadillac",
    "Hummer",
    "DeLorean",
  ],
  "🇬🇧 Великобритания": [
    "Rolls-Royce",
    "Bentley",
    "Aston Martin",
    "McLaren",
    "Land Rover",
    "Range Rover",
    "MINI",
    "Ariel",
  ],
  "🇮🇹 Италия": ["Ferrari", "Lamborghini", "Alfa Romeo", "Fiat", "Pagani"],
  "🇰🇷 Корея": ["Kia", "Hyundai"],
  "🌍 Другие страны": [
    "Bugatti",
    "Koenigsegg",
    "Peugeot",
    "Skoda",
    "Dacia",
    "Lada",
    "Tofaş",
    "Perodua",
  ],
  "🚛 Грузовики & Автобусы": ["Scania", "Kenworth", "DAF", "King Long"],
};

const SERVICE_OPTIONS = [
  { id: "badge", label: "Значок автомобиля" },
  { id: "shildik", label: "Изготовление шильдиков" },
  { id: "full", label: "Вся комплектация (Полный кастом)" },
];

const CustomCarMaster = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [contactType, setContactType] = useState("Telegram");
  const [contactValue, setContactValue] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleServiceChange = (serviceLabel) => {
    if (selectedServices.includes(serviceLabel)) {
      setSelectedServices(selectedServices.filter((s) => s !== serviceLabel));
    } else {
      setSelectedServices([...selectedServices, serviceLabel]);
    }
  };

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (
      !selectedBrand ||
      selectedServices.length === 0 ||
      !contactValue.trim()
    ) {
      setError(
        "Пожалуйста, выберите страну, марку, хотя бы одну услугу и оставьте контакты.",
      );
      return;
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleTelegramRedirect = async () => {
    setIsSending(true);

    const escapeHtml = (text) => {
      if (!text) return "";
      return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const message =
      `<b>🛒 Новый заказ на кастомизацию авто!</b>\n\n` +
      `🌍 <b>Регион:</b> ${escapeHtml(selectedCountry)}\n` +
      `🚘 <b>Марка машины:</b> ${escapeHtml(selectedBrand)}\n` +
      `🛠️ <b>Что нужно сделать:</b> ${escapeHtml(selectedServices.join(", "))}\n` +
      `📞 <b>Связь (${escapeHtml(contactType)}):</b> ${escapeHtml(contactValue)}\n\n` +
      `<i>Клиент переходит в группу для обсуждения цены.</i>\n` +
      `<b>Мастера: @ffeedu / @Isko_1337 / Emka</b>`;

    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Ошибка бота:", err);
    } finally {
      setIsSending(false);
      setIsModalOpen(false);
      window.open(TG_GROUP_LINK, "_blank", "noreferrer");
    }
  };

  return (
    <main className={scss.profilePage}>
      <section className={scss.mainCard}>
        <header className={scss.headerSection}>
          <h1 className={scss.mainTitle}>
            🎨 Машины на заказ & Шильдики в Бишкеке
          </h1>
          <p className={scss.description}>
            Соберите свой уникальный стиль! Выберите страну производства авто,
            кликните на нужную марку и укажите элементы кастомизации.
          </p>
        </header>

        <form className={scss.orderForm} onSubmit={handleCheckoutClick}>
          <fieldset className={scss.formGroup}>
            <legend className={scss.groupLabel}>
              1. Выберите страну автомобиля:
            </legend>
            <div className={scss.countriesGrid}>
              {Object.keys(COUNTRIES_DATA).map((country) => (
                <button
                  type="button"
                  key={country}
                  className={`${scss.countryCard} ${selectedCountry === country ? scss.activeCountry : ""}`}
                  onClick={() => {
                    setSelectedCountry(country);
                    setSelectedBrand("");
                  }}
                >
                  {country}
                </button>
              ))}
            </div>
          </fieldset>

          {selectedCountry && (
            <fieldset className={`${scss.formGroup} ${scss.fadeIn}`}>
              <legend className={scss.groupLabel}>
                2. Выберите марку машины:
              </legend>
              <div className={scss.brandsGrid}>
                {COUNTRIES_DATA[selectedCountry].map((brand) => (
                  <button
                    type="button"
                    key={brand}
                    className={`${scss.brandCard} ${selectedBrand === brand ? scss.activeBrand : ""}`}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className={scss.formGroup}>
            <legend className={scss.groupLabel}>
              3. Что необходимо изготовить?
            </legend>
            <div className={scss.checkboxGrid}>
              {SERVICE_OPTIONS.map((service) => (
                <label
                  key={service.id}
                  className={`${scss.checkboxCard} ${selectedServices.includes(service.label) ? scss.activeCard : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.label)}
                    onChange={() => handleServiceChange(service.label)}
                  />
                  <span>{service.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={scss.formGroup}>
            <legend className={scss.groupLabel}>
              4. Ваша контактная информация:
            </legend>
            <div className={scss.contactInputs}>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className={scss.selectInputShort}
                aria-label="Тип связи"
              >
                <option value="Telegram">Telegram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
              <input
                type="text"
                placeholder={
                  contactType === "Telegram"
                    ? "@username или номер"
                    : contactType === "WhatsApp"
                      ? "+996 ..."
                      : "example@mail.com"
                }
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                className={scss.textInput}
                required
                aria-label="Контактные данные"
              />
            </div>
          </fieldset>

          {error && (
            <p className={scss.errorMessage} role="alert">
              {error}
            </p>
          )}

          <div className={scss.actionContainer}>
            <button type="submit" className={scss.submitBtn}>
              🚀 Перейти к оформлению
            </button>
          </div>
        </form>
      </section>

      {isModalOpen && (
        <div
          className={scss.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={scss.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>💰 Цена услуги договорная</h2>
            <p>
              Стоимость изготовления шильдиков, значков или полной сборки авто
              обсуждается напрямую с нашими мастерами.
            </p>
            <div className={scss.modalActions}>
              <button
                type="button"
                className={scss.cancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Изменить детали
              </button>
              <button
                type="button"
                className={scss.telegramBtn}
                onClick={handleTelegramRedirect}
                disabled={isSending}
              >
                {isSending ? "Отправка..." : "Перейти в группу ТГ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CustomCarMaster;
