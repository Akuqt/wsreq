/**
 * Transform from ws to http.
 * @param uri Uri to change.
 * @returns New uri.
 */
export const toHttp = (uri: string): string => {
  if (uri.startsWith("ws")) {
    return "http" + uri.slice(2, uri.length);
  }
  return uri;
};
