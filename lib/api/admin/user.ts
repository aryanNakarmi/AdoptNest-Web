import { API } from "../endpoints";
import axios from "../axios";

export const createUser = async (userData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.USERS,
            userData,   
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // for file upload/multer
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

export const fetchUsers = async () => {
  try {
    const response = await axios.get("/api/v1/admin/users");
    return response.data; 
  } catch (error: any) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return { success: false, data: [], message: error.response?.data?.message || error.message };
  }
};
