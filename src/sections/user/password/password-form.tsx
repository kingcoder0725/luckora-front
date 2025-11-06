import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useCallback, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
// hooks
import { useLocales } from 'src/locales';
import useApi from 'src/hooks/use-api';
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { AnimateButton } from 'src/components/animate';


// ----------------------------------------------------------------------

export default function PasswordForm() {
  const { t } = useLocales();
  const { change_password } = useApi();
  const eye = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    currentPassword: Yup.string().required(t("current_password_required")),
    password: Yup.string().min(8).max(30).required(t("password_required")),
    confirmPassword: Yup.string()
      .required(t("confirm_password_required"))
      .oneOf([Yup.ref('password')], t("password_not_match")),
  });

  const defaultValues = useMemo(
    () => ({
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    values: defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { currentPassword, password } = data;
      const res = await change_password({ currentPassword, password });
      if (!res?.data) return;
      reset();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card sx={{ 
        p: 3, 
        borderRadius: 2, 
        bgcolor: '#2B2F3D',
        border: 'none',
        borderLeft: '1px solid #FFE71A',
        borderTop: '1px solid #FFE71A',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, #FFE71A, rgba(255, 231, 26, 0))',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(to bottom, #FFE71A, rgba(255, 231, 26, 0))',
        }
      }}>
        {/* Header text */}
        <Typography
          sx={{
            fontFamily: '"FONTSPRING DEMO - Blunt Con It Italic", "Impact", serif',
            fontWeight: 400,
            transform: 'skew(-5deg)',
            fontSize: '18px',
            textTransform: 'uppercase',
            mb: 3,
            '& .enter-text': {
              color: '#FFE71A',
            },
            '& .details-text': {
              color: '#fff',
            }
          }}
        >
          <span className="enter-text">ENTER</span>{' '}
          <span className="details-text">YOUR DETAILS</span>
        </Typography>

        <Stack spacing={3}>
          <RHFTextField 
            type="password" 
            name="currentPassword" 
            label={t("current_password")}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1A1D29',
                color: '#fff',
                '& fieldset': {
                  borderColor: '#FFE71A',
                },
                '&:hover fieldset': {
                  borderColor: '#FFE71A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFE71A',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#A0A3A7',
                '&.Mui-focused': {
                  color: '#FFE71A',
                },
              },
            }}
          />
          <RHFTextField
            name="password"
            label={t("password")}
            type={eye.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={eye.onToggle} edge="end" sx={{ color: '#FFE71A' }}>
                    <Iconify icon={eye.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1A1D29',
                color: '#fff',
                '& fieldset': {
                  borderColor: '#FFE71A',
                },
                '&:hover fieldset': {
                  borderColor: '#FFE71A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFE71A',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#A0A3A7',
                '&.Mui-focused': {
                  color: '#FFE71A',
                },
              },
            }}
          />
          <RHFTextField
            name="confirmPassword"
            label={t("confirm_password")}
            type={eye.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={eye.onToggle} edge="end" sx={{ color: '#FFE71A' }}>
                    <Iconify icon={eye.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1A1D29',
                color: '#fff',
                '& fieldset': {
                  borderColor: '#FFE71A',
                },
                '&:hover fieldset': {
                  borderColor: '#FFE71A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFE71A',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#A0A3A7',
                '&.Mui-focused': {
                  color: '#FFE71A',
                },
              },
            }}
          />
        </Stack>

        <Stack sx={{ mt: 3 }}>
          <AnimateButton>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              fullWidth
              sx={{
                bgcolor: '#FFE71A',
                color: '#000',
                border: 'none',
                fontFamily: '"FONTSPRING DEMO - Blunt Con It Italic", "Impact", serif',
                fontStyle: 'italic',
                transform: 'skew(-5deg)',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '16px',
                py: 1.5,
                '&:hover': { 
                  bgcolor: '#E6D000',
                  border: 'none',
                },
                '&:focus': {
                  border: 'none',
                },
              }}
            >
              {t("change_password")}
            </LoadingButton>
          </AnimateButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
