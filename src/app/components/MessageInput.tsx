import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase/config';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  sendMessage: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  image: string | null;
  setImage: (value: string | null) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  sendMessage,
  message,
  setMessage,
  image,
  setImage,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const storage = getStorage(app);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected.');
      return;
    }

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL);
        setFile(null);
        setImage(downloadURL);
        setImagePreview(null);
        (document.getElementById('my_modal_3') as HTMLDialogElement)?.close();
      }
    );
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };
  

  return (
    <div className='relative flex items-center p-4 border-t border-gray-200'>
      <FaPaperclip
        onClick={() => (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal()}
        className={`${image ? 'text-blue-500' : 'text-gray-500'} mr-2 cursor-pointer`}
      />

      <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="mr-2">
        😊
      </button>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        type='text'
        placeholder='Type a message...'
        className='flex-1 border-none p-2 outline-none'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
          }
        }}
      />

      <FaPaperPlane
        onClick={sendMessage}
        className='text-blue-500 cursor-pointer ml-2'
      />

      {showEmojiPicker && (
        <div className='absolute right-0 bottom-full p-2 z-10'>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
          />
        </div>
      )}

      {/* Image Upload Modal */}
      <dialog id='my_modal_3' className='modal'>
        <div className='modal-box'>
          <form method='dialog' className="flex flex-col gap-4">
            {imagePreview && (
              <img src={imagePreview} alt='Uploaded preview' className='max-h-60 w-60 mb-4 object-contain' />
            )}
            <input type='file' accept='image/*' onChange={handleFileChange} />
            <button type="button" onClick={handleUpload} className='btn btn-sm btn-primary'>
              Upload
            </button>
            {uploadProgress !== null && (
              <progress value={uploadProgress} max='100' className='w-full'></progress>
            )}
          </form>
          <button
            onClick={() => (document.getElementById('my_modal_3') as HTMLDialogElement)?.close()}
            className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
          >
            ✕
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default MessageInput;
