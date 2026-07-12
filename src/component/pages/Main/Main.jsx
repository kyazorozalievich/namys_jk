import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocation } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import logo from "../../../data/images/logo.png";
import scss from "./Main.module.scss";

const Main = () => {
  const navigate = useNavigate();

  return (
    <section className={scss.mainSec}>
      <div className={scss.bg}>
        <div className="container">
          <div className={scss.nav}>
            <div className={scss.text}>
              <p className={scss.location}>
                <IoLocation /> Кыргызстан · Car Parking Multiplayer
              </p>
              <h1>
                <span>Namys</span> <br /> JK Clan
              </h1>
              <p className={scss.description}>
                Большая история, большие успехи <br />
                приветствуем всех кто пришел в наш мир
              </p>
              <div className={scss.buttons}>
                <button className={scss.btn1} onClick={() => navigate("/shop")}>
                  Авторынок
                </button>
                <button
                  className={scss.btn2}
                  onClick={() => navigate("/about")}
                >
                  О Клане <FaChevronRight />
                </button>
              </div>
            </div>
            <img
              src={logo}
              alt="Логотип клана Namys JK"
              className={scss.logoImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Main;
