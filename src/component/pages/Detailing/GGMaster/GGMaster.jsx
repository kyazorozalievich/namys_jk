import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/FireBase";
import { doc, onSnapshot } from "firebase/firestore";
import scss from "./GGMaster.module.scss";

// ТОКЕНЫ ДЛЯ ТЕЛЕГРАМ-БОТА (Замени на свои реальные данные)
const TG_BOT_TOKEN = "8735673140:AAHT5xSLgnazXY56Q_miz-_XWilPnOL2ydQ";
const TG_CHAT_ID = "-1004264787911"; // Например, -100xxxxxxxxx
const TG_GROUP_LINK = "https://t.me/gg_namysjk"; // Ссылка на твою ТГ группу

const INITIAL_GG_SERVICES = {
  coin_car: {
    title: "За коины",
    priceRub: "20",
    priceStars: "15",
    active: true,
    cat: "cars",
  },
  don_car: {
    title: "Дон авто",
    priceRub: "30",
    priceStars: "15",
    active: true,
    cat: "cars",
  },
};

const GGMaster = () => {
  const [ggList, setGgList] = useState(INITIAL_GG_SERVICES);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "detailing_config", "services_masters"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.gg_services?.ggList) setGgList(data.gg_services.ggList);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Ошибка загрузки данных:", err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  // Функция отправки уведомления в Телеграм и перехода по ссылке
  const handleTelegramRedirect = async () => {
    setIsSending(true);
    const message = `🔔 **Новый клиент!**\nКто-то нажал кнопку "Связаться с GG мастерами" на сайте и переходит в группу за услугами. Будьте готовы!`;

    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    } catch (error) {
      console.error("Не удалось отправить уведомление ботом:", error);
    } finally {
      setIsSending(false);
      setIsModalOpen(false);
      // Перенаправляем пользователя в группу
      window.open(TG_GROUP_LINK, "_blank", "noreferrer");
    }
  };

  if (loading)
    return <div className={scss.loader}>Загрузка конфигурации GG...</div>;

  const activeCars = Object.values(ggList).filter(
    (item) => item.active && item.cat === "cars",
  );
  const activeTuning = Object.values(ggList).filter(
    (item) => item.active && item.cat === "tuning",
  );

  return (
    <div className={scss.profilePage}>
      <div className={scss.mainCard}>
        {/* Шапка */}
        <div className={scss.headerSection}>
          <h1 className={scss.mainTitle}>🛠️ Всем известные GG услуги</h1>
          <p className={scss.description}>
            Актуальный прайс-лист на кастомизацию, тюнинг и прокачку авто от
            наших мастеров.
          </p>
        </div>

        {/* СЕКЦИЯ 1: ЦЕНЫ НА АВТО */}
        {activeCars.length > 0 && (
          <div className={scss.sectionBlock}>
            <h2 className={scss.blockTitle}>💰 Цены на автомобили</h2>
            <div className={scss.grid}>
              {activeCars.map((item, idx) => (
                <div key={idx} className={scss.item}>
                  <h3>{item.title}</h3>
                  <div className={scss.priceRow}>
                    <span className={scss.rub}>{item.priceRub} Сом</span>
                    <span className={scss.stars}>{item.priceStars} ★ TG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* СЕКЦИЯ 2: ЦЕНЫ НА ТЮНИНГ */}
        {activeTuning.length > 0 && (
          <div className={scss.sectionBlock}>
            <h2 className={scss.blockTitle}>🚀 Характеристики & Улучшения</h2>
            <div className={scss.grid}>
              {activeTuning.map((item, idx) => (
                <div key={idx} className={scss.item}>
                  <h3>{item.title}</h3>
                  <div className={scss.priceRow}>
                    <span className={scss.som}>{item.priceRub} Сом</span>
                    <span className={scss.stars}>{item.priceStars} ★ TG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ОБЩАЯ КНОПКА СВЯЗИ СНИЗУ */}
        <div className={scss.actionContainer}>
          <button className={scss.addCar} onClick={() => setIsModalOpen(true)}>
            💬 Связаться с GG мастерами
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {isModalOpen && (
        <div
          className={scss.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={scss.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Наши GG мастера в Telegram!</h2>
            <p>
              Все заказы принимаются в нашей официальной Телеграм группе. После
              нажатия кнопки вас перенаправит туда, а мастера получат сигнал о
              новом клиенте.
            </p>
            <div className={scss.modalActions}>
              <button
                className={scss.cancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Отмена
              </button>
              <button
                className={scss.telegramBtn}
                onClick={handleTelegramRedirect}
                disabled={isSending}
              >
                {isSending ? "Запуск..." : "Перейти в группу"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GGMaster;
