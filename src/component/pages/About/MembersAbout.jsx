import React, { useEffect, useState } from "react";
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

  if (loading) return null;

  return (
    <section className={scss.memberSec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            <span>
              <FaUsers />
            </span>{" "}
            Участники ({members.length})
          </h2>
          <div className={scss.membersTable}>
            {members
              .sort((a, b) => {
                if (a.rating === "Officer" && b.rating !== "Officer") return -1;
                if (a.rating !== "Officer" && b.rating === "Officer") return 1;
                return 0;
              })
              .map((el) => (
                <div
                  key={el.fireId}
                  className={el.rating === "Officer" ? scss.off : scss.mem}
                >
                  <img src={el.profile} alt="" />
                  <div className={scss.text}>
                    <h2>
                      {el.nickname} <span>{el.rating}</span>
                    </h2>
                    <h4>{el.gosNom}</h4>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembersAbout;
