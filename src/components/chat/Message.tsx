import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Avatar, TextareaAutosize } from "@material-ui/core";
import styles from "../../styles/components/chat/Message.module.scss";
import moment from "moment";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { createFirebaseApp } from "../../firebase/clientApp";
import ContextMenu from "./contextmenu/ContextMenu";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useChannel } from "context/channelContext";
import { useUser } from "context/userContext";
import { useMessage } from "context/messageContext";
import DeleteConfirmPopUp from "./popup/DeleteConfirmPopUp";
import ContextMenuElement from "./contextmenu/ContextMenuElement";

interface MessageProps {
  id: string;
  content: string;
  userid: string;
  file?: string;
  time?: string;
  edited?: boolean;
  children?: ReactNode;
  onImageLoad?: () => void;
}

export interface MessageData {
  id: string; // Message id
  content: string;
  timestamp: string;
  uid: string; // Id of user that sent the message
  file?: string;
  edited?: boolean;
}

type ContextMenuHandle = React.ElementRef<typeof ContextMenu>;

export const Message: React.FC<MessageProps> = ({
  id,
  content,
  time,
  file,
  userid = "uid",
  children,
  onImageLoad,
  edited,
}) => {
  const [nickname, setNickname] = useState<string>("");
  const [nickColor, setNickColor] = useState<string>("white");
  const [avatar, setAvatar] = useState<string>(
    "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png"
  );
  const [input, setInput] = useState<string>(""); // Message edit input
  const [isEditing, setIsEditing] = useState<boolean>(false); // Is message currently being edited
  const [showPopUp, setShowPopUp] = useState<boolean>(false); // Delete confirmation pop-up

  const { channel } = useChannel();
  const { user } = useUser();
  const { message, setCurrentMessage } = useMessage()!;

  const app = createFirebaseApp();
  const db = getFirestore(app!);

  const menuRef = useRef<ContextMenuHandle>(null);
  const userMenuRef = useRef<ContextMenuHandle>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  const messageDoc = doc(
    db,
    "groups",
    "H8cO2zBjCyJYsmM4g5fv",
    "categories",
    channel.idC,
    "channels",
    channel.id,
    "messages",
    id
  );

  const messageContent = (
    <div className={styles.message_content}>
      <p>
        {content}
        {edited && (
          <span className={styles.message_edited_indicator}>{" (edited)"}</span>
        )}
      </p>
    </div>
  );

  const senderInfo = (
    <>
      <div
        className={styles.message_profilePicture}
        onContextMenu={(e) =>
          !isEditing && userMenuRef.current?.handleContextMenu(e)
        }
      >
        <Avatar
          style={{ height: "45px", width: "45px" }}
          src={avatar}
          innerRef={avatarRef}
          onLoad={(_) =>
            !isEditing ? (onImageLoad ? onImageLoad!() : null) : null
          }
        />
      </div>
      <h4 style={{ color: nickColor }}>
        {nickname}
        <span className={styles.message_timestamp}>
          {moment(time).local().format("MMMM Do YYYY [at] hh:mm a")}
        </span>
      </h4>
    </>
  );

  useEffect(() => {
    async function getUserData() {
      if (channel.idG != "") {
        const docMemberSnap = await getDoc(
          doc(db, "groups", channel.idG, "members", userid)
        );
        if (docMemberSnap.exists()) {
          setNickname(docMemberSnap.data().nickname);
          if (docMemberSnap.data().nameColor)
            setNickColor(docMemberSnap.data().nameColor);
          if (docMemberSnap.data().avatar)
            setAvatar(docMemberSnap.data().avatar);
        } else {
          const docSnap = await getDoc(doc(db, "profile", userid));
          if (docSnap.exists()) {
            setNickname(docSnap.data().username);
            if (docSnap.data().avatar) setAvatar(docSnap.data().avatar);
          }
        }
      }
    }

    document.addEventListener("keydown", handleClick);
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleClick);
    getUserData();

    return () => {
      document.removeEventListener("keydown", handleClick);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleClick);
    };
  }, []);

  useEffect(() => {
    if (message.id != id) setIsEditing(false);
  }, [message.id]);

  const handleClick = (e: Event): void => {
    if (
      e.type == "click" ||
      (e.type == "contextmenu" &&
        !elementRef.current?.contains(e.target as Node) &&
        menuRef.current?.getListRef().current! != null &&
        !menuRef.current?.getListRef().current!.contains(e.target as Node)) ||
      avatarRef.current?.contains(e.target as Node) ||
      (e.type == "keydown" && (e as KeyboardEvent).key == "Escape")
    )
      menuRef.current?.closeMenu();
    if (
      e.type == "click" ||
      (e.type == "contextmenu" &&
        !avatarRef.current?.contains(e.target as Node) &&
        userMenuRef.current?.getListRef().current! != null &&
        !userMenuRef.current
          ?.getListRef()
          .current!.contains(e.target as Node)) ||
      (e.type == "keydown" && (e as KeyboardEvent).key == "Escape")
    )
      userMenuRef.current?.closeMenu();
    if (e.type == "keydown" && (e as KeyboardEvent).key == "Escape")
      setIsEditing(false);
  };

  const deleteMessage = async () => {
    setShowPopUp(false);
    await deleteDoc(messageDoc);
    console.log("Deleted: " + id);
  };

  const deleteBegin = (e: any) => {
    if (e.shiftKey == true) {
      deleteMessage();
    } else {
      setShowPopUp(true);
    }
  };

  const editBegin = () => {
    setIsEditing(true);
    setInput(content);
    setCurrentMessage(id);
  };

  const updateMessage = async () => {
    setIsEditing(false);
    await updateDoc(messageDoc, {
      content: input,
      edited: true,
    });
  };

  const editMessage = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Escape") setIsEditing(false);
    if (e.key == "Enter" && e.shiftKey == false && channel.id != "") {
      // Edit Message
      setIsEditing(false);
      e.preventDefault();
      if (input.replace(/\s/g, "").length) updateMessage();
      else {
        // Ask if user wants to delete the message if input is set to empty
        setShowPopUp(true);
      }
    }
  };

  return nickname ? (
    <>
      <ContextMenu ref={menuRef}>
        {userid == user.uid && (
          <>
            <ContextMenuElement onClick={(_) => editBegin()}>
              <EditIcon />
              Edit
            </ContextMenuElement>
          </>
        )}
        {(userid == user.uid ||
          user.permissions.includes("MODERATE_MESSAGES")) && (
          <ContextMenuElement type="red" onClick={deleteBegin}>
            <DeleteIcon />
            Delete
          </ContextMenuElement>
        )}
        <ContextMenuElement onClick={() => navigator.clipboard.writeText(id)}>
          <ContentCopyIcon />
          Copy Message ID
        </ContextMenuElement>
      </ContextMenu>
      <ContextMenu ref={userMenuRef}>
        <ContextMenuElement
          onClick={(_) => navigator.clipboard.writeText(userid)}
        >
          <ContentCopyIcon />
          Copy User ID
        </ContextMenuElement>
      </ContextMenu>
      {showPopUp ? (
        <DeleteConfirmPopUp
          onConfirm={() => (showPopUp ? deleteMessage() : null)}
          onCancel={() => setShowPopUp(false)}
        >
          <div className={styles.message_info}>
            {senderInfo}
            {content && messageContent}
            {file && (
              <div className={styles.message_embed}>
                <img
                  className={styles.message_image_text}
                  src={file}
                  alt="image"
                />
              </div>
            )}
          </div>
        </DeleteConfirmPopUp>
      ) : null}
      <div
        className={styles.message}
        id={id}
        onContextMenu={(e) =>
          !isEditing && menuRef.current?.handleContextMenu(e)
        }
        ref={elementRef}
      >
        <div className={styles.message_info}>
          {senderInfo}
          {!isEditing ? (
            content && messageContent
          ) : (
            <div>
              <div className={styles.message_edit_input}>
                <form>
                  <TextareaAutosize
                    value={input}
                    wrap="soft"
                    maxLength={2000}
                    maxRows={10}
                    disabled={channel.id == ""}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={editMessage}
                    placeholder={`Message #${channel.name}`}
                    onFocus={(e) =>
                      e.target.setSelectionRange(
                        e.target.value.length,
                        e.target.value.length
                      )
                    }
                    autoFocus
                  />
                  <button
                    disabled={channel.id == ""}
                    className={styles.message_edit_input_button}
                    type="submit"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              <p>
                Press Escape to{" "}
                <a
                  className={styles.message_edit_text_event}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </a>{" "}
                / Press Enter to{" "}
                <a
                  className={styles.message_edit_text_event}
                  onClick={() => updateMessage()}
                >
                  Save
                </a>
              </p>
            </div>
          )}
          {file && (
            <div className={styles.message_embed}>
              <a href={file} target="_blank" rel="noreferrer">
                <img
                  className={
                    content != "" || isEditing
                      ? styles.message_image_text
                      : styles.message_image
                  }
                  src={file}
                  alt="image"
                  onLoad={(_) => (onImageLoad ? onImageLoad() : null)}
                />
              </a>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  ) : (
    <div></div>
  );
};

export default Message;
