import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const aceessToken = user.generateAccessToken();
    const refershToken = user.generateRefreshToken();

    user.refershToken = refershToken;
    await user.save({ validateBeforeSave: false });

    return { aceessToken, refershToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and aceess token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //   if (fullName === "") {
  //     throw new ApiError(400, "fullName is required");
  //   }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  let avatarLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refershToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while register the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await user.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { aceessToken, refershToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user.Id);
  select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", aceessToken, options)
    .cookie("refershToken", refershToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, aceessToken, refershToken },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refershToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export { registerUser, loginUser, logoutUser };
