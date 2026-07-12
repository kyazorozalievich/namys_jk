import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/FireBase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import scss from "./UserCars.module.scss";

import { FaTrashAlt, FaHorseHead, FaLayerGroup } from "react-icons/fa";
import { MdVerifiedUser, MdPendingActions } from "react-icons/md";

const UserCars = () => {
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, "cars"),
      where("authorUid", "==", currentUser.uid),
    );

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const carsData = [];
        snapshot.forEach((doc) => {
          carsData.push({ id: doc.id, ...doc.data() });
        });
        setMyCars(carsData);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Ошибка при загрузке ваших объявлений");
        setLoading(false);
      },
    );

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  const handleDelete = async (carId) => {
    try {
      await deleteDoc(doc(db, "cars", carId));
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          adsUsed: increment(-1),
        });
      }
      toast.warning("Объявление успешно удалено!");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить объявление. Попробуйте позже.");
    }
  };

  if (!currentUser) {
    return (
      <div className={scss.infoMessage}>
        <p>Пожалуйста, войдите в систему, чтобы просмотреть свои объявления.</p>
      </div>
    );
  }

  if (loading) {
    return <div className={scss.loader}>Загрузка списка ваших машин...</div>;
  }

  return (
    <section className={scss.userCarsPage}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <header className={scss.headerSection}>
        <div>
          <h1>Мои объявления</h1>
          <p>Управление вашим транспортом на авторынке</p>
        </div>
        <div className={scss.counter}>
          Активных авто: <span>{myCars.length}</span>
        </div>
      </header>

      {myCars.length === 0 ? (
        <div className={scss.emptyState}>
          <div className={scss.emptyIcon}>🚗</div>
          <h2>У вас пока нет объявлений</h2>
          <p>Опубликуйте машину во вкладке «Разместить автомобиль».</p>
        </div>
      ) : (
        <div className={scss.carsList}>
          {myCars.map((car) => (
            <article
              key={car.id}
              className={`${scss.compactCard} ${car.isVip ? scss.vipRow : ""}`}
            >
              <div className={scss.imgBlock}>
                <img
                  src={
                    car.images?.[0] ||
                    "https://via.placeholder.com/150x100?text=No+Photo"
                  }
                  alt={`Фото автомобиля ${car.title}`}
                  loading="lazy"
                />
                {car.isVip && <span className={scss.vipMiniBadge}>⭐ VIP</span>}
              </div>

              <div className={scss.detailsBlock}>
                <div className={scss.mainRow}>
                  <h2>{car.title}</h2>
                  <span className={scss.price}>
                    {car.price}{" "}
                    {car.currency === "stars"
                      ? "⭐️"
                      : car.currency?.split(" ")[0]}
                  </span>
                </div>

                <div className={scss.metaRow}>
                  <span>
                    <FaHorseHead aria-hidden="true" /> {car.power || "—"} HP
                  </span>
                  <span>
                    <FaLayerGroup aria-hidden="true" />{" "}
                    {car.carType || "Легковой"}
                  </span>
                  <span
                    className={
                      car.verified ? scss.statusActive : scss.statusPending
                    }
                  >
                    {car.verified ? (
                      <>
                        <MdVerifiedUser aria-hidden="true" /> Активно
                      </>
                    ) : (
                      <>
                        <MdPendingActions aria-hidden="true" /> На проверке
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className={scss.actionsBlock}>
                <button
                  className={scss.btnDeleteMini}
                  onClick={() => handleDelete(car.id)}
                  aria-label={`Удалить объявление ${car.title}`}
                >
                  <FaTrashAlt aria-hidden="true" />
                  <span>Удалить</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserCars;
