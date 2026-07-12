import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./DetailingPage.module.scss";
import nomUsluga from "../../../data/images/number_usluga.png";
import ggUsluga from "../../../data/images/gg_usluga.png";
import logoUsluga from "../../../data/images/logo_usluga.png";

const SERVICE_BASE = [
  {
    id: "plates",
    title: "Изготовление гос номеров",
    path: "/detailing/plates",
    icon: nomUsluga,
    altText: "Изготовление автомобильных гос номеров",
  },
  {
    id: "gg_services",
    title: "Всем известные GG услуги",
    path: "/detailing/gg",
    icon: ggUsluga,
    altText: "GG услуги для автомобилей",
  },
  {
    id: "badges",
    title: "Шильдики и таблички на любую машину",
    path: "/detailing/badges",
    icon: logoUsluga,
    altText: "Создание автомобильных шильдиков и табличек",
  },
  {
    id: "branding",
    title: "Логотипы и брендинг кланов",
    path: "/detailing/branding",
    icon: logoUsluga,
    altText: "Разработка логотипов и брендинга для кланов",
  },
  {
    id: "montage",
    title: "Фото- и видеомонтажи тачек",
    path: "/detailing/montage",
    icon: logoUsluga,
    altText: "Профессиональный фото и видеомонтаж автомобилей",
  },
];

const DetailingPage = () => {
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
    );

    return () => unsubscribe();
  }, []);

  const handleCardClick = (path, id) => {
    if (servicesStatus[id] === false) return;
    navigate(path);
  };

  if (loading) {
    return <div className={scss.errorAuth}>Загрузка услуг детейлинга...</div>;
  }

  return (
    <main className={scss.profilePage}>
      <div className={scss.card}>
        <header className={scss.top}>
          <div className={scss.userInfo}>
            <h1>🎨 Детейлинг-Центр Car Parking</h1>
            <p>
              Эксклюзивные услуги от лучших мастеров для прокачки твоего
              аккаунта и тачек
            </p>
          </div>
        </header>

        <section className={scss.servicesGrid}>
          {SERVICE_BASE.map((service) => {
            const isActive = servicesStatus[service.id] !== false;

            return (
              <article
                key={service.id}
                className={`${scss.serviceItem} ${!isActive ? scss.disabled : ""}`}
                onClick={() => handleCardClick(service.path, service.id)}
              >
                {!isActive && (
                  <div className={scss.overlayDisabled}>
                    <span>🔒 Недоступно</span>
                  </div>
                )}

                <div className={scss.cardContent}>
                  <img
                    src={service.icon}
                    alt={service.altText}
                    className={scss.iconBlock}
                  />
                  <h3>{service.title}</h3>
                </div>

                {isActive && (
                  <button className={scss.orderButton} type="button">
                    Заказать услугу
                  </button>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default DetailingPage;
