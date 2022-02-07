import Cheerio from "cheerio";
import JSZip from "jszip";
import { ChangeEvent, useCallback } from "react";
import { TextArea } from "./common";

interface TranslationFormProps {
  textFile: string;
  onTextFileChange: (arg: string) => void;
}
function TranslationForm({
  textFile,
  onTextFileChange: handleTextFileChange,
}: TranslationFormProps) {
  const handleFileInput = useCallback(
    ({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
      if (files === null) return;
      const file = files[0];
      if (file.name.match(/.docx$/)) {
        JSZip.loadAsync(file)
          .then((zip) => zip.file("word/document.xml")!.async("string"))
          .then((xml) =>
            Cheerio.load(xml, {
              normalizeWhitespace: true,
              xmlMode: true,
            })
          )
          .then(($) => {
            const out: string[] = [];
            $("w\\:t").each((_, el) => {
              out.push($(el).text());
            });
            handleTextFileChange(out.join());
          });
      } else {
        const reader = new FileReader();
        reader.addEventListener("load", ({ target }) => {
          const content = target?.result as string;
          handleTextFileChange(content.trim());
        });
        reader.readAsText(file);
      }
    },
    [handleTextFileChange]
  );

  return (
    <section className="flex flex-col gap-2">
      <TextArea
        label="원문"
        className="flex-grow"
        innerClassName="resize-none h-full"
        value={textFile}
        onChange={(e) => handleTextFileChange(e.target.value)}
      ></TextArea>
      <input type="file" accept=".txt,.docx" onChange={handleFileInput} />
    </section>
  );
}

export default TranslationForm;
