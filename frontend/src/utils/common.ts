export function showMessage(message: string) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  });
}

export function previewImage(urls: string[], currentIndex?: number) {
  uni.previewImage({
    current: currentIndex,
    urls,
  });
}
