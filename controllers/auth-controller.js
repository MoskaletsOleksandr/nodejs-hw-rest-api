import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import jimp from 'jimp';
import path from 'path';
import fs from 'fs';

import User from '../models/user.js';

import { ctrlWrapper } from '../decorators/index.js';
import { HttpError } from '../helpers/index.js';

const { JWT_SECRET } = process.env;

const replaceSpacesWithUnderscores = (filename) => {
  return filename.replace(/\s+/g, '_');
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const searchedUser = await User.findOne({ email });
  if (searchedUser) {
    throw HttpError(409, 'Email in use');
  }
  const avatarURL = gravatar.url(email, { s: '200', r: 'pg', d: 'mp' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const errorMessage = 'Email or password is wrong';
  const { email, password } = req.body;
  const searchedUser = await User.findOne({ email });
  if (!searchedUser) {
    throw HttpError(401, errorMessage);
  }

  const passwordCompare = await bcrypt.compare(password, searchedUser.password);
  if (!passwordCompare) {
    throw HttpError(401, errorMessage);
  }

  const payload = {
    id: searchedUser._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '23h' });
  await User.findByIdAndUpdate(searchedUser._id, { token });

  res.json({
    token: token,
    user: {
      email: searchedUser.email,
      subscription: searchedUser.subscription,
    },
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });

  res.status(204).json();
};

const updateUserSubscription = async (req, res) => {
  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404);
  }

  res.json(result);
};

const changeAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: filePath } = req.file;
  const { originalname } = req.file;
  const minSize = 250;

  const image = await jimp.read(filePath);

  let width = image.bitmap.width;
  let height = image.bitmap.height;

  if (width < height) {
    height = Math.floor((height / width) * minSize);
    width = minSize;
  } else {
    width = Math.floor((width / height) * minSize);
    height = minSize;
  }

  await image.resize(width, height);

  await image.cover(
    minSize,
    minSize,
    jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
  );

  await fs.promises.unlink(filePath);

  const normalizedName = replaceSpacesWithUnderscores(originalname);

  const uniqueFileName = `${_id}-${Date.now()}_${normalizedName}`;
  const newPath = path.join('avatars', uniqueFileName);

  await image.write(path.join('public', newPath));
  await User.findByIdAndUpdate(_id, { avatarURL: newPath });

  res.json({
    avatarURL: newPath,
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  changeAvatar: ctrlWrapper(changeAvatar),
};
