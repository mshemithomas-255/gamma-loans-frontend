import { useState } from "react";

import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  getStorage,
} from "firebase/storage";
import { storage } from "../firebase/firebase";

const RegistrationForm = () => {
  const [idPhoto, setIdPhoto] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.name === "idPhoto") {
      setIdPhoto(e.target.files[0]);
    } else if (e.target.name === "passportPhoto") {
      setPassportPhoto(e.target.files[0]);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!idPhoto || !passportPhoto) {
      alert("Please upload both ID and passport photos.");
      return;
    }

    //   try {
    //     // Upload ID photo
    //     const idPhotoRef = ref(storage, `documents/id_photos/${idPhoto.name}`);
    //     await uploadBytesResumable(idPhotoRef, idPhoto);
    //     const idPhotoURL = await getDownloadURL(idPhotoRef);

    //     // Upload Passport photo
    //     const passportPhotoRef = ref(
    //       storage,
    //       `documents/passport_photos/${passportPhoto.name}`
    //     );
    //     await uploadBytesResumable(passportPhotoRef, passportPhoto);
    //     const passportPhotoURL = await getDownloadURL(passportPhotoRef);

    //     // Now you can send the URLs to your backend or save them in the user's profile in Firebase Firestore
    //     console.log("ID Photo URL:", idPhotoURL);
    //     console.log("Passport Photo URL:", passportPhotoURL);
    //     console.alert("Files added successfully");

    //     // Continue with the rest of the registration process
    //   } catch (error) {
    //     console.error("Error uploading photos:", error);
    //   }
    // };
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      // const storage = getStorage(storage);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  return (
    <div className="flex flex-col md:flex-row p-3 md:max-w-6xl md:mx-auto gap-5">
      <div>
        <h1 className="text-3xl">
          Help us assist you{" "}
          <span className="text-[#6D1321] font-semibold">better</span>
        </h1>
        <p>Upload clear passport photo and your id (front and back)</p>
      </div>
      <div className="flex flex-col gap-4">
        <form
          onSubmit={handleRegistration}
          className="registration-form flex flex-col gap-3"
        >
          <label htmlFor="id-image">Id images:</label>
          <input
            type="file"
            name="idPhoto"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
          <label htmlFor="id-image">passport image:</label>
          <input
            type="file"
            name="passportPhoto"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
          <button type="submit" className="bg-[#6D1321] text-white p-2 rounded">
            Add Files
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
