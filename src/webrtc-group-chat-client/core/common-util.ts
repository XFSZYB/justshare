import { FileHashToFile } from "./common-types";
import  CryptoJS from 'crypto-js' 

export async function getUniqueFiles(files: File[], timestamp?: number) {
  const filesToAdd: FileHashToFile = {};
  const timestampString = typeof timestamp === "number" ? `${timestamp}` : `${new Date().valueOf()}`;

  for (const file of Array.from(files)) {
    const fileDataString = file.name + file.type + file.size + file.lastModified + timestampString;
    const fileDataHash = await getSHA256(fileDataString);
    filesToAdd[fileDataHash] = file;
  }

  return filesToAdd;
}


export async function getSHA256(string: string) {
  // const strBuffer = new TextEncoder().encode(string);
 
  const hashHex = CryptoJS.SHA256(string).toString();
  // CryptoJS.enc.Utf8
  // const hashBuffer = await crypto.subtle.digest("SHA-256", strBuffer);
  // const hashArray = Array.from(new Uint8Array(hashBuffer));

  // const hashHex = hashArray
  //   .map((b) => {
  //     return b.toString(16).padStart(2, "0");
  //   })
  //   .join("");

  return hashHex;
}

export function formatBytes(numberOfBytes: number, decimals = 2) {
  if (numberOfBytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(numberOfBytes) / Math.log(k));

  return `${parseFloat((numberOfBytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function shadowCopyPlainObject(plainObj: any): any {
  type ObjType = typeof plainObj;
  const copiedPlainObj: ObjType = {};
  Object.keys(plainObj).forEach((property) => {
    copiedPlainObj[property] = plainObj[property];
  });
  return copiedPlainObj;
}