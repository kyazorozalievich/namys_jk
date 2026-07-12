import React, { useEffect, useState, useMemo } from "react";
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot } from "firebase/firestore";
import scss from "./MembersAbout.module.scss";
import { FaUsers } from "react-icons/fa";

const MembersAbout = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "clan_members"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ fireId: doc.id, ...doc.data() });
        });
        setMembers(data);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.rating === "Officer" && b.rating !== "Officer") return -1;
      if (a.rating !== "Officer" && b.rating === "Officer") return 1;
      return 0;
    });
  }, [members]);

  if (loading) return null;

  return (
    <section className={scss.memberSec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            <span aria-hidden="true">
              <FaUsers />
            </span>{" "}
            Участники ({members.length})
          </h2>
          <div className={scss.membersTable}>
            {sortedMembers.map((el) => (
              <article
                key={el.fireId}
                className={el.rating === "Officer" ? scss.off : scss.mem}
              >
                <img
                  src={el.profile}
                  alt={`Участник клана ${el.nickname}`}
                  loading="lazy"
                />
                <div className={scss.text}>
                  <h3>
                    {el.nickname} <span>{el.rating}</span>
                  </h3>
                  <h4>{el.gosNom}</h4>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembersAbout;
