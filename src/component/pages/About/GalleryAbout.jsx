import React from "react";
import scss from "./GalleryAbout.module.scss";
import { GrGallery } from "react-icons/gr";
import cars from "../../../data/images/cars.jpg";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const GalleryAbout = () => {
  const dataImgs = [
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
    cars,
  ];

  return (
    <section className={scss.gallerySec}>
      <div className="container">
        <div className={scss.nav}>
          <h2>
            <span>
              <GrGallery />
            </span>
            Моменты
          </h2>
          <div className={scss.galleryImgs}>
            {dataImgs.map((el, id) => (
              <Zoom>
                <img
                  key={id}
                  src={el}
                  alt={`Фото галереи автоклана Namys JK - ${id + 1}`}
                />
              </Zoom>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryAbout;
