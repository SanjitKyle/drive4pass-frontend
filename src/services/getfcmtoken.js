import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
 
export const getFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    let token;
    if (permission === "granted") {
      token = await getToken(messaging, {
        vapidKey: "BCQIL1077QtBpXulTKCtioW-ZOkXnynjOc9P0xmtEyUlfDV0IeOM3J-jfnvD7VreiYjMvJnon0gllJScd1Oqd2g",
      });
      console.log("FCM Token:", token);
    } else {
      console.warn("Notification permission not granted:", permission);
    }
    return token;
  } catch (error) {
    console.error("Error in getFCMToken service:", error);
    throw error;
  }
};
