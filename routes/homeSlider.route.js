import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  addHomeSlide,
  deleteHomeSlide,
  deleteImagesFromCloudinary,
  getHomeSlides,
  getSingleHomeSlide,
  updatedHomeSlide,
  uploadImages,
} from "../controllers/homeSlider.controller.js";

const homeSliderRoute = Router();

homeSliderRoute.post(
  "/upload/images",
  auth,
  upload.array("images"),
  uploadImages,
);

homeSliderRoute.delete("/delete/images", auth, deleteImagesFromCloudinary);
homeSliderRoute.post("/add/images", auth, addHomeSlide);
homeSliderRoute.get("/home/slides", auth, getHomeSlides);
homeSliderRoute.post("/home/slide/update", auth, updatedHomeSlide);
homeSliderRoute.delete("/home/slide/delete/:id", auth, deleteHomeSlide);
homeSliderRoute.put("/home/slide/update/:id", auth, updatedHomeSlide);
homeSliderRoute.get("/home/slide/:id", auth, getSingleHomeSlide);

export default homeSliderRoute;
