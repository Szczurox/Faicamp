import React, { useState } from "react";
import styles from "../../../styles/components/chat/popups/UploadFilePopUp.module.scss";
import ScreenPopUp from "./ScreenPopUp";
import { useChannel } from "../../../context/channelContext";
import { TextareaAutosize } from "@material-ui/core";

const SlowDownPopUp: React.FC<{
  fileUrl: string;
  chatInput: string;
  uploadFile: (input: string) => void;
  cancelled: () => void;
}> = ({ uploadFile, cancelled, fileUrl, chatInput }) => {
  const [input, setInput] = useState(chatInput);

  const { channel } = useChannel();

  const uploadFileKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Enter" && e.shiftKey == false && channel.id != "") {
      e.preventDefault();
      uploadFile(input);
    }
  };

  return (
    <ScreenPopUp>
      <div>
        <img
          className={styles.upload_file_image}
          src={fileUrl}
          alt="Image couldn't load"
        />
        <p>
          Upload to <b>#{channel.name}</b>
        </p>
        <div className={styles.popup_input}>
          <form>
            <TextareaAutosize
              value={input}
              maxRows={10}
              wrap="soft"
              maxLength={2000}
              disabled={channel.id == ""}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => uploadFileKey(e)}
              placeholder={`Message #${channel.name}`}
              autoFocus
            />
          </form>
        </div>
        <div className={styles.popup_buttons}>
          <div
            className={styles.popup_cancel}
            onClick={(_) => {
              setInput("");
              cancelled();
            }}
          >
            Cancel
          </div>
          <button
            className={styles.popup_upload}
            onClick={(_) => uploadFile(input)}
          >
            Upload
          </button>
        </div>
      </div>
    </ScreenPopUp>
  );
};

export default SlowDownPopUp;