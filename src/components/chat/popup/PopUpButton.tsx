import React, { ReactNode, useCallback, useState } from "react";
import styles from "../../../styles/components/chat/popups/PopUpButton.module.scss";

export type ButtonColor = "red" | "grey";

// Normal, onHover, onPress
export const buttonColors = new Map<ButtonColor, [string, string, string]>([
  ["red", ["#ff504d", "#e84846", "#d14341"]],
  ["grey", ["#5f6a6e", "#808b90", "#6b7478"]],
]);

export interface PopUpButtonProps {
  children: ReactNode;
  color?: [string, string, string];
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const PopUpButton: React.FC<PopUpButtonProps> = ({
  children,
  color = ["#5f6a6e", "#808b90", "#6b7478"],
  onClick,
}) => {
  const [isHover, setIsHover] = useState(false); // Is user hovering over the button
  const [isPressed, setIsPressed] = useState(false); // Is user pressing the button

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);

    document.addEventListener(
      "mouseup",
      () => {
        setIsPressed(false);
      },
      { once: true }
    );
  }, []);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onMouseDown={handleMouseDown}
      className={styles.popup_button}
      style={{
        backgroundColor: isPressed ? color[2] : isHover ? color[1] : color[0],
      }}
    >
      {children}
    </button>
  );
};

export default PopUpButton;