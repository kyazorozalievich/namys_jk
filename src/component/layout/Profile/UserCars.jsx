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
import { ToastContainer, toast } from "react-toastify"; // Импортируем Toastify
import "react-toastify/dist/ReactToastify.css"; // Импортируем стили тостов
import scss from "./UserCars.module.scss";

// Иконки для компактного вида
import { FaCar, FaTrashAlt, FaHorseHead, FaLayerGroup } from "react-icons/fa";
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
        console.error("Ошибка при получении объявлений: ", error);
        toast.error("Ошибка при загрузке ваших объявлений");
        setLoading(false);
      },
    );

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  const handleDelete = async (carId) => {
    try {
      // Удаляем сразу без блокирующего окна confirm
      await deleteDoc(doc(db, "cars", carId));
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          adsUsed: increment(-1),
        });
      }
      // Красивый желтый/оранжевый тост предупреждения об удалении
      toast.warning("Объявление успешно удалено!");
    } catch (error) {
      console.error("Ошибка при удалении автомобиля:", error);
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
    <div className={scss.userCarsPage}>
      {/* Подключаем контейнер. Если он уже есть в App.jsx, эту строчку можно удалить */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className={scss.headerSection}>
        <div>
          <h2>Мои объявления</h2>
          <p>Управление вашим транспортом на авторынке</p>
        </div>
        <div className={scss.counter}>
          Активных авто: <span>{myCars.length}</span>
        </div>
      </div>

      {myCars.length === 0 ? (
        <div className={scss.emptyState}>
          <div className={scss.emptyIcon}>🚗</div>
          <h3>У вас пока нет объявлений</h3>
          <p>Опубликуйте машину во вкладке «Разместить автомобиль».</p>
        </div>
      ) : (
        <div className={scss.carsList}>
          {myCars.map((car) => (
            <div
              key={car.id}
              className={`${scss.compactCard} ${car.isVip ? scss.vipRow : ""}`}
            >
              {/* Блок с фото */}
              <div className={scss.imgBlock}>
                <img
                  src={
                    car.images?.[0] ||
                    "https://via.placeholder.com/150x100?text=No+Photo"
                  }
                  alt={car.title}
                />
                {car.isVip && <span className={scss.vipMiniBadge}>⭐ VIP</span>}
              </div>

              {/* Основная инфа */}
              <div className={scss.detailsBlock}>
                <div className={scss.mainRow}>
                  <h3>{car.title}</h3>
                  <span className={scss.price}>
                    {car.price}{" "}
                    {car.currency === "stars"
                      ? "⭐️"
                      : car.currency?.split(" ")[0]}
                  </span>
                </div>

                {/* Мелкие характеристики в строчку */}
                <div className={scss.metaRow}>
                  <span>
                    <FaHorseHead /> {car.power || "—"} HP
                  </span>
                  <span>
                    <FaLayerGroup /> {car.carType || "Легковой"}
                  </span>
                  <span
                    className={
                      car.verified ? scss.statusActive : scss.statusPending
                    }
                  >
                    {car.verified ? (
                      <>
                        <MdVerifiedUser /> Активно
                      </>
                    ) : (
                      <>
                        <MdPendingActions /> На проверке
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Кнопка действия (вмещается справа) */}
              <div className={scss.actionsBlock}>
                <button
                  className={scss.btnDeleteMini}
                  onClick={() => handleDelete(car.id)}
                  title="Удалить объявление"
                >
                  <FaTrashAlt />
                  <span>Удалить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCars;
