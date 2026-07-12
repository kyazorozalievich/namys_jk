import React from "react";
import scss from "./HistoryAbout.module.scss";

const HistoryAbout = () => {
  return (
    <section className={scss.historySec}>
      <div className="container">
        <article className={scss.nav}>
          <h1>Через трудности — к успеху</h1>
          <p>
            Каждый клан проходит огонь и воду. Мы начинали как небольшая команда
            друзей <span>Mental RPM</span>, через расколы и предательства
            превратились в <span>Mental Gang</span>, и наконец, переосмыслив
            свои ценности, стали <span>Namys JK</span>. «Намыс» — честь
            по-кыргызски.
          </p>
          <p>
            Мы пережили потерю участников, конкуренцию, падение мотивации.
            Каждый раз поднимались сильнее. Сегодня — это семья, построенная на
            доверии, общем стиле и любви к авто.
          </p>
        </article>
      </div>
    </section>
  );
};

export default HistoryAbout;
