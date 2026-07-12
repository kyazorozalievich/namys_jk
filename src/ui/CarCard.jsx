import React from "react";
import scss from "./CarCard.module.scss";
import { MdVerified } from "react-icons/md";
import { RiVipCrownFill } from "react-icons/ri";

const CarCard = ({ car, onOpenModal }) => {
  const mainImage =
    car.images?.length > 0
      ? car.images[0]
      : "https://via.placeholder.com/240x160?text=No+Photo";
  const isAdmin = car.authorRole === "admin";
  const isVip = car.isVip;
  const cardStatusClass = isAdmin ? scss.adminCard : isVip ? scss.vipCard : "";

  return (
    <article className={`${scss.card} ${cardStatusClass}`}>
      <div className={scss.cardImg}>
        <img src={mainImage} alt={car.title} loading="lazy" />

        {car.verified && (
          <div className={scss.verifiedIcon} title="Проверено администрацией">
            <MdVerified />
          </div>
        )}

        {isVip && !isAdmin && (
          <div className={scss.crownIcon} title="VIP Объявление">
            <RiVipCrownFill />
          </div>
        )}

        <div className={scss.badges}>
          {isAdmin && <span className={scss.adminBadge}>КЛАН LDR</span>}
        </div>
      </div>

      <div className={scss.cardInfo}>
        <div className={scss.cardHeader}>
          <div>
            <h3>{car.title}</h3>
            <span className={scss.type}>{car.carType || "Седан"}</span>
          </div>
          {car.brand && <span className={scss.brand}>{car.brand}</span>}
        </div>

        <p className={scss.description}>
          {car.description
            ? `${car.description.slice(0, 40)}...`
            : "Нет описания"}
        </p>

        <div className={scss.bottom}>
          <h2>
            <span>Цена:</span> {car.price}
            {car.currency === "С Сом" && " C"}
            {car.currency === "Т Тенге" && " ₸"}
            {car.currency === "₽ Рубли" && " ₽"}
            {car.currency === "stars" && " ⭐️"}
            {car.currency === "$ USD" && " $"}
            {!["С Сом", "Т Тенге", "₽ Рубли", "stars", "$ USD"].includes(
              car.currency,
            ) &&
              (car.currency?.includes("Сом")
                ? " Сом"
                : car.currency?.includes("Тенге")
                  ? " ₸"
                  : car.currency?.includes("Рубли")
                    ? " ₽"
                    : ` ${car.currency || "$"}`)}
          </h2>

          <button onClick={() => onOpenModal(car)}>Посмотреть</button>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
