import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./Uslugi.module.scss";
import { BsStars } from "react-icons/bs";
import nomUsluga from "../../../data/images/number_usluga.png";
import ggUsluga from "../../../data/images/gg_usluga.png";
import logoUsluga from "../../../data/images/logo_usluga.png";

const USLUGI_BASE = [
  {
    id: "plates",
    title: "Изготовление гос номеров",
    path: "/detailing/plates",
    icon: nomUsluga,
  },
  {
    id: "gg_services",
    title: "Всем известные GG услуги",
    path: "/detailing/gg",
    icon: ggUsluga,
  },
  {
    id: "badges",
    title: "Шильдики и таблички на любую машину",
    path: "/detailing/badges",
    icon: logoUsluga,
  },
  {
    id: "branding",
    title: "Логотипы и брендинг кланов",
    path: "/detailing/branding",
    icon: logoUsluga,
  },
  {
    id: "montage",
    title: "Фото- и видеомонтажи тачек",
    path: "/detailing/montage",
    icon: logoUsluga,
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
                <article
                  key={service.id}
                  className={`${scss.usCard} ${!isActive ? scss.disabled : ""}`}
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
                      alt={`Иконка услуги: ${service.title}`}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Uslugi;
