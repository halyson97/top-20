const mongoose = require("mongoose");

const voteItemSchema = new mongoose.Schema(
  {
    songId: { type: mongoose.Schema.Types.ObjectId, required: true },
    liked: { type: Boolean, required: true },
  },
  { _id: false }
);

const voteSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    instagram: { type: String, required: true },
    votes: { type: [voteItemSchema], default: [] },
  },
  { timestamps: true }
);

voteSchema.index({ pollId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
