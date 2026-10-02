import mongoose from "mongoose";

const homeSliderSchema = mongoose.Schema(
  {
    images: [
      {
        type: String,
        require: true,
      },
    ],
    dateCreated: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);

const homSliderModel = mongoose.model("HomeSlider", homeSliderSchema);

export default homSliderModel;
