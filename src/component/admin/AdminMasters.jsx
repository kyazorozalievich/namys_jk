import React, { useEffect, useState } from "react";
import { db } from "../../firebase/FireBase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import scss from "./AdminMasters.module.scss";

const DETAILING_LIST = [
  { id: "plates", title: "Изготовление гос номеров" },
  { id: "gg_services", title: "Всем известные GG услуги" },
  { id: "badges", title: "Шильдики и таблички на любую машину" },
  { id: "branding", title: "Логотипы и брендинг кланов" },
  { id: "montage", title: "Фото- и видеомонтажи тачек" },
];

const INITIAL_GG_SERVICES = {
  coin_car: {
    title: "За коины",
    priceRub: "40",
    priceStars: "25",
    active: true,
    cat: "cars",
  },
  don_car: {
    title: "Дон авто",
    priceRub: "50",
    priceStars: "25",
    active: true,
    cat: "cars",
  },
  custom_power: {
    title: "🚀 Кастомная мощность",
    priceRub: "40",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  bb: {
    title: "⛔ ББ",
    priceRub: "40",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  shifttime: {
    title: "⏩ Шифттайм",
    priceRub: "50",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
  premium_body: {
    title: "⚜️ Премиум обвесы",
    priceRub: "30",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  cheats: {
    title: "⏭️ Читы / полу-читы",
    priceRub: "40",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
  chrome_lights: {
    title: "🪩 Хром фары",
    priceRub: "40",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  chrome_pads: {
    title: "📀 Хром колодки / авто",
    priceRub: "30",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  wheel_turn: {
    title: "🛞 Выворот колёс",
    priceRub: "30",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  ufo: {
    title: "🛸 НЛО",
    priceRub: "30",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  other_spoiler: {
    title: "🪅 Спойлеры и обвесы с других авто",
    priceRub: "40",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  money_boost: {
    title: "💰 Пополнение денег / коинов",
    priceRub: "50",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
  king_rank: {
    title: "👑 Ранг KING",
    priceRub: "50",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
  sirens: {
    title: "🚨 Активация мигалок",
    priceRub: "40",
    priceStars: "15",
    active: true,
    cat: "tuning",
  },
  dup_car: {
    title: "🚗🚗 Клонирование авто (дюп)",
    priceRub: "60",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
  change_id: {
    title: "🔁 Смена айди",
    priceRub: "70",
    priceStars: "25",
    active: true,
    cat: "tuning",
  },
};

const AdminMasters = () => {
  const [dbData, setDbData] = useState({});
  const [servicesStatus, setServicesStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const [newMaster, setNewMaster] = useState({
    nickname: "",
    status: "active",
  });

  useEffect(() => {
    const docRef = doc(db, "detailing_config", "services_masters");
    const unsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!data.gg_services) {
            data.gg_services = { ggList: INITIAL_GG_SERVICES, masters: [] };
          }
          if (!data.gg_services.ggList)
            data.gg_services.ggList = INITIAL_GG_SERVICES;
          if (!data.gg_services.masters) data.gg_services.masters = [];
          setDbData(data);
        } else {
          const defaultStructure = {
            gg_services: { ggList: INITIAL_GG_SERVICES, masters: [] },
          };
          await setDoc(docRef, defaultStructure);
          setDbData(defaultStructure);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Ошибка Firebase:", err);
        setLoading(false);
      },
    );

    const fetchServicesStatus = async () => {
      const statuses = {};
      for (const service of DETAILING_LIST) {
        try {
          const serviceDocRef = doc(db, "detailing_services", service.id);
          const serviceSnap = await getDoc(serviceDocRef);
          if (serviceSnap.exists()) {
            statuses[service.id] = serviceSnap.data().active ?? true;
          } else {
            statuses[service.id] = true;
          }
        } catch (e) {
          console.error(`Ошибка загрузки статуса для ${service.id}:`, e);
          statuses[service.id] = true;
        }
      }
      setServicesStatus(statuses);
    };

    fetchServicesStatus();
    return () => unsubscribe();
  }, []);

  const toggleServiceActive = async (serviceId, e) => {
    if (e) e.stopPropagation();
    const currentStatus = servicesStatus[serviceId] ?? true;
    const newStatus = !currentStatus;

    try {
      const serviceDocRef = doc(db, "detailing_services", serviceId);
      await setDoc(serviceDocRef, { active: newStatus }, { merge: true });

      setServicesStatus((prev) => ({ ...prev, [serviceId]: newStatus }));
      toast.success(
        newStatus ? "Услуга успешно включена!" : "Услуга успешно отключена!",
      );
    } catch (err) {
      console.error(err);
      toast.error("Не удалось изменить статус услуги.");
    }
  };

  const handleLiveEdit = (masterIndex, field, value) => {
    setDbData((prev) => {
      const currentService = prev[selectedServiceId] || { masters: [] };
      const updatedMasters = [...currentService.masters];
      updatedMasters[masterIndex] = {
        ...updatedMasters[masterIndex],
        [field]: value,
      };
      return {
        ...prev,
        [selectedServiceId]: { ...currentService, masters: updatedMasters },
      };
    });
  };

  const handleDeleteMaster = (masterIndex) => {
    setDbData((prev) => {
      const currentService = prev[selectedServiceId] || { masters: [] };
      const updatedMasters = currentService.masters.filter(
        (_, idx) => idx !== masterIndex,
      );
      return {
        ...prev,
        [selectedServiceId]: { ...currentService, masters: updatedMasters },
      };
    });
  };

  const handleLocalAddMaster = () => {
    if (!newMaster.nickname.trim()) {
      toast.warning("Заполните никнейм мастера!");
      return;
    }
    setDbData((prev) => {
      const currentService = prev[selectedServiceId] || { masters: [] };
      return {
        ...prev,
        [selectedServiceId]: {
          ...currentService,
          masters: [...currentService.masters, newMaster],
        },
      };
    });
    setNewMaster({ nickname: "", status: "active" });
  };

  const handleGgMasterEdit = (masterIndex, field, value) => {
    setDbData((prev) => {
      const currentGg = prev.gg_services || {
        ggList: INITIAL_GG_SERVICES,
        masters: [],
      };
      const updatedMasters = [...(currentGg.masters || [])];
      updatedMasters[masterIndex] = {
        ...updatedMasters[masterIndex],
        [field]: value,
      };
      return {
        ...prev,
        gg_services: { ...currentGg, masters: updatedMasters },
      };
    });
  };

  const handleGgMasterDelete = (masterIndex) => {
    setDbData((prev) => {
      const currentGg = prev.gg_services || {
        ggList: INITIAL_GG_SERVICES,
        masters: [],
      };
      const updatedMasters = currentGg.masters.filter(
        (_, idx) => idx !== masterIndex,
      );
      return {
        ...prev,
        gg_services: { ...currentGg, masters: updatedMasters },
      };
    });
  };

  const handleGgMasterAdd = () => {
    if (!newMaster.nickname.trim()) {
      toast.warning("Заполните никнейм GG-мастера!");
      return;
    }
    setDbData((prev) => {
      const currentGg = prev.gg_services || {
        ggList: INITIAL_GG_SERVICES,
        masters: [],
      };
      const updatedMasters = [...(currentGg.masters || []), newMaster];
      return {
        ...prev,
        gg_services: { ...currentGg, masters: updatedMasters },
      };
    });
    setNewMaster({ nickname: "", status: "active" });
  };

  const handleGgServiceEdit = (subServiceKey, field, value) => {
    setDbData((prev) => {
      const currentGg = prev.gg_services || {
        ggList: INITIAL_GG_SERVICES,
        masters: [],
      };
      const updatedList = { ...currentGg.ggList };
      updatedList[subServiceKey] = {
        ...updatedList[subServiceKey],
        [field]: value,
      };
      return { ...prev, gg_services: { ...currentGg, ggList: updatedList } };
    });
  };

  const handleSaveToFirebase = async () => {
    try {
      await setDoc(doc(db, "detailing_config", "services_masters"), dbData, {
        merge: true,
      });
      toast.success("Данные успешно синхронизированы!");
    } catch (err) {
      console.error(err);
      toast.error("Не удалось записать изменения.");
    }
  };

  if (loading) {
    return (
      <div className={scss.loader} role="status" aria-live="polite">
        Загрузка конфигурации услуг...
      </div>
    );
  }

  const activeServiceInfo = DETAILING_LIST.find(
    (s) => s.id === selectedServiceId,
  );
  const ggServicesObj = dbData.gg_services?.ggList || INITIAL_GG_SERVICES;
  const ggMastersList = dbData.gg_services?.masters || [];
  const currentServiceData = dbData[selectedServiceId] || { masters: [] };

  return (
    <main className={scss.container}>
      {!selectedServiceId ? (
        <>
          <h1 className={scss.title}>📋 Услуги Детейлинга и Мастера</h1>
          <p className={scss.subtitle}>
            Нажмите на нужную категорию для детального управления прайсом или
            мастерами.
          </p>

          <div className={scss.servicesList} role="grid">
            {DETAILING_LIST.map((service) => {
              const infoLabel =
                service.id === "gg_services"
                  ? `Мастеров: ${ggMastersList.length}`
                  : `Мастеров: ${dbData[service.id]?.masters?.length || 0}`;

              const isServiceActive = servicesStatus[service.id] ?? true;

              return (
                <div
                  key={service.id}
                  className={`${scss.serviceCard} ${!isServiceActive ? scss.rowDisabled : ""}`}
                  onClick={() => setSelectedServiceId(service.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setSelectedServiceId(service.id)
                  }
                >
                  <div className={scss.serviceHeader}>
                    <div>
                      <h2>{service.title}</h2>
                      <span className={scss.badge}>{infoLabel}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleServiceActive(service.id, e)}
                      aria-label={`Изменить статус услуги ${service.title}`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        backgroundColor: isServiceActive
                          ? "#2e7d32"
                          : "#c62828",
                        color: "#fff",
                      }}
                    >
                      {isServiceActive ? "Включена" : "Отключена"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : selectedServiceId === "gg_services" ? (
        <div className={scss.activePanel}>
          <div className={scss.panelTopActions}>
            <button
              className={scss.backBtn}
              onClick={() => setSelectedServiceId(null)}
            >
              ← Назад ко всем услугам
            </button>

            <button
              type="button"
              onClick={() => toggleServiceActive("gg_services")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor:
                  (servicesStatus["gg_services"] ?? true)
                    ? "#2e7d32"
                    : "#c62828",
                color: "#fff",
              }}
            >
              {(servicesStatus["gg_services"] ?? true)
                ? "🟢 Категория Включена"
                : "🔴 Категория Отключена"}
            </button>
          </div>

          <h1 className={scss.sectionTitle}>
            ⚙️ Настройка категории: <span>GG Услуги</span>
          </h1>

          <section className={scss.sectionBox}>
            <h3 className={scss.ggCategoryTitle}>
              👥 Управление мастерами для GG услуг:
            </h3>

            <div className={scss.mastersGrid}>
              {ggMastersList.length === 0 ? (
                <p className={scss.emptyState}>
                  Ни одного GG-мастера еще не добавлено.
                </p>
              ) : (
                ggMastersList.map((master, idx) => (
                  <div key={idx} className={scss.masterRow}>
                    <input
                      type="text"
                      className={scss.input}
                      placeholder="@username_tg"
                      aria-label="Никнейм мастера"
                      value={master.nickname}
                      onChange={(e) =>
                        handleGgMasterEdit(idx, "nickname", e.target.value)
                      }
                    />
                    <select
                      className={scss.select}
                      aria-label="Статус мастера"
                      value={master.status}
                      onChange={(e) =>
                        handleGgMasterEdit(idx, "status", e.target.value)
                      }
                    >
                      <option value="active">Свободен</option>
                      <option value="busy">Занят</option>
                    </select>
                    <button
                      type="button"
                      className={scss.btnDelete}
                      onClick={() => handleGgMasterDelete(idx)}
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={scss.addMasterForm}>
              <h4>+ Добавить нового GG-мастера</h4>
              <div className={scss.formFields}>
                <input
                  type="text"
                  className={scss.input}
                  placeholder="Никнейм (например, @GG_Master)"
                  aria-label="Никнейм нового GG мастера"
                  value={newMaster.nickname}
                  onChange={(e) =>
                    setNewMaster({ ...newMaster, nickname: e.target.value })
                  }
                />
                <select
                  className={scss.select}
                  aria-label="Статус нового GG мастера"
                  value={newMaster.status}
                  onChange={(e) =>
                    setNewMaster({ ...newMaster, status: e.target.value })
                  }
                >
                  <option value="active">Свободен</option>
                  <option value="busy">Занят</option>
                </select>
              </div>
              <button
                type="button"
                className={scss.btnAddLocal}
                onClick={handleGgMasterAdd}
              >
                Добавить в список
              </button>
            </div>
          </section>

          <hr className={scss.divider} />

          <section>
            <h3 className={scss.ggCategoryTitle}>💰 Цены на авто:</h3>
            <div className={scss.ggGrid}>
              {Object.entries(ggServicesObj)
                .filter(([_, item]) => item.cat === "cars")
                .map(([key, item]) => (
                  <div
                    key={key}
                    className={`${scss.ggRow} ${!item.active ? scss.rowDisabled : ""}`}
                  >
                    <div className={scss.ggName}>{item.title}</div>
                    <div className={scss.ggFields}>
                      <div className={scss.inputWrapper}>
                        <input
                          type="text"
                          aria-label={`Цена в сомах для ${item.title}`}
                          value={item.priceRub}
                          onChange={(e) =>
                            handleGgServiceEdit(key, "priceRub", e.target.value)
                          }
                        />
                        <span>Сом</span>
                      </div>
                      <div className={scss.inputWrapper}>
                        <input
                          type="text"
                          aria-label={`Цена в звездах для ${item.title}`}
                          value={item.priceStars}
                          onChange={(e) =>
                            handleGgServiceEdit(
                              key,
                              "priceStars",
                              e.target.value,
                            )
                          }
                        />
                        <span>★</span>
                      </div>
                      <button
                        type="button"
                        className={`${scss.btnToggleActive} ${item.active ? scss.activeOn : scss.activeOff}`}
                        onClick={() =>
                          handleGgServiceEdit(key, "active", !item.active)
                        }
                      >
                        {item.active ? "Вкл" : "Выкл"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <h3 className={scss.ggCategoryTitle} style={{ marginTop: "30px" }}>
              👨🏻‍🔧 Настройка авто / Улучшения:
            </h3>
            <div className={scss.ggGrid}>
              {Object.entries(ggServicesObj)
                .filter(([_, item]) => item.cat === "tuning")
                .map(([key, item]) => (
                  <div
                    key={key}
                    className={`${scss.ggRow} ${!item.active ? scss.rowDisabled : ""}`}
                  >
                    <div className={scss.ggName}>{item.title}</div>
                    <div className={scss.ggFields}>
                      <div className={scss.inputWrapper}>
                        <input
                          type="text"
                          aria-label={`Цена в сомах для ${item.title}`}
                          value={item.priceRub}
                          onChange={(e) =>
                            handleGgServiceEdit(key, "priceRub", e.target.value)
                          }
                        />
                        <span>Сом</span>
                      </div>
                      <div className={scss.inputWrapper}>
                        <input
                          type="text"
                          aria-label={`Цена в звездах для ${item.title}`}
                          value={item.priceStars}
                          onChange={(e) =>
                            handleGgServiceEdit(
                              key,
                              "priceStars",
                              e.target.value,
                            )
                          }
                        />
                        <span>★</span>
                      </div>
                      <button
                        type="button"
                        className={`${scss.btnToggleActive} ${item.active ? scss.activeOn : scss.activeOff}`}
                        onClick={() =>
                          handleGgServiceEdit(key, "active", !item.active)
                        }
                      >
                        {item.active ? "Вкл" : "Выкл"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <button
            type="button"
            className={scss.btnSaveAll}
            style={{ marginTop: "40px" }}
            onClick={handleSaveToFirebase}
          >
            Сохранить всё (Мастеров и Прайс-лист)
          </button>
        </div>
      ) : (
        <div className={scss.activePanel}>
          <div className={scss.panelTopActions}>
            <button
              className={scss.backBtn}
              onClick={() => setSelectedServiceId(null)}
            >
              ← Вернуться к списку услуг
            </button>

            <button
              type="button"
              onClick={() => toggleServiceActive(selectedServiceId)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor:
                  (servicesStatus[selectedServiceId] ?? true)
                    ? "#2e7d32"
                    : "#c62828",
                color: "#fff",
              }}
            >
              {(servicesStatus[selectedServiceId] ?? true)
                ? "🟢 Услуга Включена"
                : "🔴 Услуга Отключена"}
            </button>
          </div>

          <h1 className={scss.sectionTitle}>
            Настройка услуги: <span>{activeServiceInfo?.title}</span>
          </h1>

          <div className={scss.mastersGrid}>
            {currentServiceData.masters?.length === 0 ? (
              <p className={scss.emptyState}>
                К этой услуге ещё не привязано ни одного мастера.
              </p>
            ) : (
              currentServiceData.masters?.map((master, idx) => (
                <div key={idx} className={scss.masterRow}>
                  <input
                    type="text"
                    className={scss.input}
                    aria-label="Никнейм мастера"
                    value={master.nickname}
                    onChange={(e) =>
                      handleLiveEdit(idx, "nickname", e.target.value)
                    }
                  />
                  <select
                    className={scss.select}
                    aria-label="Статус мастера"
                    value={master.status}
                    onChange={(e) =>
                      handleLiveEdit(idx, "status", e.target.value)
                    }
                  >
                    <option value="active">Свободен</option>
                    <option value="busy">Занят</option>
                  </select>
                  <button
                    type="button"
                    className={scss.btnDelete}
                    onClick={() => handleDeleteMaster(idx)}
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={scss.addMasterForm}>
            <h4>+ Добавить нового мастера</h4>
            <div className={scss.formFields}>
              <input
                type="text"
                className={scss.input}
                placeholder="Никнейм нового мастера"
                aria-label="Никнейм нового мастера"
                value={newMaster.nickname}
                onChange={(e) =>
                  setNewMaster({ ...newMaster, nickname: e.target.value })
                }
              />
              <select
                className={scss.select}
                aria-label="Статус нового мастера"
                value={newMaster.status}
                onChange={(e) =>
                  setNewMaster({ ...newMaster, status: e.target.value })
                }
              >
                <option value="active">Свободен</option>
                <option value="busy">Занят</option>
              </select>
            </div>
            <button
              type="button"
              className={scss.btnAddLocal}
              onClick={handleLocalAddMaster}
            >
              Добавить в список
            </button>
          </div>

          <button
            type="button"
            className={scss.btnSaveAll}
            onClick={handleSaveToFirebase}
          >
            Сохранить изменения мастеров на сервере
          </button>
        </div>
      )}
    </main>
  );
};

export default AdminMasters;
