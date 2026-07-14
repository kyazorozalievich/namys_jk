import React from "react";
import scss from "./MarketAccessModal.module.scss";

const MarketAccessModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className={scss.overlay}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={scss.close}
          onClick={onClose}
          aria-label="Закрыть модальное окно"
        >
          <span aria-hidden="true">×</span>
        </button>

        <header>
          <h1>
            Авторынок <span>Namys JK</span>
          </h1>
          <p className={scss.description}>
            Для публикации автомобилей необходимо получить доступ к авторынку.
          </p>
        </header>

        <hr className={scss.line} />

        <div className={scss.tarif}>
          <section className={scss.block}>
            <h3>🔑 Обычный доступ</h3>
            <ul>
              <li>✔ До 10 мест объявлений</li>
              <li>✔ Размещение автомобилей</li>
              <li>✔ Удачная продажа</li>
              <li>✔ Поддержка администрации</li>
            </ul>
          </section>

          <section className={scss.vip}>
            <div className={scss.vipTitle}>⭐ VIP доступ</div>
            <ul>
              <li>✔ До 20 мест объявлений</li>
              <li>✔ VIP карточка автомобиля</li>
              <li>✔ Золотая рамка</li>
              <li>✔ Выше обычных объявлений</li>
            </ul>
          </section>
        </div>

        <button
          className={scss.adminBtn}
          onClick={() =>
            window.open("https://t.me/kka_07", "_blank", "noopener,noreferrer")
          }
        >
          💬 Получить доступ у администратора
        </button>

        <small className={scss.footerText}>
          Доступ выдается администрацией Namys JK
        </small>
      </div>
    </div>
  );
};

export default MarketAccessModal;
