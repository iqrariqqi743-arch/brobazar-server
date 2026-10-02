import homSliderModel from "../models/homeSlider.model.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import e from "express";
import fs from "fs";
import homeSliderRoute from "../routes/homeSlider.route.js";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_Api_Key,
  api_secret: process.env.cloudinary_Config_Secret,
  secure: true,
});

export async function uploadImages(request, response) {
  try {
    const files = request.files;

    if (!files || files.length === 0) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Please select at least one image",
      });
    }

    // Sirf is upload ke liye images rakhein
    let imagesArray = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });

      imagesArray.push(result.secure_url);

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "Images uploaded successfully",
      images: imagesArray,
    });
  } catch (error) {
    console.log("Cloudinary upload error:", error);

    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Image upload failed",
    });
  }
}

export async function deleteImagesFromCloudinary(request, response) {
  try {
    const imageUrl = request.query.image;
    if (!imageUrl) {
      return response
        .status(400)
        .json({ error: true, success: false, message: "Image not found" });
    }
    const urlArray = imageUrl.split("/");
    const image = urlArray[urlArray.length - 1];
    const imageName = image.split(".")[0];

    const result = await cloudinary.uploader.destroy(imageName);
    if (result.result === "ok") {
      return response.status(200).json({
        error: false,
        success: true,
        message: "Image deleted successfully ! :)",
      });
    }
    return response
      .status(400)
      .json({ error: true, success: false, message: "Image delete failed" });
  } catch (error) {
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || error || "Something went wrong",
    });
  }
}

export async function addHomeSlide(request, response) {
  try {
    const images = request.body.images;

    if (!images || images.length === 0) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Please upload images first",
      });
    }

    const slide = new homSliderModel({
      images: images,
    });

    const savedSlide = await slide.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "Home Slide Added Successfully!",
      slide: savedSlide,
    });
  } catch (error) {
    return response.status(400).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
}

export async function deleteHomeSlide(request, response) {
  try {
    const slideId = request.params.id;

    console.log("Slide ID:", slideId);

    const slide = await homSliderModel.findById(slideId);

    if (!slide) {
      return response.status(404).json({
        message: "Slide not found",
        error: true,
        success: false,
      });
    }

    console.log("Slide found:", slide);

    const images = slide.images || [];

    for (const imageUrl of images) {
      try {
        console.log("Deleting Cloudinary image:", imageUrl);

        const urlArray = imageUrl.split("/");
        const imageWithExtension = urlArray[urlArray.length - 1];

        const imageName = imageWithExtension.split(".")[0];

        console.log("Cloudinary public ID:", imageName);

        const result = await cloudinary.uploader.destroy(imageName);

        console.log("Cloudinary delete result:", result);
      } catch (cloudinaryError) {
        console.log("Cloudinary image delete error:", cloudinaryError);
      }
    }

    const deleteSlide = await homSliderModel.findByIdAndDelete(slideId);

    if (!deleteSlide) {
      return response.status(404).json({
        message: "Slide not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Slide Deleted Successfully ! :)",
      error: false,
      success: true,
      data: deleteSlide,
    });
  } catch (error) {
    console.log("Delete Home Slide Error:", error);

    return response.status(400).json({
      message: error.message || "Slide not deleted please try again",
      error: true,
      success: false,
    });
  }
}

export async function updatedHomeSlide(request, response) {
  try {
    const { id } = request.params;

    console.log("Update Slide ID:", id);
    console.log("Update Body:", request.body);

    if (!id) {
      return response.status(400).json({
        message: "Slide ID not found",
        error: true,
        success: false,
      });
    }

    const { images } = request.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return response.status(400).json({
        message: "Please provide at least one image",
        error: true,
        success: false,
      });
    }

    const homeSlide = await homSliderModel.findByIdAndUpdate(
      id,
      {
        images: images,
      },
      {
        new: true,
      },
    );

    if (!homeSlide) {
      return response.status(404).json({
        message: "Home slide not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Home Slide Updated Successfully! :)",
      error: false,
      success: true,
      homeSlide: homeSlide,
    });
  } catch (error) {
    console.log("Update Home Slide Error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function getHomeSlides(request, response) {
  try {
    // Page
    const page = parseInt(request.query.page) || 1;

    // Per page records
    const limit = parseInt(request.query.limit) || 5;

    // Skip records
    const skip = (page - 1) * limit;

    // Total records
    const totalSlides = await homSliderModel.countDocuments();

    // Get only current page records
    const slides = await homSliderModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return response.status(200).json({
      message: "Data fetch successfully ! :)",
      error: false,
      success: true,

      data: slides,

      pagination: {
        page: page,
        limit: limit,
        total: totalSlides,
        totalPages: Math.ceil(totalSlides / limit),
      },
    });
  } catch (error) {
    console.log("Get Home Slides Error:", error);

    return response.status(400).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function getSingleHomeSlide(request, response) {
  try {
    const { id } = request.params;

    console.log("Single Slide ID:", id);

    const slide = await homSliderModel.findById(id);

    if (!slide) {
      return response.status(404).json({
        message: "Home slide not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Home slide found successfully",
      error: false,
      success: true,
      data: slide,
    });
  } catch (error) {
    console.log("Get Single Home Slide Error:", error);

    return response.status(400).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}
