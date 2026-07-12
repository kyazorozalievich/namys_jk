import React from "react";
import scss from "./Stats.module.scss";
import { FaUsers } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";
import { HiMiniShoppingCart } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const Stats = () => {
  const navigate = useNavigate();

  const handleKeyPress = (e, path) => {
    if (e.key === "Enter" || e.key === " ") {
      navigate(path);
    }
  };

  return (
    <section className={scss.statsSec} aria-label="Статистика и разделы">
      <div className="container">
        <nav className={scss.nav} aria-label="Быстрая навигация">
          <div
            className={scss.block}
            onClick={() => navigate("/about")}
            onKeyDown={(e) => handleKeyPress(e, "/about")}
            role="button"
            tabIndex={0}
          >
            <span className={scss.iconWrapper} aria-hidden="true">
              <FaUsers />
            </span>
            <h2>Сообщество</h2>
            <p>15+ преданных участников, лидеры и братство</p>
          </div>

          <div
            className={scss.block}
            onClick={() => navigate("/detailing")}
            onKeyDown={(e) => handleKeyPress(e, "/detailing")}
            role="button"
            tabIndex={0}
          >
            <span className={scss.iconWrapper} aria-hidden="true">
              <IoCarSportSharp />
            </span>
            <h2>Услуги</h2>
            <p>Номера, шильдики, тюнинг от GG-мастеров</p>
          </div>

          <div
            className={scss.block}
            onClick={() => navigate("/shop")}
            onKeyDown={(e) => handleKeyPress(e, "/shop")}
            role="button"
            tabIndex={0}
          >
            <span className={scss.iconWrapper} aria-hidden="true">
              <HiMiniShoppingCart />
            </span>
            <h2>Маркет</h2>
            <p>Продажа автомобилей разного вида</p>
          </div>
        </nav>
      </div>
    </section>
  );
};

export default Stats;
