import axios from './axiosInstance';

interface LoginPayload {
  email: string;
  password: string;
}

export const loginApi = async (payload: LoginPayload) => {
  const response = await axios.post('/v1/auth/login', payload);
  return response.data; 
};

export const registerApi = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    const res = await axios.post("/v1/auth/register", payload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const verifyOtpApi = async (payload: { email: string; otp: string }) => {
  const res = await axios.post('/v1/auth/verify-otp', payload);
  return res.data;
};

export const resendOtpApi = async (email: string) => {
  const res = await axios.post(`/v1/auth/resend-otp?email=${encodeURIComponent(email)}`);
  return res.data;
};

export const logout = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  const res = await axios.post(
    '/v1/auth/logout',
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};