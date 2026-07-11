import React, { useContext, useState, useEffect } from "react";
import scss from "./ShopCars.module.scss";
import { BiSolidWinkSmile } from "react-icons/bi";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTelegramPlane,
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { ModalContext } from "../../../ui/ModalContext";
import { useUserProfile } from "../../layout/Profile/useUserProfile";

// Импортируем компонент карточки
import CarCard from "../../../ui/CarCard";

// Импорты Firebase
import { db } from "../../../firebase/FireBase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const ShopCars = () => {
  const { checkMarketAccess } = useContext(ModalContext);
  const [selectedCar, setSelectedCar] = useState(null);
  const { profile } = useUserProfile();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Состояния фильтров и сортировки
  const [filterType, setFilterType] = useState("Все типы");
  const [filterVerified, setFilterVerified] = useState("Все пользователи");
  const [currentSort, setCurrentSort] = useState("По умолчанию");

  useEffect(() => {
    const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const carsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCars(carsList);
        setLoading(false);
      },
      (error) => {
        console.error("Ошибка получения авторынка:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const openModal = (car) => {
    setSelectedCar(car);
    setPhotoIndex(0);
  };

  const nextPhoto = () => {
    setPhotoIndex((prev) =>
      prev === selectedCar.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevPhoto = () => {
    setPhotoIndex((prev) =>
      prev === 0 ? selectedCar.images.length - 1 : prev - 1,
    );
  };

  // Хелпер для динамического рендеринга иконок связи
  const renderContactIcon = (type) => {
    switch (type) {
      case "Telegram":
        return <FaTelegramPlane />;
      case "WhatsApp":
        return <FaWhatsapp />;
      case "Instagram":
        return <FaInstagram />;
      case "TikTok":
        return <FaTiktok />;
      case "Email":
        return <MdEmail />;
      default:
        return null;
    }
  };

  // Хелпер для формирования валидной ссылки
  const getContactLink = (type, value) => {
    if (!value) return "#";
    const cleanValue = value.replace(/[@\s]/g, ""); // очистка от @ и пробелов

    switch (type) {
      case "Telegram":
        return value.includes("t.me") ? value : `https://t.me/${cleanValue}`;
      case "WhatsApp":
        const phone = value.replace(/[^0-9]/g, "");
        return `https://wa.me/${phone}`;
      case "Instagram":
        return value.includes("instagram.com")
          ? value
          : `https://instagram.com/${cleanValue}`;
      case "TikTok":
        return value.includes("tiktok.com")
          ? value
          : `https://www.tiktok.com/@${cleanValue}`;
      case "Email":
        return `mailto:${value.trim()}`;
      default:
        return "#";
    }
  };

  const filteredCars = cars
    .filter((car) => {
      // 1. Фильтрация по типу кузова
      if (
        filterType !== "Все типы" &&
        filterType !== "Тип" &&
        car.carType !== filterType
      ) {
        return false;
      }

      // 2. ИСПРАВЛЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ:
      if (filterVerified === "Все пользователи") {
        // Показываем только те машины, у которых verified === true.
        // Если пользователя забанили — у его машин verified станет false, и они скроются.
        if (!car.verified) {
          return false;
        }
      }

      // Если в селекторе принудительно выбрано "Проверенные" (Активные на рынке)
      if (filterVerified === "Проверенные" && !car.verified) {
        return false;
      }

      // Если в селекторе принудительно выбрано "Непроверенные" (Скрытые бан-системой / Ожидающие)
      if (filterVerified === "Непроверенные" && car.verified) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Сортировка по роли (Админы всегда выше)
      const aAdmin = a.authorRole === "admin" ? 1 : 0;
      const bAdmin = b.authorRole === "admin" ? 1 : 0;
      if (aAdmin !== bAdmin) return bAdmin - aAdmin;

      // Сортировка по верификации
      const aVerified = a.verified && a.authorRole !== "admin" ? 1 : 0;
      const bVerified = b.verified && b.authorRole !== "admin" ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;

      // Сортировка по VIP-статусу
      const aVip = a.isVip ? 1 : 0;
      const bVip = b.isVip ? 1 : 0;
      if (aVip !== bVip) return bVip - aVip;

      // Кастомные сортировки пользователя
      if (currentSort === "Дорогие") return b.price - a.price;
      if (currentSort === "Дешевые") return a.price - b.price;
      if (currentSort === "Мощные") return (b.power || 0) - (a.power || 0);
      if (currentSort === "Слабые") return (a.power || 0) - (b.power || 0);

      // Сортировка по дате
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

  return (
    <section className={scss.carsSec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            Авто в твоем вкусе
            <span>
              <BiSolidWinkSmile />
            </span>
          </h2>

          <div className={scss.mainBtns}>
            <div className={scss.tables}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="Все типы">Все типы</option>
                <option value="Легковой">Легковой</option>
                <option value="Грузовой">Грузовой</option>
                <option value="Внедорожник">Внедорожник</option>
              </select>

              <select
                value={currentSort}
                onChange={(e) => setCurrentSort(e.target.value)}
              >
                <option value="По умолчанию">Сортировка</option>
                <option value="Дорогие">Сначала дорогие</option>
                <option value="Дешевые">Сначала дешевые</option>
                <option value="Мощные">Мощные (HP ↑)</option>
                <option value="Слабые">Слабые (HP ↓)</option>
              </select>
            </div>

            <button onClick={() => checkMarketAccess(profile)}>
              Опубликовать машину +
            </button>
          </div>

          <div className={scss.carsCards}>
            {loading ? (
              <p className={scss.statusText}>
                Загрузка авторынка клана Namys JK...
              </p>
            ) : filteredCars.length === 0 ? (
              <p className={scss.statusText}>
                Нет подходящих автомобилей в продаже.
              </p>
            ) : (
              filteredCars.map((car) => (
                <CarCard key={car.id} car={car} onOpenModal={openModal} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно просмотра машины */}
      {selectedCar && (
        <div className={scss.modalBg} onClick={() => setSelectedCar(null)}>
          <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
            <span className={scss.close} onClick={() => setSelectedCar(null)}>
              <IoCloseSharp />
            </span>

            <div className={scss.modalImg}>
              {selectedCar.images && selectedCar.images.length > 1 && (
                <button onClick={prevPhoto}>
                  <FaArrowLeft />
                </button>
              )}

              <img
                src={
                  selectedCar.images && selectedCar.images.length > 0
                    ? selectedCar.images[photoIndex]
                    : "https://via.placeholder.com/380x230?text=No+Photo"
                }
                alt=""
              />

              {selectedCar.images && selectedCar.images.length > 1 && (
                <button onClick={nextPhoto}>
                  <FaArrowRight />
                </button>
              )}
            </div>

            <h2>{selectedCar.title}</h2>
            <p>{selectedCar.description}</p>

            <div className={scss.detail}>
              <h4>
                Цена:{" "}
                <span>
                  {selectedCar.price}
                  {(() => {
                    switch (selectedCar.currency) {
                      case "С Сом":
                        return " Сом";
                      case "Т Тенге":
                        return " ₸";
                      case "₽ Рубли":
                        return " ₽";
                      case "stars":
                        return " ⭐️";
                      case "$ USD":
                        return " $";
                      default:
                        // Если вдруг пришла старая строка или только символ
                        if (selectedCar.currency?.includes("Сом"))
                          return " Сом";
                        if (selectedCar.currency?.includes("Тенге"))
                          return " ₸";
                        if (selectedCar.currency?.includes("Рубли"))
                          return " ₽";
                        return ` ${selectedCar.currency || "$"}`;
                    }
                  })()}
                </span>
              </h4>
              <h4>
                Сила: <span>{selectedCar.power} HP</span>
              </h4>
            </div>

            <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
              Продавец: <strong>{selectedCar.authorEmail}</strong>
            </div>

            {/* КНОПКА СВЯЗИ */}
            {selectedCar.contactValue ? (
              <a
                href={getContactLink(
                  selectedCar.contactType,
                  selectedCar.contactValue,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`${scss.contactBtn} ${scss[selectedCar.contactType?.toLowerCase()]}`}
              >
                {renderContactIcon(selectedCar.contactType)}
                <span>Связаться: {selectedCar.contactValue}</span>
              </a>
            ) : (
              <div className={scss.buy} onClick={() => setSelectedCar(null)}>
                Закрыть
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopCars;
