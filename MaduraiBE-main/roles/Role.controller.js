import RoleService from './Role.service.js';

export const createRole = async (req, res) => {
  try {
    const role = await RoleService.addRole(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Role created successfully',
      data: role 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const result = await RoleService.getAllRoles(page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await RoleService.getRolesById(roleId);
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { role_id } = req.query;
    const role = await RoleService.updateRole(role_id, req.body);
    res.json({ 
      success: true, 
      message: 'Role updated successfully',
      data: role 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await RoleService.deleteRoleByMongoId(id);
    res.json({ 
      success: true, 
      message: 'Role deleted successfully',
      data: result 
    });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// Bonus: Assign role to employee
export const assignRoleToEmployee = async (req, res) => {
  try {
    const { empId, roleId } = req.params;
    const employee = await RoleService.assignRoleToEmployee(empId, roleId);
    res.json({ 
      success: true, 
      message: 'Role assigned to employee successfully',
      data: employee 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
