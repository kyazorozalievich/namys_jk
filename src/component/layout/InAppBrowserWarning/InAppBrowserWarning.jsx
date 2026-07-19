import React, { useState, useEffect } from "react";
import {
  detectInAppBrowser,
  openInExternalBrowser,
} from "../../../utils/InAppBrowser";
import scss from "./InAppBrowserWarning.module.scss";

const InAppBrowserWarning = () => {
  const [visible, setVisible] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    const info = detectInAppBrowser();
    if (info.isInApp) {
      setBrowserInfo(info);
      setVisible(true);
    }
  }, []);

  if (!visible || !browserInfo) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(
      "Ссылка скопирована! Вставьте её в адресную строку Chrome или Safari.",
    );
  };

  return (
    <div className={scss.overlay}>
      <div className={scss.banner}>
        <h2>⚠️ Вход через Google недоступен</h2>
        <p>
          Вы открыли сайт внутри приложения <b>{browserInfo.sourceName}</b>.
          Google запрещает вход через встроенные браузеры соцсетей из
          соображений безопасности.
        </p>
        <p>Чтобы войти, откройте сайт в обычном браузере:</p>

        {browserInfo.isAndroid ? (
          <button className={scss.mainBtn} onClick={openInExternalBrowser}>
            Открыть в Chrome
          </button>
        ) : (
          <>
            <p className={scss.iosHint}>
              На iPhone нажмите на иконку <b>⋯</b> или <b>共有</b> вверху/внизу
              экрана и выберите <b>"Открыть в Safari"</b>.
            </p>
            <button className={scss.secondaryBtn} onClick={handleCopyLink}>
              Скопировать ссылку сайта
            </button>
          </>
        )}

        <button className={scss.closeBtn} onClick={() => setVisible(false)}>
          Продолжить без входа (объявления смотреть можно)
        </button>
      </div>
    </div>
  );
};

export default InAppBrowserWarning;
