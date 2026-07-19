export const detectInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  const isInstagram = /Instagram/i.test(ua);
  const isTikTok = /BytedanceWebview|TikTok/i.test(ua);
  const isFacebook = /FBAN|FBAV|FB_IAB/i.test(ua);
  const isTelegram = /Telegram/i.test(ua);
  const isLine = /Line/i.test(ua);
  const isTwitter = /Twitter/i.test(ua);

  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  const isInApp =
    isInstagram || isTikTok || isFacebook || isTelegram || isLine || isTwitter;

  let sourceName = "приложении";
  if (isInstagram) sourceName = "Instagram";
  else if (isTikTok) sourceName = "TikTok";
  else if (isFacebook) sourceName = "Facebook";
  else if (isTelegram) sourceName = "Telegram";
  else if (isTwitter) sourceName = "Twitter/X";

  return { isInApp, isAndroid, isIOS, sourceName };
};

export const openInExternalBrowser = () => {
  const currentUrl = window.location.href;
  const { isAndroid } = detectInAppBrowser();

  if (isAndroid) {
    const noProtocolUrl = currentUrl.replace(/^https?:\/\//, "");
    const intentUrl = `intent://${noProtocolUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  } else {
    window.open(currentUrl, "_system");
  }
};
