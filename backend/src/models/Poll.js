const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    youtubeUrl: { type: String, required: true },
    youtubeVideoId: { type: String, required: true },
    thumbnail: { type: String, required: true },
    embedUrl: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String, default: "" },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    endDate: { type: Date, required: true },
    songs: { type: [songSchema], default: [] },
    active: { type: Boolean, default: true },
    closedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

pollSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Poll", pollSchema);
