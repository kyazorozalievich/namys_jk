import React, { useState, useEffect } from "react";
import scss from "./Create.module.scss";
import { FaCar, FaImage } from "react-icons/fa";
import { MdOutlineDescription, MdVerified } from "react-icons/md";
import { toast } from "react-toastify";
import { db, storage } from "../../../firebase/FireBase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useUserProfile } from "../../layout/Profile/useUserProfile";

const Create = () => {
  const { profile, loading: profileLoading } = useUserProfile();

  const [loading, setLoading] = useState(false);
  const [userAdsCount, setUserAdsCount] = useState(0);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("С Сом");
  const [power, setPower] = useState("");
  const [carType, setCarType] = useState("Легковой");
  const [contactType, setContactType] = useState("Telegram");
  const [contactValue, setContactValue] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);

  useEffect(() => {
    if (profile) {
      setUserAdsCount(profile.adsUsed || 0);
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Загрузка профиля...
      </h2>
    );
  }

  if (!profile) {
    return (
      <h2 style={{ textAlign: "center", color: "red", marginTop: "50px" }}>
        Пожалуйста, войдите в аккаунт!
      </h2>
    );
  }

  const currentUserUid = profile.uid;
  const currentUserEmail = profile.email;
  const currentUserPlan = profile.plan || "free";
  const currentUserRole = profile.role || "member";
  const currentUserMarketStatus = profile.marketStatus || "inactive";

  const maxLimit = currentUserPlan === "vip" ? 20 : 10;

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
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

  const uploadImageAsync = (file, uid) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `cars/${uid}/${Date.now()}_${file.name}`);
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

    if (currentUserMarketStatus !== "active") {
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
        img ? uploadImageAsync(img, currentUserUid) : null,
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      const carImages = uploadedUrls.filter((url) => url !== null);

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
        authorUid: currentUserUid,
        authorEmail: currentUserEmail,
        authorStatus: currentUserPlan,
        authorRole: currentUserRole,
        isVip: currentUserPlan === "vip",
        verified: true,
      });

      const userDocRef = doc(db, "users", currentUserUid);
      await updateDoc(userDocRef, { adsUsed: increment(1) });

      toast.success("Автомобиль успешно опубликован в авторынке!");

      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

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
      console.error(error);
      toast.error("Не удалось опубликовать автомобиль.");
    } finally {
      setLoading(false);
    }
  };

  const labels = ["Перед", "Бок", "Зад"];

  return (
    <main role="main" className={scss.create}>
      <div className="container">
        <header className={scss.title}>
          <h1>
            <FaCar aria-hidden="true" /> Разместить автомобиль
          </h1>
          <p>
            После публикации объявление моментально появится на авторынке клана.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={scss.content}>
          <div className={scss.profileMobile}>
            <section className={scss.profile}>
              <h2>Ваш профиль</h2>
              <div className={scss.info}>
                <FaCar aria-hidden="true" />
                <div>
                  <span>Тариф</span>
                  <p>{currentUserPlan === "vip" ? "⭐ VIP" : "👤 FREE"}</p>
                </div>
              </div>
              <div className={scss.info}>
                <MdVerified aria-hidden="true" />
                <div>
                  <span>Мест использовано</span>
                  <p>
                    {userAdsCount} / {maxLimit}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className={scss.left}>
            <section className={scss.card}>
              <h3>
                <FaImage aria-hidden="true" /> Фотографии
              </h3>
              <div className={scss.photos}>
                {images.map((_, index) => (
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
                ))}
              </div>
            </section>

            <section className={scss.card}>
              <h3>
                <FaCar aria-hidden="true" /> Информация и контакты
              </h3>
              <div className={scss.inputs}>
                <div className={scss.inputBox}>
                  <label htmlFor="title">Название</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="BMW M5 F90"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label htmlFor="price">Цена</label>
                  <input
                    id="price"
                    type="number"
                    placeholder="2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label htmlFor="currency">Валюта</label>
                  <select
                    id="currency"
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
                  <label htmlFor="power">Мощность</label>
                  <input
                    id="power"
                    type="number"
                    placeholder="1695"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    required
                  />
                </div>

                <div className={scss.inputBox}>
                  <label htmlFor="carType">Тип Машины</label>
                  <select
                    id="carType"
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                  >
                    <option value="Легковой">Легковой</option>
                    <option value="Грузовой">Грузовой</option>
                    <option value="Внедорожник">Внедорожник</option>
                  </select>
                </div>

                <div className={scss.inputBox}>
                  <label htmlFor="contactType">Способ связи</label>
                  <select
                    id="contactType"
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
                  <label htmlFor="contactValue">
                    Ссылка или Никнейм/Номер контакта
                  </label>
                  <input
                    id="contactValue"
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
                <label htmlFor="description">
                  <MdOutlineDescription aria-hidden="true" /> Описание
                </label>
                <textarea
                  id="description"
                  placeholder="Опишите автомобиль..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </section>
          </div>

          <div className={scss.right}>
            <section className={scss.profileDesktop}>
              <div className={scss.profile}>
                <h2>Ваш профиль</h2>
                <div className={scss.info}>
                  <FaCar aria-hidden="true" />
                  <div>
                    <span>Тариф</span>
                    <p>{currentUserPlan === "vip" ? "⭐ VIP" : "👤 FREE"}</p>
                  </div>
                </div>
                <div className={scss.info}>
                  <MdVerified aria-hidden="true" />
                  <div>
                    <span>Мест использовано</span>
                    <p>
                      {userAdsCount} / {maxLimit}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className={scss.rules}>
              <h2>Правила</h2>
              <ul>
                <li>✔ Максимум 3 фотографии.</li>
                <li>✔ Только реальные цены.</li>
                <li>✔ Запрещено мошенничество.</li>
                <li>✔ Нарушение правил карается мгновенным скрытием авто.</li>
              </ul>
            </section>

            <button type="submit" disabled={loading}>
              {loading ? "Загрузка..." : "Опубликовать автомобиль"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Create;
