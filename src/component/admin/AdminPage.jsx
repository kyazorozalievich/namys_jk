import React, { useEffect, useState } from "react";
import { db } from "../../firebase/FireBase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
  setDoc,
} from "firebase/firestore";
import AdminMasters from "./AdminMasters";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import scss from "./AdminPage.module.scss";

const DETAILING_LIST = [
  { id: "plates", title: "Изготовление гос номеров" },
  { id: "gg_services", title: "Всем известные GG услуги" },
  { id: "badges", title: "Шильдики и таблички на любую машину" },
  { id: "market", title: "Продажа авто и аккаунтов" },
  { id: "branding", title: "Логотипы и брендинг кланов" },
  { id: "montage", title: "Фото- и видеомонтажи тачек" },
];

const AdminPage = () => {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [clanLeaders, setClanLeaders] = useState([]);
  const [clanMembers, setClanMembers] = useState([]);
  const [detailingServices, setDetailingServices] = useState({});
  const [clanImage, setClanImage] = useState(null);

  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingClan, setLoadingClan] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

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
      loadingCars && setLoadingCars(false);
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
      loadingUsers && setLoadingUsers(false);
    });
    return () => unsubscribeUsers();
  }, [loadingUsers]);

  useEffect(() => {
    const unsubLeaders = onSnapshot(
      collection(db, "clan_leaders"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setClanLeaders(data);
      },
    );

    const unsubMembers = onSnapshot(
      collection(db, "clan_members"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setClanMembers(data);
        loadingClan && setLoadingClan(false);
      },
    );

    return () => {
      unsubLeaders();
      unsubMembers();
    };
  }, [loadingClan]);

  useEffect(() => {
    const unsubscribeServices = onSnapshot(
      collection(db, "detailing_services"),
      (snapshot) => {
        const servicesData = {};
        snapshot.forEach((doc) => {
          servicesData[doc.id] = doc.data().active;
        });
        setDetailingServices(servicesData);
        setLoadingServices(false);
      },
    );
    return () => unsubscribeServices();
  }, []);

  const handleToggleService = async (serviceId, currentStatus) => {
    try {
      const newStatus = currentStatus === undefined ? false : !currentStatus;
      await setDoc(
        doc(db, "detailing_services", serviceId),
        { active: newStatus },
        { merge: true },
      );
      toast.success(`Статус услуги успешно обновлен!`);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось изменить статус услуги");
    }
  };

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
          id: memberForm.idField || "ID00",
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
      if (car.authorId) {
        await updateDoc(doc(db, "users", car.authorId), {
          adsUsed: increment(-1),
        });
      } else if (car.authorEmail) {
        const q = query(
          collection(db, "users"),
          where("email", "==", car.authorEmail),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, "users", snap.docs[0].id), {
            adsUsed: increment(-1),
          });
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
    const newPlan = currentPlan === "vip" ? "free" : "vip";
    try {
      await updateDoc(doc(db, "users", userId), {
        plan: newPlan,
        adsLimit: newPlan === "vip" ? 20 : 10,
      });
      toast.success(
        `Тариф изменен на ${newPlan === "vip" ? "VIP" : "Базовый"}`,
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

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ БАНА
  const handleToggleBan = async (user) => {
    const willBan = !user.isBanned;
    try {
      // 1. Обновляем статус самого пользователя
      const updateData = {
        isBanned: willBan,
        marketStatus: willBan ? "restricted" : "active",
      };
      if (willBan) {
        updateData.plan = "free";
        updateData.adsLimit = 10;
      }
      await updateDoc(doc(db, "users", user.id), updateData);

      // 2. Ищем и скрываем/активируем его машины пакетным запросом (Batch)
      const batch = writeBatch(db);

      // Делаем двойную проверку: ищем и по id, и по email, чтобы точно найти документы
      const carsRef = collection(db, "cars");
      let snapshot;

      if (user.id) {
        const qById = query(carsRef, where("authorId", "==", user.id));
        snapshot = await getDocs(qById);
      }

      // Если по ID ничего не нашлось, но есть email — ищем по email
      if ((!snapshot || snapshot.empty) && user.email) {
        const qByEmail = query(carsRef, where("authorEmail", "==", user.email));
        snapshot = await getDocs(qByEmail);
      }

      // Если машины найдены, добавляем их изменения в batch
      if (snapshot && !snapshot.empty) {
        snapshot.forEach((carDoc) => {
          // Если баним — verified становится false (в ожидание), если разбаниваем — true (активен)
          batch.update(doc(db, "cars", carDoc.id), { verified: !willBan });
        });
        await batch.commit();
      }

      if (willBan) {
        toast.error(
          "Пользователь ЗАБЛОКИРОВАН, объявления переведены в ожидание",
        );
      } else {
        toast.success(
          "Пользователь успешно разблокирован, объявления активны!",
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(
        "Ошибка при изменении статуса блокировки и обновлении объявлений",
      );
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

  const filteredUsers = users.filter((user) => {
    if (usersSearchQuery.trim() !== "") {
      const email = (user.email || "").toLowerCase();
      const search = usersSearchQuery.toLowerCase().trim();
      return email.includes(search);
    }
    return true;
  });

  if (loadingCars || loadingUsers || loadingClan || loadingServices) {
    return <div className={scss.loader}>Загрузка админ-панели...</div>;
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

  return (
    <section className={scss.adminPage}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className={scss.adminContainer}>
        <div className={scss.sectionTabs}>
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
        </div>

        <hr className={scss.separator} />

        {/* 1. ОБЪЯВЛЕНИЯ */}
        {activeSection === "ads" && (
          <>
            <div
              className={scss.filterTabs}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
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
                  type="text"
                  placeholder="Поиск по email (например: ник или ник@gmail.com)"
                  value={carsSearchQuery}
                  onChange={(e) => setCarsSearchQuery(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    width: "300px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div className={scss.tableWrapper}>
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
                          alt=""
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
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Объявления не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. ПОЛЬЗОВАТЕЛИ */}
        {activeSection === "users" && (
          <>
            <div
              className={scss.searchBox}
              style={{
                marginBottom: "15px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <input
                type="text"
                placeholder="Поиск по email (например: ник или ник@gmail.com)"
                value={usersSearchQuery}
                onChange={(e) => setUsersSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "300px",
                  fontSize: "14px",
                }}
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
                  {filteredUsers.map((user) => (
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
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={scss.actions}>
                          <button
                            className={scss.btnRoleToggle}
                            onClick={() => handleUpdateRole(user.id, user.role)}
                          >
                            {user.role === "admin"
                              ? "👑 Администратор"
                              : "Пользователь"}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${scss.tariffBadge} ${user.plan === "vip" ? scss.vipTariff : scss.baseTariff}`}
                          onClick={() =>
                            handleToggleUserPlan(user.id, user.plan)
                          }
                        >
                          {user.plan === "vip" ? "⭐ VIP План" : "Базовый"}
                        </span>
                      </td>
                      <td>
                        <div className={scss.specs}>
                          <strong>
                            {user.adsUsed || 0} из {user.adsLimit || 10}
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
                            {user.isBanned ? "Разблокировать" : "Забанить"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Пользователи не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 3. КЛАН */}
        {activeSection === "clan" && (
          <div className={scss.clanSection}>
            <form onSubmit={handleAddClanPerson} className={scss.clanForm}>
              <h3>➕ Добавить в списки клана</h3>
              <div className={scss.formGrid}>
                <div className={scss.inputGroup}>
                  <label>Категория</label>
                  <select
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
                      <label>Игровой Никнейм</label>
                      <input
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
                      <label>Звание в клане</label>
                      <select
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
                      <label>Имя / Ник Лидера</label>
                      <input
                        type="text"
                        required
                        value={memberForm.name}
                        onChange={(e) =>
                          setMemberForm({ ...memberForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className={scss.inputGroup}>
                      <label>ID (Тег)</label>
                      <input
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
                      <label>Описание</label>
                      <input
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
                  <label>Гос. Номер машины</label>
                  <input
                    type="text"
                    required
                    value={memberForm.gosNom}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, gosNom: e.target.value })
                    }
                    placeholder="04 777 NOM"
                  />
                </div>

                <div
                  className={scss.inputGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label>Фото участника (из галереи)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ border: "none", padding: "5px 0" }}
                  />
                  {clanImage && (
                    <div style={{ marginTop: "10px" }}>
                      <img
                        src={clanImage}
                        alt="Превью"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
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
            <div className={scss.tableWrapper} style={{ marginBottom: "30px" }}>
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
                      {/* У лидеров ник хранился в nickname/name, подправлено */}
                      <td>{l.nickname || l.name}</td>
                      <td>{l.id}</td>
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
          </div>
        )}

        {/* 4. УПРАВЛЕНИЕ УСЛУГАМИ ДЕТЕЙЛИНГА */}
        {activeSection === "services" && <AdminMasters />}
      </div>
    </section>
  );
};

export default AdminPage;
