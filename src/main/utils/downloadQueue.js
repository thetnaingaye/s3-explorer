const { download } = require("electron-dl");

export default class DownloadQueue extends Array {
  push(item) {
    const len = super.push(item);
    if (this.length === 1) {
      this.download(item);
    }
    return len;
  }

  shift() {
    const item = super.shift();
    if (this.length > 0) {
      this.download(this[0]);
    }
    return item;
  }

  download = (item) => {
    item.options.onCompleted = () => {
      this.shift();
    };
    download(item.win, item.url, item.options);
  };
}
