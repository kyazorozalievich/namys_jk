import React, { useEffect, useState } from "react";
import scss from "./LiderMain.module.scss";
import { FaCrown } from "react-icons/fa";
import { GiLaurelCrown } from "react-icons/gi";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";

const LiderMain = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "clan_leaders"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ fireId: doc.id, ...doc.data() });
        });
        setLeaders(data);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className={scss.liderSec}>
        <div className="container">
          <p>Загрузка лидеров...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={scss.liderSec}>
      <div className="container">
        <div className={scss.nav}>
          <header className={scss.headerText}>
            <h5>
              <FaCrown />
              Администрация
            </h5>
            <h2>ЛИДЕРЫ КЛАНА</h2>
          </header>

          <div className={scss.lidersBlocks}>
            {leaders.map((el) => (
              <article className={scss.liderBlock} key={el.fireId}>
                <span>
                  <GiLaurelCrown className={scss.crwn} />
                  LEADER
                </span>
                <img
                  src={el.profile}
                  alt={`Лидер клана ${el.nickname}`}
                  loading="lazy"
                />
                <h3>{el.nickname}</h3>
                <div className={scss.id}>ID: {el.id}</div>
                <div className={scss.gosNom}>{el.gosNom}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiderMain;
