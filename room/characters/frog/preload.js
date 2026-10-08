const decoded = new Map();

export function decodeImages(urls) {
  return Promise.all(urls.map(url => {
    if (!decoded.has(url)) {
      const image = new Image();
      image.src = url;
      decoded.set(url, image.decode().catch(error => {
        decoded.delete(url);
        throw error;
      }));
    }
    return decoded.get(url);
  }));
}
