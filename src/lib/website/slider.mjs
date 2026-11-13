export function heroSliderSettings(value) {
  return {
    autoplay: typeof value?.autoplay === 'boolean' ? value.autoplay : true,
    intervalMs: Number.isInteger(value?.intervalMs) && value.intervalMs >= 3000 && value.intervalMs <= 15000 ? value.intervalMs : 6000,
  };
}

export function nextSlide(index, length, direction = 1) {
  return length > 0 ? ((index + direction) % length + length) % length : 0;
}
