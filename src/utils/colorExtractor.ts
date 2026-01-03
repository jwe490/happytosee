export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('15, 15, 15');
        return;
      }

      const size = 50;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;

      let r = 0, g = 0, b = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 16) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const alpha = imageData[i + 3];

        if (alpha > 128) {
          r += red;
          g += green;
          b += blue;
          count++;
        }
      }

      if (count === 0) {
        resolve('15, 15, 15');
        return;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      resolve(`${r}, ${g}, ${b}`);
    };

    img.onerror = () => {
      resolve('15, 15, 15');
    };

    img.src = imageUrl;
  });
};
