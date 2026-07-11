import React, { useEffect, useState } from "react";
import scss from "./LiderMain.module.scss";
import { FaCrown } from "react-icons/fa";
import { GiLaurelCrown } from "react-icons/gi";
// Импортируем базу данных Firebase (проверь правильность пути к файлу FireBase)
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";

const LiderMain = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подключаемся к коллекции "clan_leaders" в реальном времени
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

  // Пока данные загружаются, ничего не рендерим (или можно поставить спиннер)
  if (loading) return null;

  return (
    <section className={scss.liderSec}>
      <div className="container">
        <div className={scss.nav}>
          <h5>
            <FaCrown />
            Администрация
          </h5>
          <h2>ЛИДЕРЫ КЛАНА</h2>
          <div className={scss.lidersBlocks}>
            {leaders.map((el) => (
              <div className={scss.liderBlock} key={el.fireId}>
                             <span>
                               <GiLaurelCrown className={scss.crwn} />
                               LEADER
                             </span>
                             <img src={el.profile} alt={el.nickname} />
                             <h3>{el.nickname}</h3>
                             <div className={scss.id}>ID: {el.id}</div>
                             <div className={scss.gosNom}>{el.gosNom}</div>
                           </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiderMain;
