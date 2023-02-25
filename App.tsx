import * as React from 'react';
import smartcrop, { CropOptions } from 'smartcrop';
import './style.css';

const opt = { width: 512, height: 512 };

export default function App() {
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const ref = React.useRef<HTMLInputElement>();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      getListCroppedImages(files, opt)
        .then((result) => {
          setUploadedImages((u) => u.concat(result));
        })
        .then(() => (ref.current.value = ''));
    }
  };

  return (
    <section>
      <div>
        <h1>Hello StackBlitz!</h1>
        <p>Start editing to see some magic happen :)</p>
        <label
          htmlFor="upload"
          style={{
            padding: '10px 5px',
            border: '1px solid black',
            cursor: 'pointer',
          }}
        >
          Upload
        </label>
        <input
          id="upload"
          name="upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          ref={ref}
        />
      </div>
      <div>
        {uploadedImages.map((image, i) => (
          <img src={image} width="auto" height="50" key={i} />
        ))}
      </div>
    </section>
  );
}

const getBase64 = (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.readAsDataURL(file);
  });
};

const getImage = (file: File): Promise<HTMLImageElement> => {
  const image = new Image();
  return new Promise((resolve) => {
    image.addEventListener('load', () => resolve(image));
    image.src = URL.createObjectURL(file);
  });
};

const getListFiles = (files: FileList): Promise<Array<string>> => {
  const promiseFiles: Array<Promise<string>> = [];

  for (let i = 0; i < files.length; i += 1) {
    promiseFiles.push(getBase64(files[i]));
  }
  return Promise.all(promiseFiles);
};

const getListImages = (files: FileList) => {
  const promiseImages: Array<Promise<HTMLImageElement>> = [];

  for (const file of files) {
    promiseImages.push(getImage(file));
  }

  return Promise.all(promiseImages);
};

const getCroppedImage = (image: HTMLImageElement, opts: CropOptions) => {
  return smartcrop.crop(image, opts).then((result) => {
    const canvas = document.createElement('canvas');
    canvas.width = ~~opts.width;
    canvas.height = ~~opts.height;
    const ctx = canvas.getContext('2d');

    const crop = result.topCrop;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL();
  });
};

const getListCroppedImages = async (files: FileList, opts: CropOptions) => {
  const list = await getListImages(files);

  const src = await Promise.all(list.map((l) => getCroppedImage(l, opts)));

  list.forEach((l) => {
    URL.revokeObjectURL(l.src);
  });

  return src;
};
