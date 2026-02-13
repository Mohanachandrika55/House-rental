const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userModel");
const propertySchema = require("../schemas/propertyModel");
const bookingSchema = require("../schemas/bookingModel");
const messageSchema = require("../schemas/messageModel");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    let granted = "";
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    if (req.body.type === "Owner") {
      granted = "granted";
      const newUser = new userSchema({ ...req.body, granted });
      await newUser.save();
    } else {
      const newUser = new userSchema(req.body);
      await newUser.save();
    }

    ///////////aur you can do this////////
    //     if (req.body.type === "Owner") {
    //       newUser.set("granted", "pending", { strict: false });
    //     }
    //////////////////// for this, then you need to remove strict keyword from schema//////////////////////

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login success successfully",
      success: true,
      token,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

/////forgotting password
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    await updatedUser.save();
    return res.status(200).send({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////auth controller
const authController = async (req, res) => {
  console.log(req.body);
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    console.log(user);
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    } else {
      return res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "auth error", success: false, error });
  }
};
/////////get all properties in home
const getAllPropertiesController = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, propertyType, bedrooms } = req.query;
    
    // Build search query
    let searchQuery = {};
    
    if (location) {
      searchQuery.propertyAddress = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      searchQuery.propertyAmt = {};
      if (minPrice) searchQuery.propertyAmt.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.propertyAmt.$lte = parseInt(maxPrice);
    }
    
    if (propertyType) {
      searchQuery.propertyType = propertyType;
    }
    
    if (bedrooms) {
      searchQuery.bedrooms = parseInt(bedrooms);
    }
    
    const allProperties = await propertySchema.find(searchQuery);
    if (!allProperties || allProperties.length === 0) {
      return res.status(200).send({ success: true, data: [], message: "No properties found" });
    } else {
      res.status(200).send({ success: true, data: allProperties });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Error fetching properties", success: false, error });
  }
};

///////////booking handle///////////////
const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userDetails, status, userId, ownerId } = req.body;

  try {
    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId,
      ownerID: ownerId, 
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
    });

    await booking.save();

    return res
      .status(200)
      .send({ success: true, message: "Booking status updated" });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error handling booking" });
  }
};

/////get all bookings for sing tenents//////
const getAllBookingsController = async (req, res) => {
  const { userId } = req.body;
  try {
    const getAllBookings = await bookingSchema.find();
    const updatedBookings = getAllBookings.filter(
      (booking) => booking.userID.toString() === userId
    );
    return res.status(200).send({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};
/////send message controller//////
const sendMessageController = async (req, res) => {
  try {
    const { receiverId, propertyId, message, messageType } = req.body;
    const senderId = req.body.userId;

    const newMessage = new messageSchema({
      senderId,
      receiverId,
      propertyId,
      message,
      messageType: messageType || 'general',
    });

    await newMessage.save();

    return res.status(200).send({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error sending message" });
  }
};

/////get messages controller//////
const getMessagesController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { otherUserId } = req.query;

    let messages;
    if (otherUserId) {
      // Get conversation between two users
      messages = await messageSchema
        .find({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .populate('propertyId', 'propertyType propertyAddress')
        .sort({ createdAt: 1 });
    } else {
      // Get all conversations for the user
      messages = await messageSchema
        .find({
          $or: [{ senderId: userId }, { receiverId: userId }],
        })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .populate('propertyId', 'propertyType propertyAddress')
        .sort({ createdAt: -1 });
    }

    return res.status(200).send({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error getting messages" });
  }
};

/////mark message as read controller//////
const markMessageReadController = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.body.userId;

    const message = await messageSchema.findOneAndUpdate(
      { 
        _id: messageId, 
        receiverId: userId,
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found or already read",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return res
      .status(500)
      .send({ success: false, message: "Error marking message as read" });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
  sendMessageController,
  getMessagesController,
  markMessageReadController,
};
