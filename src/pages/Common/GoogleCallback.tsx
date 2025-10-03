import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/config';

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
            console.log('Google User Info:', userInfo);
            
            try {
              // Gửi thông tin về backend để xác thực và lấy token của hệ thống
              const backendResponse = await api.googleLogin({
                email: userInfo.email,
                fullName: userInfo.name,
                picture: userInfo.picture,
                googleId: userInfo.id
              });

              const backendData = backendResponse.data;
              console.log('Backend Response:', backendData);

              // Gửi thông tin về parent window
              console.log('Sending to parent window:', {
                token: backendData.token,
                userInfo: backendData.account
              });
              
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: backendData.token, // Sử dụng token từ backend
                  userInfo: backendData.account // Sử dụng thông tin từ backend
                }, window.location.origin);
                console.log('Message sent to parent, closing popup...');
                window.close();
              } else {
                // Nếu không có parent window, lưu thông tin và redirect theo role
                console.log('No parent window, redirecting based on role...');
                localStorage.setItem("authToken", backendData.token);
                localStorage.setItem("userInfo", JSON.stringify(backendData.account));
                
                // Navigate based on user role and verification status
                if (!backendData.account.isVerified) {
                  window.location.href = '/';
                } else if (backendData.account.roleNames && backendData.account.roleNames.includes('Student')) {
                  window.location.href = '/student/my-classes';
                } else if (backendData.account.roleNames && backendData.account.roleNames.includes('Teacher')) {
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

              console.log('Using fallback data:', {
                token: accessToken,
                userInfo: fallbackUserInfo
              });

              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: accessToken, // Sử dụng Google token làm fallback
                  userInfo: fallbackUserInfo
                }, window.location.origin);
                console.log('Fallback message sent to parent, closing popup...');
                window.close();
              } else {
                console.log('No parent window, using fallback data...');
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

