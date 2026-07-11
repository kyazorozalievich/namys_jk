import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./DetailingPage.module.scss";

const SERVICE_BASE = [
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
  //   title: "Продажа авто",
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

const DetailingPage = () => {
  const navigate = useNavigate();
  const [servicesStatus, setServicesStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подписываемся на статусы услуг в реальном времени из Firestore
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
    );

    return () => unsubscribe();
  }, []);

  const handleCardClick = (path, id) => {
    // Если услуга выключена админом, переход блокируется
    if (servicesStatus[id] === false) return;
    navigate(path);
  };

  if (loading) {
    return <div className={scss.errorAuth}>Загрузка услуг детейлинга...</div>;
  }

  return (
    <div className={scss.profilePage}>
      <div className={scss.card}>
        <div className={scss.top}>
          <div className={scss.userInfo}>
            <h1>🎨 Детейлинг-Центр Car Parking</h1>
            <p>
              Эксклюзивные услуги от лучших мастеров для прокачки твоего
              аккаунта и тачек
            </p>
          </div>
        </div>

        {/* Сетка услуг */}
        <div className={scss.servicesGrid}>
          {SERVICE_BASE.map((service) => {
            const isActive = servicesStatus[service.id] !== false;

            return (
              <div
                key={service.id}
                className={`${scss.serviceItem} ${!isActive ? scss.disabled : ""}`}
                onClick={() => handleCardClick(service.path, service.id)}
              >
                {/* Темный оверлей, если услуга отключена */}
                {!isActive && (
                  <div className={scss.overlayDisabled}>
                    <span>🔒 Недоступно</span>
                  </div>
                )}

                <div className={scss.cardContent}>
                  <div className={scss.iconBlock}>{service.icon}</div>
                  <h3>{service.title}</h3>
                </div>

                {/* Кнопка действия видна только у активных карточек */}
                {isActive && (
                  <button className={scss.orderButton}>Заказать услугу</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailingPage;
