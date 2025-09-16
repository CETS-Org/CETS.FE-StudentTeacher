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
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: backendData.token, // Sử dụng token từ backend
                  userInfo: backendData.account // Sử dụng thông tin từ backend
                }, window.location.origin);
                window.close();
              } else {
                // Nếu không có parent window, lưu thông tin và redirect
                localStorage.setItem("authToken", backendData.token);
                localStorage.setItem("userInfo", JSON.stringify(backendData.account));
                window.location.href = '/gateway';
              }
            } catch (backendError) {
              console.error('Backend Error:', backendError);                           
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

