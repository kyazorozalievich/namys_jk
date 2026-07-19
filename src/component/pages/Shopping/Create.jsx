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

const compressImage = (file, maxWidth = 1280, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) return reject(new Error("Compression failed"));
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
};

const Create = () => {
  const { profile, loading: profileLoading } = useUserProfile();

  const [loading, setLoading] = useState(false);
  const [userAdsCount, setUserAdsCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

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
  const currentUserIsBanned = profile.isBanned || false;
  const currentUserMarketRestricted = profile.marketStatus === "restricted";

  const maxLimit =
    profile.adsLimit ||
    (currentUserPlan === "vip" ? 20 : currentUserPlan === "base" ? 10 : 5);

  const limitReached = userAdsCount >= maxLimit;

  if (currentUserIsBanned || currentUserMarketRestricted) {
    return (
      <main
        role="main"
        style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}
      >
        <h2 style={{ color: "red" }}>Доступ к авторынку ограничен</h2>
        <p>
          Ваш аккаунт был ограничен администрацией клана
          {profile.banReason ? `: ${profile.banReason}` : "."}
        </p>
        <p>Если считаете это ошибкой, свяжитесь с администрацией клана.</p>
        <button
          onClick={() => window.open("https://t.me/kka_07")}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#0088cc",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          💬 Связаться с администрацией
        </button>
      </main>
    );
  }

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
      const uploadTask = uploadBytesResumable(storageRef, file, {
        cacheControl: "public, max-age=31536000",
      });
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

    if (limitReached) {
      setShowLimitModal(true);
      return;
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
      const compressedImages = await Promise.all(
        images.map((img) => (img ? compressImage(img) : null)),
      );

      const uploadPromises = compressedImages.map((img) =>
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

        {limitReached && (
          <div
            style={{
              background: "#fff3cd",
              color: "#7a5c00",
              padding: "14px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Вы использовали все {maxLimit} объявления по вашему тарифу. Чтобы
            размещать больше, оформите более высокий тариф.
            <div>
              <button
                type="button"
                onClick={() => setShowLimitModal(true)}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f5a623",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ⭐ Повысить тариф
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={scss.content}>
          <div className={scss.profileMobile}>
            <section className={scss.profile}>
              <h2>Ваш профиль</h2>
              <div className={scss.info}>
                <FaCar aria-hidden="true" />
                <div>
                  <span>Тариф</span>
                  <p>
                    {currentUserPlan === "vip"
                      ? "⭐ VIP"
                      : currentUserPlan === "base"
                        ? "Базовый"
                        : "👤 FREE"}
                  </p>
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
                    <p>
                      {currentUserPlan === "vip"
                        ? "⭐ VIP"
                        : currentUserPlan === "base"
                          ? "Базовый"
                          : "👤 FREE"}
                    </p>
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
                <li>
                  ✔ Нарушение правил карается мгновенным скрытием авто и
                  блокировкой аккаунта.
                </li>
              </ul>
            </section>

            <button type="submit" disabled={loading || limitReached}>
              {loading
                ? "Загрузка..."
                : limitReached
                  ? "Лимит объявлений исчерпан"
                  : "Опубликовать автомобиль"}
            </button>
          </div>
        </form>
      </div>

      {showLimitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLimitModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Лимит исчерпан</h2>
            <p style={{ marginBottom: "20px" }}>
              Вы уже разместили {maxLimit} объявления по вашему тарифу. Чтобы
              публиковать больше автомобилей, обратитесь к администрации клана
              для повышения тарифа.
            </p>
            <button
              onClick={() => window.open("https://t.me/kka_07")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#0088cc",
                color: "#fff",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              💬 Связаться с администрацией
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Create;
