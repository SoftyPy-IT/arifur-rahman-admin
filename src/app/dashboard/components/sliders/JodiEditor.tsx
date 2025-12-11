/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Jodit } from "jodit-react";
import { MillatConfig } from "@/config/joditEditor.config";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface MillatEditorProps {
  name: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
}

const MillatEditor: React.FC<MillatEditorProps> = ({
  name,
  label,
  value = "",
  onChange,
}) => {
  const editorRef = useRef<Jodit | null>(null);
  const [editorValue, setEditorValue] = useState(value);

  // Update only when parent value changes  
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const config = {
    ...MillatConfig,
    uploader: {
      ...MillatConfig.uploader,
      defaultHandlerSuccess: function (this: Jodit, response: any) {
        if (response.files?.length) {
          const imageUrl = response.files[0];
          this.selection.insertImage(imageUrl, null, 250);
        }
      },
    },
  };

  return (
    <div className="jodit-custom">
      {label && <label htmlFor={name}>{label}</label>}
      <JoditEditor
        ref={editorRef}
        value={editorValue}
        config={config}
        // Only update on blur to avoid cursor jumping
        onBlur={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        className="text-black"
      />
    </div>
  );
};

export default MillatEditor;
