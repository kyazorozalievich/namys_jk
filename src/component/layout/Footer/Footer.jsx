import React from "react";
import scss from "./Footer.module.scss";
import fullogo from "../../../data/images/fullogo.png";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={scss.footer}>
      <div className="container">
        <div className={scss.nav}>
          <div className={scss.mainDatas}>
            <div className={scss.logoBlock}>
              <img src={fullogo} alt="Логотип клана Namys JK" />
              <p className={scss.description}>
                - Клан <span>Namys JK</span> <br /> <br />
                - Car Parking Multiplayer <br /> <br />- Кыргызстан
              </p>
              <span className={scss.lider}>
                - Основатель: <span>KEKA</span>
              </span>
            </div>

            <div className={scss.navigationBlock}>
              <h3>Навигация</h3>
              <NavLink to="/">Главная</NavLink>
              <NavLink to="/about">О Клане</NavLink>
              <NavLink to="/detailing">Мастерская</NavLink>
              <NavLink to="/shop">Авторынок</NavLink>
            </div>

            <div className={scss.contactBlock}>
              <h3>Контакты</h3>
              <a
                href="https://t.me/kka_07"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram основателя"
              >
                Telegram: <span>@kka_07</span>
              </a>
              <a
                href="https://www.tiktok.com/@keka_xl55"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tik Tok аккаунт"
              >
                Tik Tok: <span>@keka_xl55</span>
              </a>
              <a
                href="https://www.instagram.com/namys_jk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram аккаунт клана"
              >
                Instagram: <span>@namys_jk</span>
              </a>
            </div>
          </div>
          <p className={scss.copyright}>
            © 2026 NAMYS JK · Mental RPM → Mental Gang → Namys JK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
