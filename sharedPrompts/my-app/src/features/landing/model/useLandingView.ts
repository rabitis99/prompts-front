import { useNavigate } from 'react-router-dom';

export function useLandingView() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  const handleNavigateToExplore = () => {
    navigate('/explore');
  };

  return {
    handleNavigateToLogin,
    handleNavigateToSignup,
    handleNavigateToExplore,
  };
}

