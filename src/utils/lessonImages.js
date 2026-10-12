import images from './lessonImageManifest.json' with { type: 'json' };

// Only known, bundled public covers are substituted. Never rewrite Storage URLs,
// query strings, signed links, or image fields saved in Firestore.
export function lessonImageUrl(source, thumbnail = false) {
  const image = Object.hasOwn(images, source) ? images[source] : undefined;
  return image ? image[thumbnail ? 'thumbnail' : 'full'] : source;
}

export function lessonImageDimensions(source) {
  const image = Object.hasOwn(images, source) ? images[source] : undefined;
  return image ? { width: image.width, height: image.height } : {};
}
