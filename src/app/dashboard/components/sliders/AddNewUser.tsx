import React, { useState } from "react";
import { MdAddAPhoto } from "react-icons/md";

const AddNewUser = () => {
  const [fileName, setFileName] = useState("No File Chosen");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
    } else {
      setFileName("No File Chosen");
    }
  };

  return (
    <div className=" h-full min-h-[500px] text-black">
      <div className="max-w-4xl px-6 pt-20 flex flex-col  gap-10 justify-between items-center pb-32">
        <label htmlFor="upload profile picture">
          <div
            onClick={() => document.getElementById("upload_image")?.click()}
            className="flex items-center flex-col justify-center p-5 border border-blue-700 bg-white"
          >
            <MdAddAPhoto className="text-5xl" />
            <p>Upload Profile Picture</p>
            <p className="bg-slate-300 px-2 py-1 mt-2">{fileName}</p>
          </div>
          <input
            onChange={handleFileChange}
            className="relative hidden left-12"
            type="file"
            name="image"
            id="upload_image"
          />
        </label>

        <input
          type="text"
          placeholder="Name"
          className="md:w-[350px] w-[250px] bg-white border border-blue-700  px-4 py-2 focus:outline-none "
        />
        <input
          type="email"
          placeholder="Email"
          className="md:w-[350px] w-[250px] bg-white border border-blue-700  px-4 py-2 focus:outline-none "
        />
        <label htmlFor="current role">
          <select
            className="md:w-[350px] bg-white w-[250px] py-2 px-3 border border-blue-700"
            name="currentRole"
            id="currentRole"
            defaultValue={"currentRole"}
          >
            <option value="currentRole" disabled>
              Current Role
            </option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <input
          type="submit"
          value="Submit"
          className="md:w-[350px] text-white w-[250px] bg-orange-600 py-2 px-3 active:scale-95"
        />
      </div>
    </div>
  );
};

export default AddNewUser;
