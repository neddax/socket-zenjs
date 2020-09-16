export default function generateUUID() {
  let time = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (time + Math.random() * 16) % 16 | 0;
    time = Math.floor(time / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
