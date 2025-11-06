import { defaultCountries } from 'react-international-phone';

import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { MenuItem } from '@mui/material';
// components
import { AnimateButton } from 'src/components/animate';
import FormProvider, {
  RHFAutocomplete,
  RHFDatePicker,
  RHFSelect,
  // RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useLocales } from 'src/locales';
import { useDispatch, useSelector } from 'src/store';
import { UpdateInfo } from 'src/store/reducers/auth';

import useApi from 'src/hooks/use-api';
import { useBoolean } from 'src/hooks/use-boolean';
import { IUpdateUser } from 'src/types';
// utils
import { fData } from 'src/utils/format-number';
import { DEFAULT_COUNTRY_CURRENCY } from 'src/utils';
// import { countries } from 'src/assets/data';
import { API_URL } from 'src/config-global';
import KYCForm from './kyc-form';
// ----------------------------------------------------------------------

export default function AccountForm() {
  const { t } = useLocales();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { upload_file, delete_file, update_user } = useApi();

  const countries = useMemo(() =>
    defaultCountries.filter((country) => DEFAULT_COUNTRY_CURRENCY.some((c) => c.name === country[0])),
    []
  );

  const dialogKYC = useBoolean();

  const NewUserSchema = Yup.object().shape({
    _id: Yup.string().required(t("id_required")),
    surname: Yup.string().max(30).required(t("surname_required")),
    middlename: Yup.string().max(30).required(t("middlename_required")),
    username: Yup.string().min(4).max(30).required(t("name_required")),
    email: Yup.string().required(t("email_required")).email(t("valid_email")),
    phone: Yup.string().required(t("phone_required")),
    country_reg: Yup.string().required(t("country_required")),
    birthday: Yup.mixed<any>().nullable().required(t("birthday_required")),
    address: Yup.string().required(t("address_required")),
    avatar: Yup.mixed<any>().nullable().required(t("avatar_required")),
  });

  const defaultValues = useMemo(
    () => ({
      _id: user._id || '',
      surname: user.surname || '',
      middlename: user.middlename || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      country_reg: user.country_reg || '',
      address: user.address || '',
      birthday: user.birthday ? new Date(user.birthday) : null,
      avatar: user.avatar ? `${API_URL}/${user.avatar}` : null,
      betlimit: user.betlimit || 0,
      betlimit_period: user.betlimit_period || 0,
    }),
    [user]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    values: defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const fileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await upload_file(formData);
    if (!res?.data) return null;
    return res.data;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // @ts-ignore
      let param: IUpdateUser = {
        ...data,
        update: true,
        userId: data._id,
        birthday: new Date(data.birthday).getTime(),
      };
      console.log(param, "==>param");

      delete param.email;
      delete param.phone;
      delete param.country_reg;

      if (typeof data.avatar !== 'string') {
        if (user.avatar) delete_file(user.avatar);

        const avatar = await fileUpload(data.avatar);
        if (!avatar) return;
        param = { ...param, avatar: avatar.uri };
      }
      param = { ...param, avatar: param.avatar.replaceAll(`${API_URL}/`, '') };
      const res = await update_user(param);
      if (!res?.data) return;
      dispatch(UpdateInfo(res?.data));
      toast.success(t("update_success"));
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatar', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (

    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ 
              pt: 10, 
              pb: 5, 
              px: 3, 
              bgcolor: '#2B2F3D !important', 
              border: 'none',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, #FFE71A 0%, transparent 100%)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '1px',
                background: 'linear-gradient(180deg, #FFE71A 0%, transparent 100%)',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }
            }} >
              <Label color="warning" variant="filled" sx={{ position: 'absolute', top: 24, right: 24, bgcolor: '#FFE71A !important', color: '#000 !important' }}>
                {t("active")}
              </Label>

              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="avatar"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  sx={{
                    // Main container border
                    '& > .MuiBox-root': {
                      borderColor: '#FFE71A !important',
                      border: '1px dashed #FFE71A !important',
                    },
                    // Placeholder stack (contains icon and text)
                    '& .upload-placeholder': {
                      color: '#FFE71A !important',
                      '& .MuiSvgIcon-root': {
                        color: '#FFE71A !important',
                      },
                      '& .MuiTypography-caption': {
                        color: '#FFE71A !important',
                      },
                    },
                    // Any other text elements
                    '& .MuiTypography-root': {
                      color: '#FFE71A !important',
                    },
                    // Override any default styles
                    '& svg': {
                      color: '#FFE71A !important',
                    },
                    ...(isSubmitting && {
                      '& .MuiAvatar-root': {
                        backgroundColor: '#FFE71A !important',
                        color: '#000 !important',
                      },
                    }),
                  }}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: '#FFFFFF !important',
                      }}
                    >
                      {t("allowed")} *.jpeg, *.jpg, *.png, *.gif
                      <br /> {t("max_size_of")} {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>

              <Typography textAlign="center" color="text.disabled">
                {t("user_id")} : <Box component="span" sx={{ color: '#FFE71A', fontWeight: 600 }}>{values._id}</Box>
              </Typography>

              {/* <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            /> */}
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card sx={{ 
              p: 3, 
              bgcolor: '#2B2F3D !important', 
              border: 'none',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, #FFE71A 0%, transparent 100%)',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '1px',
                background: 'linear-gradient(180deg, #FFE71A 0%, transparent 100%)',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }
            }}>
              <Typography variant="h5" sx={{ mb: 2, letterSpacing: '0.04em', transform: 'skew(-5deg)' }}>
                <Box component="span" sx={{ color: '#FFE71A', fontWeight: 700, letterSpacing: '0.05em' }}>PERSONAL</Box>{' '}
                <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.02em' }}>INFORMATION</Box>
              </Typography>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="surname" label={t("firstname")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />
                <RHFTextField name="middlename" label={t("lastname")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />
                <RHFTextField name="username" label={t("user_name")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />
                <RHFTextField name="email" label={t("email")} disabled sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
                    '& fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#1A1D29 !important',
                      '& fieldset': {
                        borderColor: '#FFE71A !important',
                      },
                    },
                  },
                }} />
                <RHFTextField name="phone" label={t("phone")} disabled sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
                    '& fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFE71A',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#1A1D29 !important',
                      '& fieldset': {
                        borderColor: '#FFE71A !important',
                      },
                    },
                  },
                }} />

                <RHFAutocomplete
                  name="country_reg"
                  label={t("country")}
                  options={countries.map((country) => country[0])}
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#1A1D29',
                      '& fieldset': {
                        borderColor: '#FFE71A',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFE71A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFE71A',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#1A1D29 !important',
                        '& fieldset': {
                          borderColor: '#FFE71A !important',
                        },
                      },
                    },
                  }}
                  renderOption={(props, option) => {
                    const item = countries.find(
                      (country) => country[0] === option
                    );

                    if (!item) {
                      return null;
                    }

                    return (
                      <li {...props} key={item[1]}>
                        <Iconify
                          key={item[1]}
                          icon={`circle-flags:${item[1].toLowerCase()}`}
                          width={28}
                          sx={{ mr: 1 }}
                        />
                        {item[0]} ({item[1].toLocaleUpperCase()})  {item[2].includes("+") ? "" : "+"}{item[2]}
                      </li>
                    );
                  }}
                />

                <RHFDatePicker name="birthday" label={t("birthday")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />
                <RHFTextField name="address" label={t("address")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />

                <RHFTextField type="number" name="betlimit" label={t("betlimit")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }} />
                <RHFSelect name="betlimit_period" label={t("betlimit_period")} sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1A1D29',
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
                }}>
                  <MenuItem value={1}>A day (1)</MenuItem>
                  <MenuItem value={7}>A Week (7)</MenuItem>
                  <MenuItem value={30}>A Month (30)</MenuItem>
                </RHFSelect>

              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Button 
                    variant='contained' 
                    color='info' 
                    onClick={dialogKYC.onTrue} 
                    fullWidth
                    sx={{
                      bgcolor: '#FFE71A', 
                      border: '1px solid #FFE71A',
                      color: '#000',
                      fontWeight: 700,
                      transform: 'skew(-5deg)',
                      textAlign: 'center',
                      '&:hover': {
                        bgcolor: '#E6D117',
                        background: 'linear-gradient(180deg, transparent 0%, #FFE71A 100%)',
                      },
                    }}
                  >
                    {t("kyc_verify")}
                  </Button>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <AnimateButton>
                    <LoadingButton
                      type="submit"
                      variant="outlined"
                      color="warning"
                      loading={isSubmitting}
                      disabled={user.kycVerified}
                      fullWidth
                      sx={{
                        borderColor: '#FFE71A',
                        color: '#FFE71A',
                        fontWeight: 700,
                        transform: 'skew(-5deg)',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(255,231,26,0.25) 0%, rgba(255,231,26,0) 100%)',
                        '&:hover': {
                          borderColor: '#FFE71A',
                          background: 'linear-gradient(180deg, rgba(255,231,26,0.35) 0%, rgba(255,231,26,0) 100%)',
                        },
                      }}
                    >
                      {t("save_changes")}
                    </LoadingButton>
                  </AnimateButton>
                </Box>
              </Stack>

            </Card>

          </Grid>
        </Grid>
      </FormProvider>
      <Dialog
        open={dialogKYC.value}
        onClose={dialogKYC.onFalse}
        PaperProps={{
          sx: {
            width: 1, maxWidth: 565
          }
        }}
      >
        <KYCForm country={values.country_reg} onClose={dialogKYC.onFalse} />
      </Dialog>
      {/* <Dialog open={dialogKYC.value} onClose={dialogKYC.onFalse} maxWidth="sm">
        <DialogTitle component="div" >
          <Stack direction="row" justifyContent="space-between" gap={{ xs: 1, sm: 4 }}>
           
          </Stack>
        </DialogTitle>
      </Dialog> */}

    </>
  );
}
