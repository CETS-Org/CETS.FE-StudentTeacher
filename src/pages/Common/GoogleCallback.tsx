import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/api';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = () => {
      // Lấy token từ URL hash (với response_type=token)
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');
      
      if (error) {
        // Gửi lỗi về parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
        } else {
          // Nếu không có parent window, redirect về login với error
          window.location.href = '/login?error=' + encodeURIComponent(error);
        }
        return;
      }

      if (accessToken) {
        // Lấy thông tin user từ Google API
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
          .then(response => response.json())
          .then(async (userInfo) => {
            try {
              // Gửi thông tin về backend để xác thực và lấy token của hệ thống
              const backendResponse = await api.googleLogin({
                email: userInfo.email,
                fullName: userInfo.name,
                picture: userInfo.picture,
                googleId: userInfo.id
              });

              const backendData = backendResponse.data;

              // Normalize field names: convert PascalCase to camelCase for consistency
              const normalizedAccount = {
                ...backendData.account,
                phoneNumber: (backendData.account as any).PhoneNumber || backendData.account.phoneNumber || "",
                fullName: (backendData.account as any).FullName || backendData.account.fullName || "",
                avatarUrl: (backendData.account as any).AvatarUrl || backendData.account.avatarUrl,
                // Use !== undefined to preserve false values (don't use ?? which treats false as falsy)
                isVerified: (backendData.account as any).IsVerified !== undefined 
                  ? (backendData.account as any).IsVerified 
                  : (backendData.account.isVerified !== undefined ? backendData.account.isVerified : true),
                roleNames: (backendData.account as any).RoleNames || backendData.account.roleNames || []
              };
              
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: backendData.token,
                  userInfo: normalizedAccount
                }, window.location.origin);
                window.close();
              } else {
                // Nếu không có parent window, lưu thông tin và redirect theo role
                localStorage.setItem("authToken", backendData.token);
                localStorage.setItem("userInfo", JSON.stringify(normalizedAccount));
                
                // Navigate based on user role and verification status
                if (!normalizedAccount.isVerified) {
                  window.location.href = '/';
                } else if (normalizedAccount.roleNames && normalizedAccount.roleNames.includes('Student')) {
                  window.location.href = '/student/my-classes';
                } else if (normalizedAccount.roleNames && normalizedAccount.roleNames.includes('Teacher')) {
                  window.location.href = '/teacher/courses';
                } else {
                  window.location.href = '/';
                }
              }
            } catch (backendError) {
              console.error('Backend Error:', backendError);
              
              // Fallback: sử dụng thông tin từ Google nếu backend lỗi
              const fallbackUserInfo = {
                id: userInfo.id,
                email: userInfo.email,
                fullName: userInfo.name,
                picture: userInfo.picture,
                roleNames: ['user'],
                isVerified: true
              };

              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: accessToken, // Sử dụng Google token làm fallback
                  userInfo: fallbackUserInfo
                }, window.location.origin);
                window.close();
              } else {
                localStorage.setItem("authToken", accessToken);
                localStorage.setItem("userInfo", JSON.stringify(fallbackUserInfo));
                
                // Navigate based on fallback user role
                if (!fallbackUserInfo.isVerified) {
                  window.location.href = '/';
                } else if (fallbackUserInfo.roleNames && fallbackUserInfo.roleNames.includes('Student')) {
                  window.location.href = '/student/my-classes';
                } else if (fallbackUserInfo.roleNames && fallbackUserInfo.roleNames.includes('Teacher')) {
                  window.location.href = '/teacher/courses';
                } else {
                  window.location.href = '/';
                }
              }
            }
          })
          .catch(error => {
            console.error('Error fetching user info:', error);
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Failed to get user info'
              }, window.location.origin);
              window.close();
            } else {
              window.location.href = '/login?error=' + encodeURIComponent('Failed to get user info');
            }
          });
      } else {
        // Không có token, đóng popup
        if (window.opener) {
          window.close();
        } else {
          window.location.href = '/login';
        }
      }
    };

    handleGoogleCallback();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google login...</p>
      </div>
    </div>
  );
}

