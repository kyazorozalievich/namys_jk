import React from "react";
import scss from "./AboutMain.module.scss";

const AboutMain = () => {
  return (
    <section className={scss.mainSec}>
      <div className={scss.bg}>
        <div className="container">
          <div className={scss.nav}>
            <h1>
              Namys <span>JK</span>
            </h1>
            <p>
              Добро пожаловать в наш мир <br /> Тут ты подробнее познакомишься с
              нашим кланом
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMain;
