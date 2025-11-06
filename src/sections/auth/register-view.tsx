import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { PhoneInput, defaultCountries } from 'react-international-phone';
import { enqueueSnackbar } from 'notistack';
import toast from 'react-hot-toast';
import { isIPhone13 } from 'react-device-detect';
import { useDispatch } from 'src/store';
import useApi from 'src/hooks/use-api';
import { useLocales } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Link,
  Card,
  Grid,
  Alert,
  Stack,
  styled,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
  Button,
  useMediaQuery,
} from '@mui/material';

// store
import { Login } from 'src/store/reducers/auth';
import { ChangePage } from 'src/store/reducers/menu';

// routes
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
// config
// import { PATH_AFTER_LOGIN } from 'src/config-global';
// auth
// import { useAuthContext } from 'src/auth/hooks';
// assets
// components
import Image from 'src/components/image';
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { AnimateButton } from 'src/components/animate';
import Scrollbar from 'src/components/scrollbar';
import FormProvider, {
  RHFAutocomplete,
  RHFCheckbox,
  RHFDatePicker,
  RHFTextField,
} from 'src/components/hook-form';

// utils
import { DEFAULT_COUNTRY_CURRENCY, isValidEmail } from 'src/utils';
import { strengthColor, strengthIndicator } from 'src/utils/password-strength';

// types
import { StringColorProps } from 'src/types';
import { IRegUser, IFastRegUser } from 'src/types/api';

// local
import VerifyModal from './verify-dialog';

import 'react-international-phone/style.css';

// Simple cookie setter utility
const setCookie = (name: string, value: string, options: { secure?: boolean } = {}) => {
  let cookieString = `${name}=${value}; path=/`;
  if (options.secure) {
    cookieString += '; secure';
  }
  document.cookie = cookieString;
};

// ----------------------------------------------------------------------

const BLUNT_FONT = '"FONTSPRING DEMO - Blunt Con It", Impact, sans-serif';

const AuthWrapper = styled('div')(({ theme }: any) => ({
  background: `${
    theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.light
  }80`,
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  top: 0,
  left: 0,
  overflow: 'auto',
  zIndex: 1300,
  backdropFilter: 'blur(5px)',
}));

const GENDER = ['Male', 'Female'];

