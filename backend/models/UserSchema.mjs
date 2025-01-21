import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add you name"],
        trim: true
      },
      email: {
        type: String,
        required: [true, "Please add you email"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please add a valid email",
        ],
      },
      password: {
        type: String,
        required: true,
        minlength: 4,
        select: false,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.validatePassword = async function(passwordToCheck) {
    return await bcrypt.compare(passwordToCheck, this.password);
};

userSchema.methods.generateToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TTL,
    });
};

export default mongoose.model("User", userSchema);