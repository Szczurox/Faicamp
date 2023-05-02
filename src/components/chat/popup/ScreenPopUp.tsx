import React, { ReactNode } from "react";
import styles from "../../../styles/components/chat/popups/ScreenPopUp.module.scss";

const ScreenPopUp: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className={styles.screen_popup}>
      <div className={styles.screen_popup_box}>{children}</div>
    </div>
  );
};

export default ScreenPopUp;