import React, { useState } from "react";
import scss from "./NumberMaster.module.scss";

import kgflag from "../../../../data/images/detailing/kgflag.png";
import oldflag from "../../../../data/images/detailing/oldflagkg.jpg";
import kzflag from "../../../../data/images/detailing/kzflag.avif";
import ruflag from "../../../../data/images/detailing/ruflag.webp";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const PRICE_CONFIG = {
  KG: {
    classic: {
      BASE_PRICE: 0,
      CURRENCY: "сом",
      LETTERS: {
        A: 20,
        B: 30,
        C: 40,
        D: 30,
        E: 20,
        F: 20,
        G: 30,
        H: 20,
        I: 20,
        J: 20,
        K: 20,
        L: 20,
        M: 30,
        N: 20,
        O: 40,
        P: 30,
        Q: 40,
        R: 30,
        S: 40,
        T: 20,
        U: 30,
        V: 20,
        W: 30,
        X: 20,
        Y: 30,
        Z: 20,
      },
      DIGITS: {
        0: 30,
        1: 30,
        2: 40,
        3: 40,
        4: 30,
        5: 40,
        6: 40,
        7: 30,
        8: 40,
        9: 40,
      },
    },
    named: {
      BASE_PRICE: 0,
      BASE_PRICE_DISCOUNT_7: 0, // Скидка на базовую цену, если букв ровно 7
      CURRENCY: "сом",
      LETTERS: {
        A: 30,
        B: 40,
        C: 50,
        D: 40,
        E: 30,
        F: 30,
        G: 40,
        H: 30,
        I: 30,
        J: 30,
        K: 30,
        L: 30,
        M: 40,
        N: 30,
        O: 50,
        P: 40,
        Q: 50,
        R: 40,
        S: 60,
        T: 30,
        U: 40,
        V: 30,
        W: 40,
        X: 30,
        Y: 40,
        Z: 30,
      },
      LETTERS_DISCOUNT_7: {
        A: 25,
        B: 35,
        C: 45,
        D: 35,
        E: 25,
        F: 25,
        G: 35,
        H: 25,
        I: 25,
        J: 25,
        K: 25,
        L: 25,
        M: 35,
        N: 25,
        O: 45,
        P: 35,
        Q: 45,
        R: 35,
        S: 45,
        T: 25,
        U: 35,
        V: 25,
        W: 35,
        X: 25,
        Y: 35,
        Z: 25,
      }, // Цены на конкретные буквы при 7 символах
    },
    old: {
      BASE_PRICE: 0,
      CURRENCY: "сом",
      LETTERS: {
        A: 50,
        B: 60,
        C: 60,
        D: 60,
        E: 50,
        F: 50,
        G: 60,
        H: 50,
        I: 50,
        J: 50,
        K: 50,
        L: 50,
        M: 60,
        N: 50,
        O: 60,
        P: 60,
        Q: 60,
        R: 50,
        S: 60,
        T: 50,
        U: 60,
        V: 50,
        W: 60,
        X: 50,
        Y: 60,
        Z: 50,
      },
      DIGITS: {
        0: 60,
        1: 40,
        2: 60,
        3: 60,
        4: 40,
        5: 60,
        6: 60,
        7: 40,
        8: 60,
        9: 60,
      },
    },
  },
  KZ: {
    classic: {
      BASE_PRICE: 0,
      CURRENCY: "сом",
      LETTERS: {
        A: 40,
        B: 50,
        C: 50,
        D: 50,
        E: 50,
        F: 50,
        G: 50,
        H: 40,
        I: 50,
        J: 50,
        K: 40,
        L: 50,
        M: 40,
        N: 50,
        O: 50,
        P: 50,
        Q: 40,
        R: 50,
        S: 40,
        T: 50,
        U: 50,
        V: 50,
        W: 50,
        X: 50,
        Y: 40,
        Z: 50,
      },
      DIGITS: {
        0: 50,
        1: 45,
        2: 50,
        3: 45,
        4: 45,
        5: 50,
        6: 50,
        7: 45,
        8: 50,
        9: 50,
      },
    },
  },
  RU: {
    classic: {
      BASE_PRICE: 0,
      CURRENCY: "сом",
      LETTERS: {
        A: 40,
        B: 50,
        C: 50,
        D: 50,
        E: 50,
        F: 50,
        G: 50,
        H: 40,
        I: 50,
        J: 50,
        K: 40,
        L: 50,
        M: 40,
        N: 50,
        O: 50,
        P: 50,
        Q: 40,
        R: 50,
        S: 40,
        T: 50,
        U: 50,
        V: 50,
        W: 50,
        X: 50,
        Y: 40,
        Z: 50,
      },
      DIGITS: {
        0: 50,
        1: 45,
        2: 50,
        3: 45,
        4: 45,
        5: 50,
        6: 50,
        7: 45,
        8: 50,
        9: 50,
      },
    },
  },
};

