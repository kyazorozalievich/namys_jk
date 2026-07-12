import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./LiderAbout.module.scss";
import { FaCrown } from "react-icons/fa";
import { GiLaurelCrown } from "react-icons/gi";

const LiderAbout = () => {
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

  if (loading) return null;

  return (
    <section className={scss.liderSec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            <span aria-hidden="true">
              <FaCrown />
            </span>
            Лидеры
          </h2>
          <div className={scss.lidersBlocks}>
            {leaders.map((el) => (
              <article className={scss.liderBlock} key={el.fireId}>
                <span className={scss.badge}>
                  <GiLaurelCrown className={scss.crwn} aria-hidden="true" />
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

export default LiderAbout;
