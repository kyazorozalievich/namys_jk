import React from "react";
import scss from "./History.module.scss";
import { GiHorizonRoad } from "react-icons/gi";

const HISTORY_DATA = [
  {
    title: "Mental RPM",
    desc: "Всё началось с маленькой команды энтузиастов, любящих скорость и стиль.",
    num: "01",
  },
  {
    title: "Mental Gang",
    desc: "Команда выросла, появилась репутация в Car Parking и за его пределами.",
    num: "02",
  },
  {
    title: "Namys JK",
    desc: "Сегодня — Namys JK. Гордость, братство, Кыргызстан.",
    num: "03",
  },
];

const History = () => {
  return (
    <section className={scss.historySec}>
      <div className="container">
        <div className={scss.nav}>
          <h5>
            <GiHorizonRoad />
            История
          </h5>
          <h2>НАШ ПУТЬ</h2>

          <div className={scss.historyTitles}>
            {HISTORY_DATA.map((el) => (
              <article key={el.num} className={scss.texts}>
                <span>{el.num}</span>
                <div className={scss.name}>
                  <h3>{el.title}</h3>
                  <p>{el.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
