// Need to slice of leading / after images have been built into production sites
export const getImageURL = (imageURL) => {
  return imageURL.startsWith('/') ? imageURL.slice(1) : imageURL;
}