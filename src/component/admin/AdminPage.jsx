import React, { useEffect, useState } from "react";
import { db } from "../../firebase/FireBase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import AdminMasters from "./AdminMasters";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import scss from "./AdminPage.module.scss";

const PLAN_ORDER = ["free", "base", "vip"];
const PLAN_LIMITS = { free: 5, base: 10, vip: 20 };
const PLAN_LABELS = {
  free: "Бесплатный",
  base: "Базовый",
  vip: "⭐ VIP План",
};

const AdminPage = () => {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [clanLeaders, setClanLeaders] = useState([]);
  const [clanMembers, setClanMembers] = useState([]);
  const [clanImage, setClanImage] = useState(null);

  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClan, setLoadingClan] = useState(true);

  const [activeSection, setActiveSection] = useState("ads");
  const [carFilter, setCarFilter] = useState("all");

  const [carsSearchQuery, setCarsSearchQuery] = useState("");
  const [usersSearchQuery, setUsersSearchQuery] = useState("");

  const [newType, setNewType] = useState("member");
  const [memberForm, setMemberForm] = useState({
    nickname: "",
    name: "",
    gosNom: "",
    gameId: "KGZ",
    rating: "Member",
    desc: "",
    idField: "",
  });

  useEffect(() => {
    const unsubscribeCars = onSnapshot(collection(db, "cars"), (snapshot) => {
      const carsData = [];
      snapshot.forEach((doc) => {
        carsData.push({ id: doc.id, ...doc.data() });
      });
      setCars(carsData);
      if (loadingCars) setLoadingCars(false);
    });
    return () => unsubscribeCars();
  }, [loadingCars]);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      if (loadingUsers) setLoadingUsers(false);
    });
    return () => unsubscribeUsers();
  }, [loadingUsers]);

  useEffect(() => {
    const unsubLeaders = onSnapshot(
      collection(db, "clan_leaders"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ ...doc.data(), id: doc.id }));
        setClanLeaders(data);
      },
    );

    const unsubMembers = onSnapshot(
      collection(db, "clan_members"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ ...doc.data(), id: doc.id }));
        setClanMembers(data);
        if (loadingClan) setLoadingClan(false);
      },
    );

    return () => {
      unsubLeaders();
      unsubMembers();
    };
  }, [loadingClan]);

  const handleAddClanPerson = async (e) => {
    e.preventDefault();
    try {
      const defaultAvatar =
        "https://static.vecteezy.com/system/resources/thumbnails/009/636/683/small/admin-3d-illustration-icon-png.png";
      const finalProfileImage = clanImage || defaultAvatar;

      if (newType === "leader") {
        await addDoc(collection(db, "clan_leaders"), {
          nickname: memberForm.name,
          desc: memberForm.desc || "Hellloooo",
          tag: memberForm.idField || "ID00",
          gosNom: memberForm.gosNom,
          profile: finalProfileImage,
        });
      } else {
        await addDoc(collection(db, "clan_members"), {
          nickname: memberForm.nickname,
          gosNom: memberForm.gosNom,
          rating: memberForm.rating,
          status: "active",
          profile: finalProfileImage,
        });
      }

      setMemberForm({
        nickname: "",
        name: "",
        gosNom: "",
        rating: "Member",
        desc: "",
        idField: "",
      });
      setClanImage(null);
      toast.success("Успешно добавлено в списки клана!");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при добавлении!");
    }
  };

  const handleDeleteClanPerson = async (id, type) => {
    try {
      const collectionName =
        type === "leader" ? "clan_leaders" : "clan_members";
      await deleteDoc(doc(db, collectionName, id));
      toast.info("Участник исключен из списков клана");
    } catch (err) {
      console.error(err);
      toast.error("Не удалось удалить участника");
    }
  };

  const handleVerify = async (carId, currentStatus) => {
    try {
      await updateDoc(doc(db, "cars", carId), { verified: !currentStatus });
      toast.success(
        currentStatus ? "Объявление скрыто" : "Объявление активировано",
      );
    } catch (e) {
      console.error(e);
      toast.error("Ошибка смены статуса");
    }
  };

  const handleToggleVip = async (carId, currentVipStatus) => {
    try {
      await updateDoc(doc(db, "cars", carId), { isVip: !currentVipStatus });
      toast.success(
        currentVipStatus ? "VIP статус снят" : "VIP статус успешно выдан!",
      );
    } catch (e) {
      console.error(e);
      toast.error("Ошибка изменения VIP-статуса");
    }
  };

  const handleDeleteCar = async (car) => {
    try {
      await deleteDoc(doc(db, "cars", car.id));

      if (car.authorUid) {
        const userRef = doc(db, "users", car.authorUid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const currentAds = userSnap.data().adsUsed || 0;
          await updateDoc(userRef, { adsUsed: Math.max(0, currentAds - 1) });
        }
      }

      toast.warning("Объявление удалено, лимит возвращен пользователю");
    } catch (e) {
      console.error(e);
      toast.error("Ошибка при удалении объявления");
    }
  };

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success(`Роль пользователя успешно изменена на: ${newRole}`);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось изменить роль");
    }
  };

  const handleToggleUserPlan = async (userId, currentPlan) => {
    const currentIndex = PLAN_ORDER.indexOf(currentPlan || "free");
    const nextPlan = PLAN_ORDER[(currentIndex + 1) % PLAN_ORDER.length];
    const nextLimit = PLAN_LIMITS[nextPlan];

    try {
      await updateDoc(doc(db, "users", userId), {
        plan: nextPlan,
        adsLimit: nextLimit,
      });
      toast.success(
        `Тариф изменен на: ${PLAN_LABELS[nextPlan]} (лимит ${nextLimit})`,
      );
    } catch (e) {
      console.error(e);
      toast.error("Ошибка смены тарифа");
    }
  };

  const handleUpdateMarketStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { marketStatus: newStatus });
      toast.info(
        `Доступ к рынку: ${newStatus === "active" ? "Разрешен" : "Запрещен"}`,
      );
    } catch (e) {
      console.error(e);
      toast.error("Ошибка обновления доступа");
    }
  };

  const handleToggleBan = async (user) => {
    const willBan = !user.isBanned;
    let reason = "";

    if (willBan) {
      reason =
        window.prompt(
          "Укажите причину блокировки (мошенничество, нарушение правил и т.д.):",
          "",
        ) || "Не указана";
    }

    try {
      const updateData = {
        isBanned: willBan,
        marketStatus: willBan ? "restricted" : "active",
        banReason: willBan ? reason : "",
      };
      if (willBan) {
        updateData.plan = "free";
        updateData.adsLimit = 5;
      }
      await updateDoc(doc(db, "users", user.id), updateData);

      const carsRef = collection(db, "cars");
      let snapshot;

      if (user.id) {
        const qById = query(carsRef);
        const res = await getDocs(qById);
        snapshot = res.docs.filter((d) => d.data().authorUid === user.id);
      }

      if ((!snapshot || snapshot.length === 0) && user.email) {
        const qByEmail = query(carsRef);
        const res = await getDocs(qByEmail);
        snapshot = res.docs.filter((d) => d.data().authorEmail === user.email);
      }

      if (snapshot && snapshot.length > 0) {
        for (const carDoc of snapshot) {
          await updateDoc(doc(db, "cars", carDoc.id), { verified: !willBan });
        }
      }

      if (willBan) {
        toast.error(`Пользователь ЗАБЛОКИРОВАН (${reason}), объявления скрыты`);
      } else {
        toast.success(
          "Пользователь успешно разблокирован, объявления активны!",
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Ошибка при изменении статуса блокировки");
    }
  };

  const filteredCars = cars.filter((car) => {
    if (carFilter === "pending" && car.verified) return false;
    if (carFilter === "verified" && !car.verified) return false;

    if (carsSearchQuery.trim() !== "") {
      const email = (car.authorEmail || "").toLowerCase();
      const search = carsSearchQuery.toLowerCase().trim();
      return email.includes(search);
    }
    return true;
  });

  const getUserPriority = (user) => {
    if (user.isBanned) return 3;
    if (user.plan === "vip") return 0;
    if (user.marketStatus === "restricted") return 2;
    return 1;
  };

  const filteredUsers = users
    .filter((user) => {
      if (usersSearchQuery.trim() !== "") {
        const email = (user.email || "").toLowerCase();
        const search = usersSearchQuery.toLowerCase().trim();
        return email.includes(search);
      }
      return true;
    })
    .sort((a, b) => getUserPriority(a) - getUserPriority(b));

  if (loadingCars || loadingUsers || loadingClan) {
    return (
      <div className={scss.loader} role="alert">
        Загрузка админ-панели...
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClanImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlanBadgeClass = (plan) => {
    if (plan === "vip") return scss.vipTariff;
    if (plan === "base") return scss.baseTariff;
    return scss.freeTariff || "";
  };

  return (
    <main className={scss.adminPage}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className={scss.adminContainer}>
        <nav
          className={scss.sectionTabs}
          aria-label="Навигация по админ-панели"
        >
          <button
            className={activeSection === "ads" ? scss.activeSectionTab : ""}
            onClick={() => setActiveSection("ads")}
          >
            Объявления ({cars.length})
          </button>
          <button
            className={activeSection === "users" ? scss.activeSectionTab : ""}
            onClick={() => setActiveSection("users")}
          >
            Пользователи ({users.length})
          </button>
          <button
            className={activeSection === "clan" ? scss.activeSectionTab : ""}
            onClick={() => setActiveSection("clan")}
          >
            🛡️ Клан ({clanLeaders.length + clanMembers.length})
          </button>
          <button
            className={
              activeSection === "services" ? scss.activeSectionTab : ""
            }
            onClick={() => setActiveSection("services")}
          >
            🔧 Услуги Детейлинга
          </button>
        </nav>

        <hr className={scss.separator} />

        {activeSection === "ads" && (
          <section aria-label="Управление объявлениями">
            <div className={scss.filterTabs}>
              <div className={scss.tabButtons}>
                <button
                  className={carFilter === "all" ? scss.activeTab : ""}
                  onClick={() => setCarFilter("all")}
                >
                  Все ({cars.length})
                </button>
                <button
                  className={carFilter === "verified" ? scss.activeTab : ""}
                  onClick={() => setCarFilter("verified")}
                >
                  Активные ({cars.filter((c) => c.verified).length})
                </button>
                <button
                  className={carFilter === "pending" ? scss.activeTab : ""}
                  onClick={() => setCarFilter("pending")}
                >
                  Ожидают ({cars.filter((c) => !c.verified).length})
                </button>
              </div>

              <div className={scss.searchBox}>
                <input
                  type="search"
                  placeholder="Поиск по email"
                  value={carsSearchQuery}
                  onChange={(e) => setCarsSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={`${scss.tableWrapper} ${scss.carsTable}`}>
              <table className={scss.adminTable}>
                <thead>
                  <tr>
                    <th>Фото</th>
                    <th>Автомобиль</th>
                    <th>Продавец</th>
                    <th>Характеристики</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((car) => (
                    <tr key={car.id} className={car.isVip ? scss.vipRow : ""}>
                      <td>
                        <img
                          src={car.images?.[0] || ""}
                          alt={car.title || "Фото авто"}
                          className={scss.carThumb}
                        />
                      </td>
                      <td>
                        <div className={scss.carInfo}>
                          <strong>{car.title}</strong>
                          <span>
                            {car.price}{" "}
                            {car.currency === "stars"
                              ? "⭐️"
                              : car.currency?.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td>{car.authorEmail}</td>
                      <td>
                        {car.power} HP {car.isVip && "⭐ VIP"}
                      </td>
                      <td>
                        <span
                          className={`${scss.statusBadge} ${car.verified ? scss.verified : scss.pending}`}
                        >
                          {car.verified ? "Активен" : "Скрыт"}
                        </span>
                      </td>
                      <td>
                        <div className={scss.actions}>
                          <button
                            className={
                              car.verified ? scss.btnUnverify : scss.btnVerify
                            }
                            onClick={() => handleVerify(car.id, car.verified)}
                          >
                            {car.verified ? "Скрыть" : "Активировать"}
                          </button>
                          <button
                            className={`${scss.btnVerify} ${scss.btnVipToggle}`}
                            onClick={() => handleToggleVip(car.id, car.isVip)}
                          >
                            {car.isVip ? "Убрать VIP" : "Сделать VIP"}
                          </button>
                          <button
                            className={scss.btnDelete}
                            onClick={() => handleDeleteCar(car)}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCars.length === 0 && (
                    <tr>
                      <td colSpan="6" className={scss.noResults}>
                        Объявления не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "users" && (
          <section aria-label="Управление пользователями">
            <div className={scss.searchBoxSection}>
              <input
                type="search"
                placeholder="Поиск по email"
                value={usersSearchQuery}
                onChange={(e) => setUsersSearchQuery(e.target.value)}
              />
            </div>

            <div className={scss.tableWrapper}>
              <table className={scss.adminTable}>
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль сайта</th>
                    <th>Тарифный План</th>
                    <th>Лимит</th>
                    <th>Доступ к рынку</th>
                    <th>Модерация</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const userPlan =
                      user.plan === "vip" || user.plan === "base"
                        ? user.plan
                        : "free";
                    return (
                      <tr
                        key={user.id}
                        className={user.isBanned ? scss.bannedRow : ""}
                      >
                        <td>
                          <div className={scss.carInfo}>
                            <strong>{user.email}</strong>
                            {user.isBanned && (
                              <span className={scss.bannedText}>
                                Заблокирован
                                {user.banReason ? ` — ${user.banReason}` : ""}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`${scss.tariffBadge} ${getPlanBadgeClass(userPlan)}`}
                            onClick={() =>
                              handleToggleUserPlan(user.id, userPlan)
                            }
                          >
                            {PLAN_LABELS[userPlan]}
                          </button>
                        </td>
                        <td>
                          <div className={scss.specs}>
                            <strong>
                              {user.adsUsed || 0} из {user.adsLimit || 5}
                            </strong>
                          </div>
                        </td>
                        <td>
                          <select
                            className={scss.statusSelect}
                            value={user.marketStatus || "active"}
                            onChange={(e) =>
                              handleUpdateMarketStatus(user.id, e.target.value)
                            }
                            disabled={user.isBanned}
                          >
                            <option value="active">Разрешен</option>
                            <option value="restricted">Запрещен</option>
                          </select>
                        </td>
                        <td>
                          <div className={scss.actions}>
                            <button
                              className={
                                user.isBanned ? scss.btnUnban : scss.btnBan
                              }
                              onClick={() => handleToggleBan(user)}
                            >
                              {user.isBanned
                                ? "Разблокировать"
                                : "Забанить (мошенничество)"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className={scss.noResults}>
                        Пользователи не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "clan" && (
          <section className={scss.clanSection} aria-label="Управление кланом">
            <form onSubmit={handleAddClanPerson} className={scss.clanForm}>
              <h3>➕ Добавить в списки клана</h3>
              <div className={scss.formGrid}>
                <div className={scss.inputGroup}>
                  <label htmlFor="clanCategory">Категория</label>
                  <select
                    id="clanCategory"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className={scss.statusSelect}
                  >
                    <option value="member">Обычный Участник / Офицер</option>
                    <option value="leader">Лидер клана (Верхний блок)</option>
                  </select>
                </div>

                {newType === "member" ? (
                  <>
                    <div className={scss.inputGroup}>
                      <label htmlFor="clanNickname">Игровой Никнейм</label>
                      <input
                        id="clanNickname"
                        type="text"
                        required
                        value={memberForm.nickname}
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            nickname: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={scss.inputGroup}>
                      <label htmlFor="clanRank">Звание в клане</label>
                      <select
                        id="clanRank"
                        value={memberForm.rating}
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            rating: e.target.value,
                          })
                        }
                        className={scss.statusSelect}
                      >
                        <option value="Member">Member</option>
                        <option value="Officer">Officer</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={scss.inputGroup}>
                      <label htmlFor="leaderName">Имя / Ник Лидера</label>
                      <input
                        id="leaderName"
                        type="text"
                        required
                        value={memberForm.name}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className={scss.inputGroup}>
                      <label htmlFor="leaderId">ID (Тег)</label>
                      <input
                        id="leaderId"
                        type="text"
                        required
                        value={memberForm.idField}
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            idField: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={scss.inputGroup}>
                      <label htmlFor="leaderDesc">Описание</label>
                      <input
                        id="leaderDesc"
                        type="text"
                        value={memberForm.desc}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, desc: e.target.value })
                        }
                        placeholder="Hellloooo"
                      />
                    </div>
                  </>
                )}

                <div className={scss.inputGroup}>
                  <label htmlFor="gosNom">Гос. Номер машины</label>
                  <input
                    id="gosNom"
                    type="text"
                    required
                    value={memberForm.gosNom}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, gosNom: e.target.value })
                    }
                    placeholder="04 777 NOM"
                  />
                </div>

                <div className={scss.inputGroupFile}>
                  <label htmlFor="clanImageFile">
                    Фото участника (из галереи)
                  </label>
                  <input
                    id="clanImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {clanImage && (
                    <div className={scss.imagePreviewWrapper}>
                      <img
                        src={clanImage}
                        alt="Превью участника клана"
                        className={scss.previewAvatar}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className={scss.btnVerify}>
                Сохранить и опубликовать
              </button>
            </form>

            <h3 className={scss.tableTitle}>👑 Корона клана (Лидеры)</h3>
            <div className={scss.tableWrapper}>
              <table className={scss.adminTable}>
                <thead>
                  <tr>
                    <th>Никнейм</th>
                    <th>ID игрока</th>
                    <th>Гос Номер</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {clanLeaders.map((l) => (
                    <tr key={l.id}>
                      <td>{l.nickname || l.name}</td>
                      <td>{l.tag}</td>
                      <td>{l.gosNom}</td>
                      <td>
                        <button
                          className={scss.btnDelete}
                          onClick={() => handleDeleteClanPerson(l.id, "leader")}
                        >
                          Исключить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className={scss.tableTitle}>🛡️ Состав клана</h3>
            <div className={scss.tableWrapper}>
              <table className={scss.adminTable}>
                <thead>
                  <tr>
                    <th>Никнейм</th>
                    <th>Гос. Номер</th>
                    <th>Ранг</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {clanMembers.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nickname}</td>
                      <td>{m.gosNom || "—"}</td>
                      <td>{m.rating}</td>
                      <td>
                        <button
                          className={scss.btnDelete}
                          onClick={() => handleDeleteClanPerson(m.id, "member")}
                        >
                          Исключить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "services" && <AdminMasters />}
      </div>
    </main>
  );
};

export default AdminPage;