export default function RegisterView() {
  const { t, currentLang } = useLocales();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:570px)');

  const [toggleState, setToggleState] = useState(false);

  const countries = useMemo(
    () =>
      defaultCountries.filter((country) =>
        DEFAULT_COUNTRY_CURRENCY.some((c) => c.name === country[0])
      ),
    []
  );

  const handleToggle = () => {
    setToggleState((prev) => !prev);
  };

  const dispatch = useDispatch();
  const {
    register,
    fastRegister,
    login,
    send_code_email,
    send_code_phone,
    verify_email,
    verify_phone,
    get_fiat_currencies,
  } = useApi();

  const verifyStatus = useBoolean(false);
  const verifiedEmail = useBoolean(false);
  const verifiedPhone = useBoolean(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [strength, setStrength] = useState(0);
  const [step, setStep] = useState<number>(0);
  const [verifyType, setVerifyType] = useState<any>(null);
  const [level, setLevel] = useState<StringColorProps>();
  const [isSendingCode, setIsSendingCode] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<any>([]);
  const [registrationType, setRegistrationType] = useState<'email_phone' | 'fast' | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);

  const passwordConfirm = useBoolean();

  const RegisterSchema = Yup.object().shape({
    gender: Yup.string().required().oneOf(['Male', 'Female'], t('valid_gender')),
    surname: Yup.string()
      .max(30)
      .required(t('label_required', { label: t('firstname') })),
    middlename: Yup.string()
      .max(30)
      .required(t('label_required', { label: t('lastname') })),
    username: Yup.string().min(4).max(30).required(t('name_required')),
    email: Yup.string().required(t('email_required')).email(t('valid_email')),
    phone: Yup.string().required(t('phone_required')),
    country_reg: Yup.string().required(t('country_required')),
    birthday: Yup.mixed<any>().nullable().required(t('birthday_required')),
    address: Yup.string().required(t('address_required')),
    password: Yup.string().min(8).max(30).required(t('password_required')),
    age: Yup.boolean(),
    currency: Yup.string().required(t('currency_required')),
    currency_temp: Yup.mixed<any>().nullable().required(t('currency_required')),
  });

  const FastRegisterSchema = Yup.object().shape({
    gender: Yup.string().required().oneOf(['Male', 'Female'], t('valid_gender')),
    currency: Yup.string().required(t('currency_required')),
    age: Yup.boolean().oneOf([true], t('age_required')),
    birthday: Yup.number().required(t('birthday_required')),
  });

  const defaultValues = {
    surname: '',
    middlename: '',
    username: '',
    email: '',
    phone: '',
    country_reg: '',
    address: '',
    birthday: undefined,
    password: '',
    age: false,
    gender: '',
    currency: '',
    currency_temp: undefined,
  };

  const methods = useForm<IRegUser>({
    mode: 'onChange',
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const fastMethods = useForm<IFastRegUser>({
    mode: 'onChange',
    resolver: yupResolver(FastRegisterSchema),
    defaultValues: {
      gender: '',
      currency: '',
      age: false,
      birthday: 0,
    },
  });

  const changePassword = (value: string) => {
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  // Get form methods based on registration type
  const currentMethods = registrationType === 'fast' ? fastMethods : methods;
  const {
    watch,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = currentMethods;

  // Watch values with proper fallbacks
  const watchedValues = watch();
  const password = registrationType === 'fast' ? '' : (watchedValues as IRegUser).password || '';
  const phone = registrationType === 'fast' ? '' : (watchedValues as IRegUser).phone || '';
  const birthday = registrationType === 'fast' 
    ? (watchedValues as IFastRegUser).birthday || 0 
    : (watchedValues as IRegUser).birthday || 0;
  const age = registrationType === 'fast' 
    ? (watchedValues as IFastRegUser).age || false 
    : (watchedValues as IRegUser).age || false;
  const email = registrationType === 'fast' ? '' : (watchedValues as IRegUser).email || '';
  useEffect(() => {
    if (password) {
      changePassword(password);
    }
  }, [password]);

  const onSubmit = async () => {
    await sendVerifyCode('phone');
  };

  const calculateAge = (dateOfBirth: any) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let _age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthdate hasn't happened this year yet
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      _age -= 1;
    }

    return _age;
  };

  const handleLogin = methods.handleSubmit(async (data: IRegUser) => {
    if (registrationType !== 'email_phone') return;
    
    try {
      const { age: ageField, currency_temp, ...submitData } = data as any;

      console.log('calling register');

      const res = await register({ ...submitData, birthday: data.birthday ? new Date(data.birthday).getTime() : undefined });
      if (!res?.data) return;
      dispatch(Login(res?.data));
      dispatch(ChangePage(''));
      setCookie('jwt', res?.data?.accessToken, {
        secure: true,
      });
      // router.push(PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const handleFastRegister = fastMethods.handleSubmit(async (data: IFastRegUser) => {
    try {
      setLoading(true);

      console.log('calling fast register');

      const res = await fastRegister(data);
      if (!res?.data) return;
      
      // Show credentials to user - NO AUTOMATIC LOGIN
      setGeneratedCredentials({
        username: res.data.credentials.username,
        password: res.data.credentials.password
      });
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
      setLoading(false);
    }
  });

  const getCurrencies = async () => {
    setLoading(true);
    const res = await get_fiat_currencies();
    setLoading(false);
    if (!res?.data) return;
    setCurrencies(res.data);
  };

  useEffect(() => {
    getCurrencies();
    // eslint-disable-next-line
  }, []);

  const currencyOptions = useMemo(
    () =>
      currencies.map((option: any) => ({
        label: option.name,
        symbol: option.symbol,
        value: option._id,
        icon: option.icon,
      })),
    [currencies]
  );

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Box component="center">
        <Typography
          color="#FFFFFF"
          sx={{
            fontFamily: BLUNT_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 28,
            textTransform: 'uppercase',
            lineHeight: 1,
            letterSpacing: '0.05em',
            transform: 'skewX(-5deg)',
          }}
        >
          {registrationType ? 'Enter your details' : 'Choose Registration Type'}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Typography variant="body2" color="#FFFFFF" sx={{ transform: 'skewX(-5deg)' }}>
          {t('already_have_account')}{' '}
        </Typography>

        <Link
          href="#"
          component={RouterLink}
          onClick={() => dispatch(ChangePage('login'))}
          variant="subtitle2"
          sx={{ color: '#FFFFFF', transform: 'skewX(-5deg)' }}
        >
          {t('signin')}
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: '#FFFFFF',
        mt: 2.5,
        typography: 'caption',
        textAlign: 'center',
        transform: 'skewX(-5deg)',
      }}
    >
      {t('bysigningup')}
      <Link
        underline="always"
        color="#FFFFFF"
        onClick={() => {
          router.push(`/${currentLang.value}${paths.home.terms}`);
          dispatch(ChangePage(''));
        }}
        sx={{ cursor: 'pointer' }}
      >
        {t('terms_of_service')}
      </Link>
      {` ${t('and')} `}
      <Link
        underline="always"
        color="#FFFFFF"
        onClick={() => dispatch(ChangePage('privacypolicy'))}
        sx={{ cursor: 'pointer' }}
      >
        {t('privacy_policy')}
      </Link>
    </Typography>
  );

  const sendVerifyCode = async (type: string) => {
    const _age = calculateAge(birthday);

    if (_age < 18) {
      toast.error('You must be at least 18 years old to register.');
      return;
    }

    if (type === 'email') {
      if (!email) return;
      if (!isValidEmail(email)) {
        setErrorMsg('Email must be a valid email address!');
        return;
      }
      setErrorMsg('');
      setIsSendingCode('email');
      const res = await send_code_email(email);
      setIsSendingCode('');
      if (!res?.data) return;
      const param = {
        type,
        value: email,
      };
      setVerifyType(param);
      verifyStatus.onTrue();
    } else {
      if (!phone) return;
      setErrorMsg('');
      setIsSendingCode('phone');
      const res = await send_code_phone(phone);
      setIsSendingCode('');
      if (!res?.data) return;
      const param = {
        type,
        value: phone,
      };
      setVerifyType(param);
      verifyStatus.onTrue();
    }
  };

  const verify = async (code: string) => {
    if (verifyType.type === 'email') {
      const res = await verify_email({ email, code });
      if (!res?.data) return;
      verifiedEmail.onTrue();
      enqueueSnackbar(res.data, { variant: 'success' });
      setStep(1);
    } else {
      const res = await verify_phone({ phone, code });
      if (!res?.data) return;
      verifiedPhone.onTrue();
      enqueueSnackbar(res.data, { variant: 'success' });
      handleLogin();
    }
    verifyStatus.onFalse();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Copied to clipboard!', { variant: 'success' });
  };

  const registrationTypeSelection = (
    <Stack spacing={3}>
      <Typography variant="h6" color="#FFFFFF" textAlign="center" sx={{ transform: 'skewX(-5deg)' }}>
        How would you like to create your account?
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => setRegistrationType('email_phone')}
            sx={{
              py: 3,
              color: '#FFFFFF',
              border: '2px solid #FFE71A',
              backgroundColor: 'transparent',
              '&:hover': { 
                backgroundColor: '#FFE71A', 
                color: '#111111',
                borderColor: '#FFE71A' 
              },
              transform: 'skewX(-5deg)',
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Iconify icon="mdi:email-outline" width={32} />
              <Typography variant="h6">Email & Phone</Typography>
              <Typography variant="caption" textAlign="center">
                Traditional registration with email verification and phone number
              </Typography>
            </Stack>
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => setRegistrationType('fast')}
            sx={{
              py: 3,
              color: '#FFFFFF',
              border: '2px solid #5CC04A',
              backgroundColor: 'transparent',
              '&:hover': { 
                backgroundColor: '#5CC04A', 
                color: '#FFFFFF',
                borderColor: '#5CC04A' 
              },
              transform: 'skewX(-5deg)',
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Iconify icon="mdi:lightning-bolt" width={32} />
              <Typography variant="h6">Fast Login</Typography>
              <Typography variant="caption" textAlign="center">
                Quick registration with generated credentials
              </Typography>
            </Stack>
          </Button>
        </Grid>
      </Grid>
    </Stack>
  );

  const fastRegistrationForm = (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <RHFAutocomplete
            name="gender"
            label={t('gender')}
            autoHighlight
            options={GENDER}
            getOptionLabel={(option) => t(option)}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {t(option)}
              </li>
            )}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
              '& .MuiAutocomplete-option': {
                color: '#CCD5D6',
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <RHFAutocomplete
            name="currency_temp"
            label={t('currency')}
            options={currencyOptions}
            isOptionEqualToValue={(option, value) => option === value}
            onChange={(e, option: any) => {
              if (registrationType === 'fast') {
                fastMethods.setValue('currency', option?.value);
                fastMethods.trigger('currency');
              } else {
                methods.setValue('currency', option?.value);
                methods.setValue('currency_temp', option);
                methods.trigger('currency');
                methods.trigger('currency_temp');
              }
            }}
            renderOption={(props, option: any) => (
              <li {...props} key={option.value}>
                <Image src={option.icon} width={30} sx={{ mr: 1 }} />
                {`${option.label}(${option.symbol})`}
              </li>
            )}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
              '& .MuiAutocomplete-option': {
                color: '#CCD5D6',
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <RHFDatePicker
            name="birthday"
            label={t('birthday')}
            onChange={(date: any) => {
              const timestamp = date ? new Date(date).getTime() : 0;
              fastMethods.setValue('birthday', timestamp);
              fastMethods.trigger('birthday');
            }}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <RHFCheckbox
            name="age"
            label={t('old_over')}
            sx={{
              '& .MuiTypography-root': {
                color: '#FFFFFF',
              },
            }}
          />
          <Typography variant="caption" color="#FFFFFF">
            {t('signup_desc1')} <br /> {t('signup_desc2')}
          </Typography>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setRegistrationType(null)}
          sx={{
            py: 1.5,
            color: '#FFFFFF',
            border: '1px solid #666',
            '&:hover': { borderColor: '#999' },
          }}
        >
          Back
        </Button>
        
        <LoadingButton
          fullWidth
          size="large"
          type="button"
          variant="contained"
          loading={loading}
          disabled={!age}
          onClick={handleFastRegister}
          sx={{
            py: 1.5,
            color: '#111111',
            border: '1px solid #5CC04A',
            backgroundColor: '#5CC04A',
            '&:hover': { backgroundColor: '#4AA03A', borderColor: '#4AA03A' },
          }}
        >
          Generate Data
        </LoadingButton>
      </Stack>
    </Stack>
  );

  const credentialsDisplay = (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h5" color="#5CC04A" textAlign="center" sx={{ transform: 'skewX(-5deg)' }}>
        Your Account Created Successfully!
      </Typography>
      
      <Typography variant="body1" color="#FFFFFF" textAlign="center">
        Here are your login credentials. Please copy and save them securely:
      </Typography>

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="#CCD5D6">Username:</Typography>
          <Stack direction="row" spacing={1}>
            <Typography 
              variant="h6" 
              color="#FFE71A" 
              sx={{ 
                flex: 1, 
                p: 1, 
                border: '1px solid #444C56', 
                borderRadius: 1,
                backgroundColor: '#2A2D3A'
              }}
            >
              {generatedCredentials?.username}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => copyToClipboard(generatedCredentials?.username || '')}
              sx={{ color: '#FFE71A', borderColor: '#FFE71A' }}
            >
              Copy
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2" color="#CCD5D6">Password:</Typography>
          <Stack direction="row" spacing={1}>
            <Typography 
              variant="h6" 
              color="#FFE71A" 
              sx={{ 
                flex: 1, 
                p: 1, 
                border: '1px solid #444C56', 
                borderRadius: 1,
                backgroundColor: '#2A2D3A'
              }}
            >
              {generatedCredentials?.password}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => copyToClipboard(generatedCredentials?.password || '')}
              sx={{ color: '#FFE71A', borderColor: '#FFE71A' }}
            >
              Copy
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => dispatch(ChangePage('login'))}
          sx={{
            px: 4,
            py: 1.5,
            color: '#FFE71A',
            borderColor: '#FFE71A',
            '&:hover': { 
              backgroundColor: 'rgba(255, 231, 26, 0.1)',
              borderColor: '#E6D417' 
            },
          }}
        >
          Manual Login
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={async () => {
            if (!generatedCredentials) return;
            
            try {
              setLoading(true);
              console.log('Attempting auto login with credentials:', generatedCredentials);
              
              const loginData = {
                email: generatedCredentials.username, // backend accepts username in email field
                password: generatedCredentials.password,
                device: typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : 'Unknown',
                clientip: 'Unknown'
              };
              
              console.log('Login data being sent:', loginData);
              const res = await login(loginData);
              
              if (res?.data) {
                console.log('Auto login successful:', res.data);
                dispatch(Login(res.data));
                dispatch(ChangePage(''));
                setCookie('jwt', res.data.session.accessToken, { secure: true });
              }
              setLoading(false);
            } catch (error) {
              console.error('Auto login failed:', error);
              setErrorMsg(typeof error === 'string' ? error : error?.response?.data || error.message);
              setLoading(false);
            }
          }}
          sx={{
            px: 4,
            py: 1.5,
            color: '#111111',
            backgroundColor: '#FFE71A',
            '&:hover': { backgroundColor: '#E6D417' },
          }}
        >
          Login Now
        </Button>
      </Stack>
    </Stack>
  );

  const signupFrom = (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={6}>
          <RHFTextField
            name="surname"
            label={t('firstname')}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <RHFTextField
            name="middlename"
            label={t('lastname')}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <RHFTextField
            name="username"
            label={t('username')}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <RHFTextField
            name="address"
            label={t('address')}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={12}>
          <RHFTextField
            name="email"
            label={t('email')}
            disabled={verifiedEmail.value}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <RHFDatePicker
            name="birthday"
            label={t('birthday')}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <RHFTextField
            name="password"
            label={t('password')}
            type={passwordConfirm.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={passwordConfirm.onToggle} edge="end">
                    <Iconify
                      icon={passwordConfirm.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputLabel-root': { color: '#CCD5D6' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444C56' },
                '&:hover fieldset': { borderColor: '#FFE71A' },
                '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
                '& input': { color: '#CCD5D6' },
              },
            }}
          />
        </Grid>
      </Grid>

      {strength !== 0 && (
        <FormControl fullWidth>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Box
                style={{ backgroundColor: level?.color }}
                sx={{ width: 85, height: 8, borderRadius: '7px' }}
              />
            </Grid>
            <Grid item>
              <Typography className="h6" fontSize="0.75rem" color="#FFFFFF">
                {t(level?.label || '')}
              </Typography>
            </Grid>
          </Grid>
        </FormControl>
      )}

      <AnimateButton>
        <LoadingButton
          fullWidth
          size="large"
          type="button"
          color="primary"
          variant="contained"
          loading={isSubmitting || loading}
          onClick={async () => {
            await sendVerifyCode('email');
          }}
          sx={{
            px: 3,
            py: 1.5,
            color: '#111111',
            border: '1px solid #FFE71A',
            backgroundColor: '#FFE71A',
            '&:hover': { backgroundColor: '#E6D417', borderColor: '#E6D417' },
          }}
        >
          {t('next')}
        </LoadingButton>
      </AnimateButton>
    </>
  );

  const phoneVerifyForm = (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={12}>
        <Stack position="relative">
          <PhoneInput
            defaultCountry="ua"
            value={phone}
            onChange={(val, meta) => {
              if (registrationType === 'email_phone') {
                methods.setValue('phone', val);
                methods.setValue('country_reg', meta.country.name);
              }
            }}
            disabled={verifiedPhone.value}
            countries={countries}
            style={
              {
                '--react-international-phone-border-color': '#444C56',
                '--react-international-phone-text-color': '#CCD5D6',
                '--react-international-phone-border-color-focus': '#FFE71A',
                '--react-international-phone-border-color-hover': '#FFE71A',
              } as any
            }
            inputStyle={{
              color: '#CCD5D6',
            }}
          />
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <RHFAutocomplete
          name="gender"
          label={t('gender')}
          autoHighlight
          options={GENDER}
          getOptionLabel={(option) => t(option)}
          renderOption={(props, option) => (
            <li {...props} key={option}>
              {t(option)}
            </li>
          )}
          sx={{
            '& .MuiInputLabel-root': { color: '#CCD5D6' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#444C56' },
              '&:hover fieldset': { borderColor: '#FFE71A' },
              '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
              '& input': { color: '#CCD5D6' },
            },
            '& .MuiAutocomplete-option': {
              color: '#CCD5D6',
            },
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <RHFAutocomplete
          name="currency_temp"
          label={t('currency')}
          options={currencyOptions}
          isOptionEqualToValue={(option, value) => option === value}
          onChange={(e, option: any) => {
            if (registrationType === 'fast') {
              fastMethods.setValue('currency', option?.value);
            } else {
              methods.setValue('currency', option?.value);
              methods.setValue('currency_temp', option);
            }
          }}
          renderOption={(props, option: any) => (
            <li {...props} key={option.value}>
              <Image src={option.icon} width={30} sx={{ mr: 1 }} />
              {`${option.label}(${option.symbol})`}
            </li>
          )}
          sx={{
            '& .MuiInputLabel-root': { color: '#CCD5D6' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#444C56' },
              '&:hover fieldset': { borderColor: '#FFE71A' },
              '&.Mui-focused fieldset': { borderColor: '#FFE71A' },
              '& input': { color: '#CCD5D6' },
            },
            '& .MuiAutocomplete-option': {
              color: '#CCD5D6',
            },
          }}
        />
      </Grid>

      <Grid item xs={12} sx={{ my: 1 }}>
        <RHFCheckbox
          name="age"
          label={t('old_over')}
          sx={{
            '& .MuiTypography-root': {
              color: '#FFFFFF',
            },
          }}
        />
        <Typography variant="caption" color="#FFFFFF">
          {t('signup_desc1')} <br /> {t('signup_desc2')}
        </Typography>
      </Grid>

      <Grid item xs={6} sm={6}>
        <AnimateButton>
          <LoadingButton
            fullWidth
            size="large"
            type="button"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={!verifiedEmail.value}
            onClick={() => {
              setStep(0);
            }}
            sx={{
              px: 3,
              py: 1.5,
              color: '#FFFFFF',
              border: 'solid 1px #83EF8A',
              background: 'linear-gradient(180deg, #5CC04A 0%, #14A875 100%)',
            }}
          >
            {t('back')}
          </LoadingButton>
        </AnimateButton>
      </Grid>
      <Grid item xs={6} sm={6}>
        <AnimateButton>
          <LoadingButton
            fullWidth
            size="large"
            type="button"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={!age}
            onClick={async () => {
              await sendVerifyCode('phone');
            }}
            sx={{
              px: 3,
              py: 1.5,
              color: '#111111',
              border: '1px solid #FFE71A',
              backgroundColor: '#FFE71A',
              '&:hover': { backgroundColor: '#E6D417', borderColor: '#E6D417' },
              ...(Object.keys(errors).length && {
                border: '1px solid',
                borderColor: 'error.main',
                opacity: 0.8,
              }),
            }}
          >
            {t('start_playing')}
          </LoadingButton>
        </AnimateButton>
      </Grid>
    </Grid>
  );

  const renderForm = () => {
    // Show credentials if fast registration was successful
    if (generatedCredentials) {
      return credentialsDisplay;
    }

    // Show registration type selection if no type is selected
    if (!registrationType) {
      return registrationTypeSelection;
    }

    // Show fast registration form
    if (registrationType === 'fast') {
      return (
        <FormProvider methods={fastMethods} onSubmit={handleFastRegister}>
          <Stack
            spacing={2.5}
            sx={{
              '& .Mui-disabled': {
                color: '#dfdfdf !important',
              },
            }}
          >
            {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            {fastRegistrationForm}
          </Stack>
        </FormProvider>
      );
    }

    // Show traditional email & phone registration form
    return (
      <FormProvider methods={methods} onSubmit={handleLogin}>
        <Stack
          spacing={2.5}
          sx={{
            '& .Mui-disabled': {
              color: '#dfdfdf !important',
            },
          }}
        >
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {step === 0 && signupFrom}
          {step === 1 && phoneVerifyForm}
        </Stack>
      </FormProvider>
    );
  };

  return (
    <AuthWrapper>
      <Stack justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
        <Card
          component={Stack}
          sx={{
            position: 'relative',
            maxWidth: 1200,
            width: '95vw',
            my: { sm: 3 },
            mx: { xs: 2, md: 3 },
            flexDirection: { xs: 'column', md: 'row-reverse' },
            '& > *': {
              flexGrow: isMobile ? 0 : 1,
              flexBasis: isMobile ? 'auto' : '50%',
            },
            ...(isIPhone13 && {
              top: 52,
              height: '91%',
              position: 'absolute',
              width: 'calc(100% - 32px)',
              mx: 2,
            }),
            ...(isMobile &&
              !isIPhone13 && {
                height: 'auto',
                maxHeight: '90vh',
                position: 'relative',
                width: 'calc(100% - 32px)',
                my: 2,
                mx: 2,
              }),
            background: '#1A1D29',
            borderRadius: 0,
          }}
        >
          <IconButton 
            color="inherit" 
            size="small" 
            disableRipple 
            onClick={() => dispatch(ChangePage(''))} 
            sx={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              color: '#FFFFFF', 
              zIndex: 2000,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 0,
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <Iconify icon="mdi:close" width={24} />
          </IconButton>
          {!isMobile ? (
            <Stack
              sx={{
                bgcolor: 'transparent',
                position: 'relative',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  p: 0,
                  width: '100%',
                  height: '80%',
                  overflow: 'hidden',
                  backgroundImage: 'url(/assets/banners/auth/bonus.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center right',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Texts on the left over banner background */}
                <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', md: '40%' }, px: { xs: 1.5, md: 3 } }}>
                  <Typography
                    color="#FFFFFF"
                    sx={{
                      fontFamily: BLUNT_FONT,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 28,
                      textTransform: 'uppercase',
                      lineHeight: 1,
                      letterSpacing: '0.05em',
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('daily_free_bonuses')}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#FFE71A',
                      fontFamily: BLUNT_FONT,
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 16,
                      lineHeight: 1.1,
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('100_chance_to_win_any_bonus')}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: BLUNT_FONT,
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1.1,
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('spin_the_will_and_get_free_bonus_every_day')}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="center" alignItems="center" mt={2} spacing={1} sx={{ height: '20%' }}>
                <IconButton onClick={handleToggle}>
                  <Iconify
                    icon={toggleState ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off-outline'}
                    color="#FFFFFF"
                    width={40}
                  />
                </IconButton>
                <Typography variant="caption" color="#FFFFFF" sx={{ transform: 'skewX(-5deg)' }}>
                  {t('use_bonus')}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack
              sx={{
                bgcolor: 'transparent',
                position: 'relative',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                order: 1,
                flexShrink: 0,
                height: 'auto',
                minHeight: '250px',
                m: 0,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="flex-start"
                sx={{
                  position: 'relative',
                  borderRadius: 0,
                  p: 0,
                  width: '100%',
                  height: '85%',
                  overflow: 'hidden',
                  backgroundImage: 'url(/assets/banners/auth/bonus.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center right',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Texts on the left over banner background */}
                <Stack spacing={0.5} sx={{ position: 'relative', zIndex: 1, width: '100%', px: 2 }}>
                  <Typography
                    color="#FFFFFF"
                    sx={{
                      fontFamily: BLUNT_FONT,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 20,
                      textTransform: 'uppercase',
                      lineHeight: 1,
                      letterSpacing: '0.05em',
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('daily_free_bonuses')}
                  </Typography>
                  <Typography
                    sx={{ 
                      color: '#FFE71A', 
                      fontFamily: BLUNT_FONT, 
                      fontStyle: 'italic', 
                      fontWeight: 700, 
                      fontSize: 14, 
                      lineHeight: 1.1,
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('100_chance_to_win_any_bonus')}
                  </Typography>
                  <Typography
                    sx={{ 
                      color: '#FFFFFF', 
                      fontFamily: BLUNT_FONT, 
                      fontStyle: 'italic', 
                      fontWeight: 700, 
                      fontSize: 12, 
                      lineHeight: 1.1,
                      transform: 'skewX(-5deg)',
                    }}
                  >
                    {t('spin_the_will_and_get_free_bonus_every_day')}
                  </Typography>
                </Stack>
              </Stack>
              
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ height: '25%', mt: 1 }}>
                <IconButton onClick={handleToggle}>
                  <Iconify
                    icon={toggleState ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off-outline'}
                    color="#FFFFFF"
                    width={40}
                  />
                </IconButton>
                <Typography variant="caption" color="#FFFFFF" sx={{ transform: 'skewX(-5deg)' }}>
                  {t('use_bonus')}
                </Typography>
              </Stack>
            </Stack>
          )}

          <Scrollbar sx={{ 
            order: 0,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FFE71A 0%, rgba(255, 231, 26, 0.3) 50%, transparent 100%)',
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, #FFE71A 0%, rgba(255, 231, 26, 0.3) 50%, transparent 100%)',
              zIndex: 1,
            }
          }}>
            <Grid
              sx={{
                py: 3,
                position: 'relative',
                px: { xs: 3, sm: 3 },
                bgcolor: 'transparent',
              }}
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >

              <Grid item>
                <Logo disabledLink sx={{ '& img': { height: 50 } }} />
              </Grid>
              <Grid item xs={12}>
                {renderHead}
                {renderForm()}
                {renderTerms}
              </Grid>
            </Grid>
          </Scrollbar>
        </Card>
      </Stack>
      <VerifyModal
        modalStatus={verifyStatus.value}
        onClose={verifyStatus.onFalse}
        verifyType={verifyType}
        resend={() => sendVerifyCode(verifyType.type)}
        verify={verify}
      />
    </AuthWrapper>
  );
}
