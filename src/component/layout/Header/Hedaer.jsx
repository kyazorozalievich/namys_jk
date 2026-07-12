import React, { useContext, useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiCarWashingFill, RiTeamFill } from "react-icons/ri";
import { FaUserCheck } from "react-icons/fa6";
import { MdAdminPanelSettings } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { AiFillHome } from "react-icons/ai";
import { GiAutoRepair } from "react-icons/gi";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../../firebase/FireBase";
import { AuthContext } from "../../context/AuthContext";
import { ModalContext } from "../../../ui/ModalContext";
import { useUserProfile } from "../Profile/useUserProfile";
import scss from "./Header.module.scss";
import logo from "../../../data/images/fullogo.png";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkMarketAccess } = useContext(ModalContext);
  const { profile } = useUserProfile();
  const { user } = useContext(AuthContext);

  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    if (openProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openProfile]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Ошибка авторизации:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setOpenProfile(false);
  };

  const handleAdminClick = () => {
    if (profile?.role === "admin") {
      navigate("/admin");
    } else {
      alert(
        "Доступ запрещен. Эта панель только для Администрации клана NAMYS JK.",
      );
    }
  };

  return (
    <header className={scss.header}>
      <div className="container">
        <div className={scss.navContainer}>
          <div
            className={scss.logoWrapper}
            onClick={() => navigate("/")}
            role="link"
            tabIndex={0}
          >
            <img src={logo} alt="Клан NAMYS JK - Главная" />
          </div>

          <nav className={scss.pages} aria-label="Основная навигация">
            <NavLink
              to="/"
              className={location.pathname === "/" ? scss.main : ""}
            >
              <AiFillHome />
              <span className={scss.text}>Главная</span>
            </NavLink>

            <NavLink
              to="/about"
              className={location.pathname === "/about" ? scss.main : ""}
            >
              <RiTeamFill />
              <span className={scss.text}>О Клане</span>
            </NavLink>

            <NavLink
              to="/detailing"
              className={location.pathname === "/detailing" ? scss.main : ""}
            >
              <GiAutoRepair />
              <span className={scss.text}>Мастерская</span>
            </NavLink>

            <NavLink
              to="/shop"
              className={location.pathname === "/shop" ? scss.main : ""}
            >
              <RiCarWashingFill />
              <span className={scss.text}>Авторынок</span>
            </NavLink>
          </nav>

          <div className={scss.icons}>
            {profile?.role === "admin" && (
              <div
                className={scss.admin}
                onClick={handleAdminClick}
                title="Админ-панель"
              >
                <MdAdminPanelSettings className={scss.adminIcon} />
              </div>
            )}

            {user ? (
              <div
                ref={dropdownRef}
                className={scss.profile}
                onClick={() => setOpenProfile(!openProfile)}
              >
                <img
                  className={scss.avatar}
                  src={user.photoURL || "https://placeholder.com/150"}
                  alt={user.displayName || "Аватар пользователя"}
                  referrerPolicy="no-referrer"
                />

                <div className={scss.info}>
                  <h4>{user.displayName}</h4>
                  <p>Онлайн</p>
                </div>

                {openProfile && (
                  <div
                    className={scss.dropdown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      onClick={() => {
                        navigate("/profile/account");
                        setOpenProfile(false);
                      }}
                    >
                      <FaUserCheck /> Мой профиль
                    </span>

                    <span
                      onClick={() => {
                        checkMarketAccess(profile);
                        setOpenProfile(false);
                      }}
                    >
                      <RiCarWashingFill /> Разместить машину
                    </span>

                    <button onClick={logout}>
                      <BiLogOut /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={scss.login} onClick={loginWithGoogle}>
                <FaUserCheck />
                <span>Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
