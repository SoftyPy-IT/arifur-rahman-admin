/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const MillatConfig = {
  height: 500,
  toolbarAdaptive: false,
  spellcheck: false,
  disablePlugins: ["speechRecognition"],
  enableDragAndDropFileToEditor: true,
  imageDefaultWidth: 250,

  uploader: {
    url: "https://api.cloudinary.com/v1_1/do2cbxkkj/image/upload",
    format: "json",
    prepareData: (formData: FormData) => {
      const file = formData.get("files[0]");
      if (!file) throw new Error("No file selected");
      formData.delete("files[0]");
      formData.append("file", file);
      formData.append("upload_preset", "millat");
      return formData;
    },
    isSuccess: (resp: any) => !!resp.secure_url,
    process: (resp: any) => ({
      files: resp.secure_url ? [resp.secure_url] : [],
      path: resp.secure_url,
      error: resp.error,
      msg: resp.message,
    }),
    defaultHandlerSuccess: function (response: any, editor: any) {
      const url = response?.files?.[0];
      if (url && editor?.selection) {
        editor.selection.insertImage(url, null, 250);
      }
    },
    error: (err: Error) => {
      console.error("Cloudinary Upload Error:", err.message);
    },
  },

  imageProcessor: {
    replaceDataURIToBlobIdInView: true, // ✅ correct type
  },

  style: {
    ".jodit-editor img": {
      maxWidth: "100%",
      height: "auto",
    },
    ".jodit-wysiwyg": {
      color: "#000 !important",
    },
  },

  events: {
    afterInit: (editor: any) => {
      console.log("Jodit Editor Initialized");
    },
    beforeDestruct: () => {
      console.log("Jodit Editor Destroyed");
    },
  },
};
