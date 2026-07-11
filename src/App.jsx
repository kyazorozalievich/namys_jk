import "./App.css";
import { Route, Routes } from "react-router-dom";
import Footer from "./component/layout/Footer/Footer";
import Hedaer from "./component/layout/Header/Hedaer";
import MainPage from "./component/pages/Main/MainPage";
import AboutPage from "./component/pages/About/AboutPage";
import DetailingPage from "./component/pages/Detailing/DetailingPage";
import ShopPage from "./component/pages/Shopping/ShopPage";
import ShopCars from "./component/pages/Shopping/ShopCars";
import Create from "./component/pages/Shopping/Create";
import ProfileMenu from "./component/layout/Profile/ProfileMenu";
import AdminRoute from "./component/admin/AdminRoute";
import AdminPage from "./component/admin/AdminPage";
import UserCars from "./component/layout/Profile/UserCars";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NumberMaster from "./component/pages/Detailing/NumberMaster/NumberMaster";
import GGMaster from "./component/pages/Detailing/GGMaster/GGMaster";
import IconMaster from "./component/pages/Detailing/IconMaster/IconMaster";
import LogoMaster from "./component/pages/Detailing/LogoMaster/LogoMaster";
import MobiMaster from "./component/pages/Detailing/MobiMaster/MobiMaster";

function App() {
  const data = [
    { id: 1, path: "/", page: <MainPage /> },
    { id: 2, path: "/about", page: <AboutPage /> },
    { id: 3, path: "/shop", page: <ShopPage /> },
    { id: 4, path: "/detailing", page: <DetailingPage /> },
    { id: 5, path: "/shop/car", page: <ShopCars /> },
    { id: 6, path: "/profile/account", page: <ProfileMenu /> },
    { id: 7, path: "/profile/create", page: <Create /> },
    { id: 8, path: "/profile/userCars", page: <UserCars /> },
    { id: 9, path: "/detailing/plates", page: <NumberMaster /> },
    { id: 10, path: "/detailing/gg", page: <GGMaster /> },
    { id: 11, path: "/detailing/badges", page: <IconMaster /> },
    { id: 12, path: "/detailing/branding", page: <LogoMaster /> },
    { id: 13, path: "/detailing/montage", page: <MobiMaster /> },
    // { id: 8, path: "/detailing", page: <UserCars /> },
  ];

  return (
    <div className="app">
      <Hedaer />
      <div className="mainContent">
        <Routes>
          {data.map((el) => (
            <Route key={el.id} path={el.path} element={el.page} />
          ))}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </div>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
