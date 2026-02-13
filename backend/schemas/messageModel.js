const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
      required: false,
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
    },
    messageType: {
      type: String,
      enum: ["inquiry", "booking", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const messageSchema = mongoose.model("messageschema", messageModel);

module.exports = messageSchema;
