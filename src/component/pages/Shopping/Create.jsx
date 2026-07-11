import React, { useState, useEffect } from "react";
import scss from "./Create.module.scss";

import { FaCar, FaGoogle, FaImage } from "react-icons/fa";
import { MdOutlineDescription, MdVerified } from "react-icons/md";

// Импорт React Toastify
import { toast } from "react-toastify";

// Импорты Firebase
import { db, storage, auth } from "../../../firebase/FireBase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  increment,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Create = () => {
  // Состояния пользователя
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAdsCount, setUserAdsCount] = useState(0);

  // Состояния полей формы
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("С Сом");
  const [power, setPower] = useState("");
  const [carType, setCarType] = useState("Легковой");
  const [contactType, setContactType] = useState("Telegram");
  const [contactValue, setContactValue] = useState("");
  const [description, setDescription] = useState("");

  // Состояния для картинок
  const [images, setImages] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);

  // Лимиты плана
  const maxLimit = userData?.plan === "vip" ? 20 : 10;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData(data);
            setUserAdsCount(data.adsUsed || 0);
          } else {
            console.warn(
              "Документ пользователя не найден в коллекции users по его UID",
            );
            setUserAdsCount(0);
          }
        } catch (error) {
          console.error("Ошибка при получении данных профиля:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setUserAdsCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Если на этом месте уже было превью, удаляем его из памяти браузера
      if (previews[index]) {
        URL.revokeObjectURL(previews[index]);
      }

      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      const newPreviews = [...previews];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviews(newPreviews);
    }
  };

  const uploadImageAsync = (file, userUid) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(
        storage,
        `cars/${userUid}/${Date.now()}_${file.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        },
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return toast.error("Пожалуйста, войдите в аккаунт!");
    if (userData?.marketStatus !== "active") {
      return toast.error(
        "У вас нет доступа к публикациям. Обратитесь к администрации.",
      );
    }
    if (userAdsCount >= maxLimit) {
      return toast.error(
        `Вы исчерпали свой лимит объявлений (${maxLimit} шт.)`,
      );
    }
    if (!images[0]) {
      return toast.warning(
        "Пожалуйста, загрузите хотя бы главное фото (Перед)!",
      );
    }
    if (!contactValue.trim()) {
      return toast.warning("Пожалуйста, укажите ваши контакты для связи!");
    }

    setLoading(true);

    try {
      const uploadPromises = images.map((img) =>
        img ? uploadImageAsync(img, user.uid) : null,
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const carImages = uploadedUrls.filter((url) => url !== null);

      // Сохраняем объявление в БД
      await addDoc(collection(db, "cars"), {
        title,
        price: Number(price),
        currency,
        power: Number(power),
        carType,
        contactType,
        contactValue,
        description,
        images: carImages,
        createdAt: new Date(),

        authorUid: user.uid,
        authorEmail: user.email,
        authorStatus: userData?.plan || "free",
        authorRole: userData?.role || "member",

        isVip: userData?.plan === "vip",
        verified: true,
      });

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        adsUsed: increment(1),
      });

      toast.success("Автомобиль успешно опубликован в авторынке!");

      // Освобождаем память от созданных blob-ссылок
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

      // Очищаем форму
      setTitle("");
      setPrice("");
      setPower("");
      setCurrency("С Сом");
      setCarType("Легковой");
      setContactValue("");
      setDescription("");
      setImages([null, null, null]);
      setPreviews([null, null, null]);

      setUserAdsCount((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка при добавлении машины:", error);
      toast.error("Не удалось опубликовать автомобиль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={scss.create}>
      <div className="container">
        <div className={scss.title}>
          <h1>
            <FaCar />
            Разместить автомобиль
          </h1>
          <p>
            После публикации объявление моментально появится на авторынке клана.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={scss.content}>
          {/* LEFT */}
          <div className={scss.left}>
            <div className={scss.card}>
              <h2>
                <FaImage />
                Фотографии
              </h2>

              <div className={scss.photos}>
                {[0, 1, 2].map((index) => {
                  const labels = ["Перед", "Бок", "Зад"];
                  return (
                    <label
                      key={index}
                      className={scss.photo}
                      style={{
                        backgroundImage: previews[index]
                          ? `url(${previews[index]})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                      {!previews[index] && (
                        <>
                          <span>+</span>
                          <p>{labels[index]}</p>
                        </>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={scss.card}>
              <h2>
                <FaCar />
                Информация и контакты
              </h2>

              <div className={scss.inputs}>
                <div className={scss.inputBox}>
                  <label>Название</label>
                  <input
                    type="text"
                    placeholder="BMW M5 F90"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label>Цена</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label>Валюта</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="С Сом">С Сом</option>
                    <option value="Т Тенге">Т Тенге</option>
                    <option value="₽ Рубли">₽ Рубли</option>
                    <option value="$ USD">$ USD</option>
                    <option value="stars">Звезды ТГ</option>
                  </select>
                </div>

                <div className={scss.inputBox}>
                  <label>Мощность</label>
                  <input
                    type="number"
                    placeholder="1695"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label>Тип Машины</label>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                  >
                    <option value="Легковой">Легковой</option>
                    <option value="Грузовой">Грузовой</option>
                    <option value="Внедорожник">Внедорожник</option>
                  </select>
                </div>

                <div className={scss.inputBox}>
                  <label>Способ связи</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div className={`${scss.inputBox} ${scss.fullWidth}`}>
                  <label>Ссылка или Никнейм/Номер контакта</label>
                  <input
                    type="text"
                    placeholder={
                      contactType === "WhatsApp"
                        ? "+996*********"
                        : contactType === "Email"
                          ? "example@gmail.com"
                          : "@username или ссылка"
                    }
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={scss.description}>
                <label>
                  <MdOutlineDescription />
                  Описание
                </label>
                <textarea
                  placeholder="Опишите автомобиль..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={scss.right}>
            <div className={scss.profile}>
              <h2>Ваш профиль</h2>

              <div className={scss.info}>
                <FaGoogle />
                <div>
                  <span>Google</span>
                  <p>{user ? user.email : "Загрузка..."}</p>
                </div>
              </div>

              <div className={scss.info}>
                <MdVerified />
                <div>
                  <span>Тариф</span>
                  <p>{userData?.plan === "vip" ? "⭐ VIP" : "👤 FREE"}</p>
                </div>
              </div>

              <div className={scss.info}>
                <FaCar />
                <div>
                  <span>Мест использовано</span>
                  <p>
                    {userAdsCount} / {maxLimit}
                  </p>
                </div>
              </div>
            </div>

            <div className={scss.rules}>
              <h2>Правила</h2>
              <ul>
                <li>✔ Максимум 3 фотографии.</li>
                <li>✔ Только реальные цены.</li>
                <li>✔ Запрещено мошенничество.</li>
                <li>✔ Нарушение правил карается мгновенным скрытием авто.</li>
              </ul>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Загрузка..." : "Опубликовать автомобиль"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Create;
