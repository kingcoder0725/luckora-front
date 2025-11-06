import { useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useSelector, useDispatch } from 'src/store';
import { ChangePage } from 'src/store/reducers/menu';
import { GuardProps } from 'src/types';

const AuthGuard = ({ children }: GuardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      router.back();
      dispatch(ChangePage('login'));
    }
  }, [isLoggedIn, dispatch, router]);

  return children;
};

export default AuthGuard;
