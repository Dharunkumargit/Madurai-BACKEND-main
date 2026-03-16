import * as UserService from "../Service/User_service.js";
export const addUser = async (req, res) => {
  try {
    const user = await UserService.addUser(req.body);
    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



export const getUser = async (req, res) => {
  try {
    const users = await UserService.getUser();
    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const getEmployees = async (req, res) => {
  const employees = await UserService.getEmployees();
  res.json({ data: employees });
};

export const loginUser = async (req, res) => {
  try {
    const user = await UserService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phonenumber: user.phonenumber,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await UserService.updateUser(id, req.body);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteduser = await UserService.removeUser(id);

    if (!deleteduser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      data: deleteduser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Password required" });
    }

    await UserService.changePassword(id, newPassword);

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




























