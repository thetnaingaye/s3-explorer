import fs from "fs";
import MimeTypes from "mime-types";
import path from "path";

function getFileData(filePath) {
  return {
    stream: fs.createReadStream(filePath),
    name: path.basename(filePath),
    type: MimeTypes.lookup(path.extname(filePath)) || undefined,
  };
}

export default {
  getFileData,
};
