import React, { useContext } from "react";
import scss from "./ProfileMenu.module.scss";
import { useUserProfile } from "./useUserProfile";
import { ModalContext } from "../../../ui/ModalContext";

const ProfileMenu = () => {
  const { profile, loading } = useUserProfile();
  const { checkMarketAccess } = useContext(ModalContext);

  if (loading) {
    return <h2 className={scss.errorAuth}>Загрузка...</h2>;
  }

  if (!profile) {
    return <h2 className={scss.errorAuth}>Профиль не найден</h2>;
  }

  const adsLimit = profile.adsLimit || (profile.plan === "vip" ? 20 : 5);
  const adsUsed = profile.adsUsed || 0;
  const freeSlots = Math.max(adsLimit - adsUsed, 0);
  const marketAllowed =
    !profile.isBanned && profile.marketStatus !== "restricted";

  return (
    <main className={scss.profilePage}>
      <div className="container">
        <article className={scss.card}>
          <header className={scss.top}>
            <img
              src={profile.photo}
              alt={`Профиль пользователя ${profile.name}`}
              loading="lazy"
            />
            <div className={scss.userInfo}>
              <h1>{profile.name}</h1>
              <span
                className={
                  profile.plan === "vip" ? scss.vipBadge : scss.freeBadge
                }
              >
                {profile.plan === "vip"
                  ? "⭐ VIP Пользователь"
                  : "👤 Обычный пользователь"}
              </span>
            </div>
          </header>

          <section className={scss.stats} aria-label="Статистика аккаунта">
            <div className={scss.item}>
              <span>Роль</span>
              <h3>{profile.role || "member"}</h3>
            </div>
            <div className={scss.item}>
              <span>Доступ к рынку</span>
              <h3>
                {profile.isBanned
                  ? "🚫 Заблокирован"
                  : marketAllowed
                    ? "✅ Активен"
                    : "🚫 Ограничен"}
              </h3>
            </div>
            <div className={scss.item}>
              <span>Тариф</span>
              <h3>{profile.plan === "vip" ? "VIP" : "Free"}</h3>
            </div>
            <div className={scss.item}>
              <span>Объявления</span>
              <h3>
                {adsUsed}/{adsLimit}
              </h3>
            </div>
          </section>

          <div
            className={scss.progress}
            role="progressbar"
            aria-valuenow={adsUsed}
            aria-valuemin="0"
            aria-valuemax={adsLimit}
          >
            <div
              style={{ width: `${Math.min((adsUsed / adsLimit) * 100, 100)}%` }}
            ></div>
          </div>

          <p className={scss.bottomText}>
            Свободно мест: <b>{freeSlots}</b>
          </p>

          <div className={scss.actions}>
            <button
              className={scss.myAds}
              onClick={() => (window.location.href = "/profile/userCars")}
            >
              🚗 Мои объявления
            </button>
            <button
              className={scss.addCar}
              onClick={() => checkMarketAccess(profile)}
            >
              ➕ Разместить автомобиль
            </button>
          </div>

          <aside className={scss.marketInfo}>
            <h2>Авторынок Namys JK</h2>
            {profile.isBanned ? (
              <>
                <p>🚫 Ваш аккаунт заблокирован администрацией клана.</p>
                {profile.banReason && <p>Причина: {profile.banReason}</p>}
                <button
                  className={scss.telegram}
                  onClick={() => window.open("https://t.me/kka_07")}
                >
                  💬 Связаться с администрацией
                </button>
              </>
            ) : freeSlots > 0 ? (
              <>
                <p>✅ У вас есть доступ к публикации автомобилей.</p>
                <p>
                  Вы можете разместить еще <b>{freeSlots}</b> объявлений.
                </p>
              </>
            ) : (
              <>
                <p>🔒 Бесплатный лимит объявлений исчерпан.</p>
                <p>Оформите VIP-тариф, чтобы разместить больше автомобилей.</p>
                <button
                  className={scss.telegram}
                  onClick={() => window.open("https://t.me/kka_07")}
                >
                  ⭐ Оформить VIP
                </button>
              </>
            )}
          </aside>
        </article>
      </div>
    </main>
  );
};

export default ProfileMenu;
