import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (accessToken) {
        // Lấy thông tin user từ Google API
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
          .then(response => response.json())
          .then(userInfo => {
            // Gửi thông tin về parent window
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              token: accessToken,
              userInfo: {
                id: userInfo.id,
                email: userInfo.email,
                fullName: userInfo.name,
                picture: userInfo.picture,
                roleNames: ['user'] // Default role, có thể cần xác định từ backend
              }
            }, window.location.origin);
            window.close();
          })
          .catch(error => {
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Failed to get user info'
            }, window.location.origin);
            window.close();
          });
      } else {
        // Không có token, đóng popup
        window.close();
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
