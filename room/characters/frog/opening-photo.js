import content from './content.js';

const requestedPhotoId = new URLSearchParams(location.search).get('photo');
const fixedPhotoId = content.findPhoto(requestedPhotoId)?.id;

// 拍摄前仅用默认作品初始化场景；本次照片只在按快门时更新，退出角色后仍保留。
export let openingPhotoId = fixedPhotoId || content.photos[0].id;

export function drawOpeningPhotoId() {
  openingPhotoId = fixedPhotoId || content.photos[Math.floor(Math.random() * content.photos.length)].id;
  return openingPhotoId;
}