const NumberMaster = () => {
  const [country, setCountry] = useState("KG");
  const [kgType, setKgType] = useState("classic");
  const [plateSize, setPlateSize] = useState("classic");

  const [region, setRegion] = useState("01");
  const [digits, setDigits] = useState("");
  const [letters, setLetters] = useState("");
  const [namedText, setNamedText] = useState("");
  const [oldStyle, setOldStyle] = useState("style1");

  const [showModal, setShowModal] = useState(false);
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactUsername, setContactUsername] = useState("");

  const isNamedKg = country === "KG" && kgType === "named";

  // Динамический расчет цены с учетом скидок для 7-значных именных номеров
  const calculateDynamicPrice = () => {
    const currentConfig =
      country === "KG"
        ? PRICE_CONFIG.KG[kgType]
        : PRICE_CONFIG[country].classic;

    let totalSymbolPrice = 0;
    let basePrice = currentConfig.BASE_PRICE;

    if (isNamedKg) {
      const is7Chars = namedText.length === 7;

      // Если ровно 7 букв — применяем скидку на базовую стоимость
      if (is7Chars && currentConfig.BASE_PRICE_DISCOUNT_7 !== undefined) {
        basePrice = currentConfig.BASE_PRICE_DISCOUNT_7;
      }

      for (let char of namedText) {
        if (is7Chars) {
          // Цены со скидкой для 7 букв
          totalSymbolPrice +=
            currentConfig.LETTERS_DISCOUNT_7?.[char] !== undefined
              ? currentConfig.LETTERS_DISCOUNT_7[char]
              : currentConfig.DEFAULT_LETTER_PRICE_DISCOUNT_7;
        } else {
          // Обычные цены для именного номера
          totalSymbolPrice +=
            currentConfig.LETTERS[char] !== undefined
              ? currentConfig.LETTERS[char]
              : currentConfig.DEFAULT_LETTER_PRICE;
        }
      }
    } else {
      // Логика для обычных и старых номеров
      for (let char of letters) {
        totalSymbolPrice +=
          currentConfig.LETTERS[char] !== undefined
            ? currentConfig.LETTERS[char]
            : currentConfig.DEFAULT_LETTER_PRICE || 0;
      }
      for (let num of digits) {
        totalSymbolPrice +=
          currentConfig.DIGITS[num] !== undefined
            ? currentConfig.DIGITS[num]
            : currentConfig.DEFAULT_DIGIT_PRICE || 0;
      }
    }

    return `${basePrice + totalSymbolPrice} ${currentConfig.CURRENCY}`;
  };

  const handleDigitsChange = (e, max) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= max) setDigits(val);
  };

  const handleLettersChange = (e, max) => {
    const val = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase();
    if (val.length <= max) setLetters(val);
  };

  const handleNamedChange = (e) => {
    const val = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase();
    if (val.length <= 7) setNamedText(val);
  };

  const roadLetters = new Set([
    "A",
    "B",
    "C",
    "D",
    "E",
    "H",
    "K",
    "M",
    "O",
    "P",
    "T",
    "X",
    "Y",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ]);

  // Функции рендеринга шрифтов (оставляем без изменений)
  const renderKzLetters = (text = "AAA", customSize) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          fontFamily: roadLetters.has(char)
            ? "RoadNumbers"
            : "Franklin Gothic Medium, Arial Narrow, Arial, sans-serif",
          fontSize: customSize
            ? customSize
            : roadLetters.has(char)
              ? "80px"
              : "59px",
          transform: roadLetters.has(char) ? "scaleX(1)" : "scaleX(0.88)",
        }}
      >
        {char}
      </span>
    ));
  };

  const renderKzLettersBlock = (text = "AAA", customSize) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          fontFamily: roadLetters.has(char)
            ? "RoadNumbers"
            : "Franklin Gothic Medium, Arial Narrow, Arial, sans-serif",
          fontSize: customSize
            ? customSize
            : roadLetters.has(char)
              ? "95px"
              : "73px",
          transform: roadLetters.has(char) ? "scaleX(1)" : "scaleX(0.88)",
          marginTop: roadLetters.has(char) ? "" : "10px",
        }}
      >
        {char}
      </span>
    ));
  };

  const renderRuLetters = (text = "AAA") => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          fontFamily: roadLetters.has(char)
            ? "RoadNumbers"
            : "Franklin Gothic Medium, Arial Narrow, Arial, sans-serif",
          fontSize: roadLetters.has(char) ? "80px" : "59px",
          transform: roadLetters.has(char) ? "scaleX(1)" : "scaleX(0.88)",
          marginTop: roadLetters.has(char) ? "0px" : "9px",
        }}
      >
        {char}
      </span>
    ));
  };

  const renderRuLettersBlock = (text = "AAA", customSize) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        style={{
          display: "inline-block",
          fontFamily: roadLetters.has(char)
            ? "RoadNumbers"
            : "Franklin Gothic Medium, Arial Narrow, Arial, sans-serif",
          fontSize: customSize
            ? customSize
            : roadLetters.has(char)
              ? "115px"
              : "85px",
          transform: roadLetters.has(char) ? "scaleX(1)" : "scaleX(0.88)",
          marginTop: roadLetters.has(char) ? "-15px" : "",
        }}
      >
        {char}
      </span>
    ));
  };

  const handleOpenModalWithValidation = () => {
    if (country === "KG") {
      if (kgType === "classic") {
        if (!digits.trim() || !letters.trim()) {
          toast.error("⚠️ Пожалуйста, заполните цифры и буквы для номера!");
          return;
        }
        if (digits.length < 3 || letters.length < 3) {
          toast.error("⚠️ Обычный номер должен состоять из 3 цифр и 3 букв!");
          return;
        }
      } else if (kgType === "named") {
        if (!namedText.trim()) {
          toast.error("⚠️ Введите текст для именного номера!");
          return;
        }
        // Изменено условие: минимальная длина теперь 3 буквы вместо 2
        if (namedText.length < 3) {
          toast.error("⚠️ Именной номер должен быть не короче 3 символов!");
          return;
        }
      } else if (kgType === "old") {
        const requiredLettersCount = oldStyle === "style1" ? 3 : 2;
        if (!digits.trim() || !letters.trim()) {
          toast.error("⚠️ Заполните все поля старого номера!");
          return;
        }
        if (digits.length < 4 || letters.length < requiredLettersCount) {
          toast.error(
            `⚠️ Старый номер требует 4 цифры и ${requiredLettersCount} буквы для этого стиля!`,
          );
          return;
        }
      }
    }

    if (country === "KZ") {
      if (!region.trim() || !digits.trim() || !letters.trim()) {
        toast.error(
          "⚠️ Заполните регион, цифры и буквы для казахстанского номера!",
        );
        return;
      }
      if (region.length < 2 || digits.length < 3 || letters.length < 3) {
        toast.error(
          "⚠️ Проверьте формат: регион (2 цифры), цифры (3) и буквы (3)!",
        );
        return;
      }
    }

    if (country === "RU") {
      if (!region.trim() || !digits.trim() || !letters.trim()) {
        toast.error(
          "⚠️ Заполните регион, цифры и буквы для российского номера!",
        );
        return;
      }
      if (letters.length < 3 || digits.length < 3 || region.length < 2) {
        toast.error(
          "⚠️ Проверьте формат: российские номера состоят из 3 букв, 3 цифр и кода региона!",
        );
        return;
      }
    }

    setShowModal(true);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    let countryName = "Российский 🇷🇺";
    if (country === "KG") countryName = "Кыргызский 🇰🇬";
    if (country === "KZ") countryName = "Казахский 🇰🇿";

    let combinationText = "";
    if (country === "KG") {
      if (kgType === "classic") {
        combinationText = `${region} ${digits} ${letters} (Обычный)`;
      } else if (kgType === "named") {
        combinationText = `${namedText} (Именной)`;
      } else {
        const oldStyleText =
          oldStyle === "style1" ? "Буква спереди" : "Только сзади";
        combinationText = `${digits} ${letters} (Старый стиль: ${oldStyleText})`;
      }
    } else {
      combinationText = `${region} ${digits} ${letters}`;
    }

    const message = `
🚨 <b>НОВЫЙ ЗАКАЗ НА НОМЕР</b> 🚨
━━━━━━━━━━━━━━━━━

🌍 <b>Регион:</b> ${countryName}
📐 <b>Размер:</b> ${plateSize === "classic" ? "Широкий" : "Квадратный"}
🔢 <b>Комбинация:</b> ${combinationText}
💵 <b>Цена:</b> ${calculateDynamicPrice()}

━━━━━━━━━━━━━━━━━
👤 <b>Связь:</b> ${contactMethod === "telegram" ? "Telegram ✈️" : "WhatsApp 💬"}
🔗 <b>Контакты:</b> ${contactUsername}
🤳🏻 <b>Мастер:</b> @ffeedu
  `.trim();

    const BOT_TOKEN = "8735673140:AAHT5xSLgnazXY56Q_miz-_XWilPnOL2ydQ";
    const CHAT_ID = "-1003760647498";

    const toastId = toast.loading("Отправка заказа... Пожалуйста, подождите.");

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );

      if (response.ok) {
        toast.update(toastId, {
          render:
            "🚀 Заявка успешно отправлена! Мастера скоро свяжутся с вами.",
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });

        setShowModal(false);
        setDigits("");
        setLetters("");
        setNamedText("");
        setContactUsername("");
      } else {
        const errorData = await response.json();
        console.error("Ошибка Telegram API:", errorData);

        toast.update(toastId, {
          render: `❌ Ошибка: ${errorData.description || "Проверьте настройки бота."}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "🌐 Произошла ошибка сети. Проверьте интернет-соединение.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  return (
    <div className={scss.platePage}>
      <div className={scss.container}>
        <h1>🆔 Конструктор Гос. Номеров</h1>
        <p className={scss.subtitle}>
          Создай свой уникальный номер за пару кликов
        </p>

        {/* 1. Выбор страны */}
        <div className={scss.section}>
          <label>Выбери страну номера:</label>
          <div className={scss.tabs}>
            <button
              className={country === "KG" ? scss.active : ""}
              onClick={() => {
                setCountry("KG");
                setKgType("classic");
                setDigits("");
                setLetters("");
                setNamedText("");
              }}
            >
              Кыргызстан 🇰🇬
            </button>
            <button
              className={country === "KZ" ? scss.active : ""}
              onClick={() => {
                setCountry("KZ");
                setRegion("01");
                setDigits("");
                setLetters("");
                setPlateSize("classic");
              }}
            >
              Казахстан 🇰🇿
            </button>
            <button
              className={country === "RU" ? scss.active : ""}
              onClick={() => {
                setCountry("RU");
                setRegion("77");
                setDigits("");
                setLetters("");
                setPlateSize("classic");
              }}
            >
              Россия 🇷🇺
            </button>
          </div>
        </div>

        {/* 2. Подкатегории для Кыргызстана */}
        {country === "KG" && (
          <div className={scss.section}>
            <label>Тип государственного номера:</label>
            <div className={scss.subTabs}>
              <button
                className={kgType === "classic" ? scss.activeSub : ""}
                onClick={() => {
                  setKgType("classic");
                  setDigits("");
                  setLetters("");
                }}
              >
                Обычный
              </button>
              <button
                className={kgType === "named" ? scss.activeSub : ""}
                onClick={() => {
                  setKgType("named");
                  setNamedText("");
                  setPlateSize("classic"); // Принудительно сбрасываем на широкий формат
                }}
              >
                Именной
              </button>
              <button
                className={kgType === "old" ? scss.activeSub : ""}
                onClick={() => {
                  setKgType("old");
                  setDigits("");
                  setLetters("");
                }}
              >
                Старая версия
              </button>
            </div>
          </div>
        )}

        {/* 3. Инпуты ввода комбинаций */}
        <div className={scss.inputsForm}>
          <h3>Настройка комбинации</h3>

          {/* ОБЫЧНЫЙ КГ / КАЗАХСТАН / РОССИЯ */}
          {((country === "KG" && kgType === "classic") ||
            country === "KZ" ||
            country === "RU") && (
            <div className={scss.inputsGrid}>
              <div className={scss.inputBox}>
                <label>Регион (Не влияет на цену)</label>
                {country === "KG" ? (
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={country === "KZ" ? "01" : "000"}
                    value={region}
                    onChange={(e) =>
                      setRegion(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, country === "RU" ? 3 : 2),
                      )
                    }
                  />
                )}
              </div>

              <div className={scss.inputBox}>
                <label>Цифры (макс. 3)</label>
                <input
                  type="text"
                  placeholder="000"
                  value={digits}
                  onChange={(e) => handleDigitsChange(e, 3)}
                />
              </div>

              <div className={scss.inputBox}>
                <label>Буквы (ENG, макс. 3)</label>
                <input
                  type="text"
                  placeholder="AAA"
                  value={letters}
                  onChange={(e) => handleLettersChange(e, 3)}
                />
              </div>
            </div>
          )}

          {/* ИМЕННОЙ КГ */}
          {isNamedKg && (
            <div
              className={scss.inputsGrid}
              style={{ gridTemplateColumns: "1fr 2fr" }}
            >
              <div className={scss.inputBox}>
                <label>Регион</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {[
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className={scss.inputBox}>
                <label>Текст номера (Только ENG буквы, макс. 7)</label>
                <input
                  type="text"
                  placeholder="NAME"
                  value={namedText}
                  onChange={handleNamedChange}
                />
              </div>
            </div>
          )}

          {/* СТАРЫЙ КГ */}
          {country === "KG" && kgType === "old" && (
            <div
              className={scss.inputsGrid}
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <div className={scss.inputBox}>
                <label>Стиль старого номера</label>
                <select
                  value={oldStyle}
                  onChange={(e) => {
                    setOldStyle(e.target.value);
                    setDigits("");
                    setLetters("");
                  }}
                >
                  <option value="style1">Б 1234 АБ (С буквой спереди)</option>
                  <option value="style2">1234 АБ (Только сзади)</option>
                </select>
              </div>
              <div className={scss.inputBox}>
                <label>Цифры (макс. 4)</label>
                <input
                  type="text"
                  placeholder="1234"
                  value={digits}
                  onChange={(e) => handleDigitsChange(e, 4)}
                />
              </div>
              <div className={scss.inputBox}>
                <label>Буквы (ENG)</label>
                <input
                  type="text"
                  placeholder={oldStyle === "style1" ? "AAB" : "AB"}
                  value={letters}
                  onChange={(e) =>
                    handleLettersChange(e, oldStyle === "style1" ? 3 : 2)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Визуальное превью номера и КНОПКИ РАЗМЕРА */}
        <div className={scss.previewSection}>
          <div className={scss.previewHeader}>
            <h3>Превью номера:</h3>
            <div className={scss.sizeToggle}>
              <button
                className={plateSize === "classic" ? scss.activeSize : ""}
                onClick={() => setPlateSize("classic")}
              >
                Широкий
              </button>
              <button
                className={plateSize === "square" ? scss.activeSize : ""}
                disabled={country === "KG" && kgType === "named"} // Отключаем для именного KG
                onClick={() => setPlateSize("square")}
                title={
                  country === "KG" && kgType === "named"
                    ? "Именные номера не бывают квадратными"
                    : ""
                }
              >
                Квадратный {country === "KG" && kgType === "named" && "🔒"}
              </button>
            </div>
          </div>

          <div className={scss.plateBody}>
            {/* ========================================= */}
            {/* КЫРГЫЗСТАН ОБЫЧНЫЙ */}
            {country === "KG" &&
              kgType === "classic" &&
              (plateSize === "classic" ? (
                /* ШИРОКИЙ KG */
                <div className={scss.kgPlate}>
                  <div className={scss.leftSide}>
                    <span className={scss.regNum}>{region || "01"}</span>
                    <div className={scss.flag}>
                      <img src={kgflag} alt="" />
                      <span>KG</span>
                    </div>
                  </div>
                  <div className={scss.plateText}>
                    <span className={scss.mainTextNum}>{digits || "000"}</span>
                    <span className={scss.mainTextStr}>{letters || "AAA"}</span>
                  </div>
                </div>
              ) : (
                /* КВАДРАТНЫЙ KG */
                <div className={scss.kgPlateSquare}>
                  <div className={scss.squareTop}>
                    <span className={scss.regNum}>{region || "01"}</span>
                    <div className={scss.flag}>
                      <img src={kgflag} alt="" />
                      <span>KG</span>
                    </div>
                  </div>
                  <div className={scss.squareBottom}>
                    <span className={scss.mainTextNum}>{digits || "000"}</span>
                    <span className={scss.mainTextStr}>{letters || "AAA"}</span>
                  </div>
                </div>
              ))}

            {/* ========================================= */}
            {/* КЫРГЫЗСТАН ИМЕННОЙ (ТОЛЬКО ШИРОКИЙ) */}
            {country === "KG" && kgType === "named" && (
              <div className={scss.kgPlate}>
                <div className={scss.leftSide}>
                  <span className={scss.regNum}>{region || "01"}</span>
                  <div className={scss.flag}>
                    <img src={kgflag} alt="" />
                    <span>KG</span>
                  </div>
                </div>
                <div className={scss.plateTextNamed}>
                  <span className={scss.namedMain}>{namedText || "NAME"}</span>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* КЫРГЫЗСТАН СТАРЫЙ */}
            {country === "KG" &&
              kgType === "old" &&
              (plateSize === "classic" ? (
                /* ШИРОКИЙ OLD KG */
                <div className={scss.oldPlate}>
                  <div className={scss.leftSideOld}>
                    <img src={oldflag} alt="" />
                  </div>
                  <div className={scss.plateTextOld}>
                    {oldStyle === "style1" ? (
                      <span className={scss.mainText}>
                        <span>{letters.slice(0, 1) || "A"}</span>
                        <span>{digits || "1234"}</span>
                        <span>{letters.slice(1) || "BC"}</span>
                      </span>
                    ) : (
                      <span className={scss.mainText}>
                        {digits || "1234"} {letters || "AB"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* КВАДРАТНЫЙ OLD KG */
                <div className={scss.oldPlateSquare}>
                  <span className={scss.squareOldDigits}>
                    {digits || "1234"}
                  </span>

                  <div className={scss.bottomSideOld}>
                    <img src={kgflag} alt="" />
                    <span className={scss.squareOldLetters}>
                      {letters || "ABC"}
                    </span>
                  </div>
                </div>
              ))}

            {/* ========================================= */}
            {/* КАЗАХСТАН */}
            {country === "KZ" &&
              (plateSize === "classic" ? (
                /* ШИРОКИЙ KZ */
                <div className={scss.kzPlate}>
                  <div className={scss.leftSide}>
                    <img src={kzflag} alt="" />
                    <span>KZ</span>
                  </div>
                  <div className={scss.centerSide}>
                    <span className={scss.mainText}>
                      {renderKzLetters(digits || "000")}{" "}
                      {renderKzLetters(letters || "AAA")}
                    </span>
                  </div>
                  <div className={scss.rightSide}>
                    <span className={scss.regNum}>{region || "01"}</span>
                  </div>
                </div>
              ) : (
                /* КВАДРАТНЫЙ KZ */
                <div className={scss.kzPlateSquare}>
                  <div className={scss.kzSquareLeft}>
                    <div className={scss.flagBox}>
                      <img src={kzflag} alt="" />
                      <span>KZ</span>
                    </div>
                    <div className={scss.regionBox}>
                      <span className={scss.regNum}>{region || "01"}</span>
                    </div>
                  </div>
                  <div className={scss.kzSquareRight}>
                    <div className={scss.digitsBox}>
                      {renderKzLettersBlock(digits || "000")}
                    </div>
                    <div className={scss.lettersBox}>
                      {renderKzLettersBlock(letters || "AAA")}
                    </div>
                  </div>
                </div>
              ))}

            {/* ========================================= */}
            {/* РОССИЯ */}
            {country === "RU" &&
              (plateSize === "classic" ? (
                /* ШИРОКИЙ RU */
                <div className={scss.ruPlate}>
                  <span className={scss.mainText}>
                    <span>{renderRuLetters(letters.slice(0, 1) || "A")}</span>
                    <span>{renderRuLetters(digits || "000")}</span>
                    <span>{renderRuLetters(letters.slice(1) || "AA")}</span>
                  </span>

                  <div className={scss.rightSideRu}>
                    <span
                      className={
                        region.length === 3 ? scss.regNumThree : scss.regNum
                      }
                    >
                      {region || "77"}
                    </span>
                    <div className={scss.ruFlagBlock}>
                      <span>RUS</span>
                      <img src={ruflag} alt="" />
                    </div>
                  </div>
                </div>
              ) : (
                /* КВАДРАТНЫЙ RU */
                <div className={scss.ruPlateSquare}>
                  <div className={scss.ruSquareTop}>
                    <span className={scss.ruStr}>
                      {renderRuLettersBlock(letters.slice(0, 1) || "A")}
                    </span>
                    <span className={scss.ruNum}>
                      {renderKzLettersBlock(digits || "000")}
                    </span>
                  </div>
                  <div className={scss.ruSquareBottom}>
                    <span className={scss.ruStr}>
                      {renderRuLettersBlock(letters.slice(1) || "AA")}
                    </span>
                    <div className={scss.regFlagBlock}>
                      <span
                        className={
                          region.length === 3
                            ? scss.regNumThreeSquare
                            : scss.regNumSquare
                        }
                      >
                        {region || "77"}
                      </span>
                      <div className={scss.ruFlagBlock}>
                        <span>RUS</span>
                        <img src={ruflag} alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 5. Динамическая цена и кнопка заказа */}
        <div className={scss.priceBlock}>
          <div className={scss.priceInfo}>
            <span>Итоговая цена услуги:</span>
            <h2>{calculateDynamicPrice()}</h2>
          </div>
          <button
            className={scss.orderBtn}
            onClick={handleOpenModalWithValidation}
          >
            Заказать номер
          </button>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className={scss.modalOverlay}>
          <div className={scss.modalContent}>
            <h3>📋 Способ обратной связи</h3>
            <p>
              Укажите свои контакты, чтобы мастер детейлинга смог связаться с
              вами для изготовление номера.
            </p>
            <form onSubmit={handleOrderSubmit}>
              <div className={scss.modalTabs}>
                <button
                  type="button"
                  className={
                    contactMethod === "telegram" ? scss.activeModalTab : ""
                  }
                  onClick={() => {
                    setContactMethod("telegram");
                    setContactUsername("");
                  }}
                >
                  Telegram ✈️
                </button>
                <button
                  type="button"
                  className={
                    contactMethod === "whatsapp" ? scss.activeModalTab : ""
                  }
                  onClick={() => {
                    setContactMethod("whatsapp");
                    setContactUsername("");
                  }}
                >
                  WhatsApp 💬
                </button>
              </div>
              <div className={scss.modalInputBox}>
                <label>
                  {contactMethod === "telegram"
                    ? "Ваш Telegram Username (например: @username)"
                    : "Номер телефона WhatsApp (с кодом страны)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    contactMethod === "telegram"
                      ? "@cpm_driver"
                      : "+996 777 123 456"
                  }
                  value={contactUsername}
                  onChange={(e) => setContactUsername(e.target.value)}
                />
              </div>
              <div className={scss.modalActions}>
                <button
                  type="button"
                  className={scss.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className={scss.confirmBtn}>
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberMaster;
