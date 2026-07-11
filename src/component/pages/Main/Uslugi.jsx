import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./Uslugi.module.scss";
import { BsStars } from "react-icons/bs";

const USLUGI_BASE = [
  {
    id: "plates",
    title: "Изготовление гос номеров",
    path: "/detailing/plates",
    icon: "🆔",
  },
  {
    id: "gg_services",
    title: "Всем известные GG услуги",
    path: "/detailing/gg",
    icon: "✨",
  },
  {
    id: "badges",
    title: "Шильдики и таблички на любую машину",
    path: "/detailing/badges",
    icon: "🚘",
  },
  // {
  //   id: "market",
  //   title: "Продажа авто и аккаунтов",
  //   path: "/shop/car",
  //   icon: "💰",
  // },
  {
    id: "branding",
    title: "Логотипы и брендинг кланов",
    path: "/detailing/branding",
    icon: "🛡️",
  },
  {
    id: "montage",
    title: "Фото- и видеомонтажи тачек",
    path: "/detailing/montage",
    icon: "🎬",
  },
];

const Uslugi = () => {
  const navigate = useNavigate();
  const [servicesStatus, setServicesStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "detailing_services"),
      (snapshot) => {
        const statuses = {};
        snapshot.forEach((doc) => {
          statuses[doc.id] = doc.data().active;
        });
        setServicesStatus(statuses);
        setLoading(false);
      },
      (error) => {
        console.error("Ошибка при получении статусов услуг:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleCardClick = (path, id) => {
    if (servicesStatus[id] === false) return;
    navigate(path);
  };

  if (loading) {
    return (
      <section className={scss.uslugSec}>
        <div className="container">
          <div className={scss.loadingText}>Загрузка списка услуг...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={scss.uslugSec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            <span>
              <BsStars />
            </span>
            Наши Услуги
          </h2>

          <div className={scss.usBlocks}>
            {USLUGI_BASE.map((service) => {
              const isActive = servicesStatus[service.id] !== false;

              return (
                <div
                  key={service.id}
                  className={`${scss.usCard} ${!isActive ? scss.disabled : ""}`}
                  onClick={() => handleCardClick(service.path, service.id)}
                  style={{ cursor: isActive ? "pointer" : "not-allowed" }}
                >
                  {!isActive && (
                    <div className={scss.overlayDisabled}>
                      <span>🔒 Недоступно</span>
                    </div>
                  )}

                  <div className={scss.cardContent}>
                    {/* Блок с иконкой-смайликом */}
                    <div className={scss.iconBlock}>{service.icon}</div>
                    <h3>{service.title}</h3>
                  </div>

                  {/* Кнопка действия видна только у активных карточек */}
                  {isActive && (
                    <button className={scss.orderButton}>
                      Заказать услугу
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Uslugi;
