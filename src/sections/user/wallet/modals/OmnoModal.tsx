import toast from 'react-hot-toast';
import { useLocation } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Country } from 'country-state-city';

import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Grid,
  Box,
  Autocomplete,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider, {
  RHFAutocomplete,
  // RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import useApi from 'src/hooks/use-api';
import { useSelector } from 'src/store';
import Image from 'src/components/image';
import { SplashScreen } from 'src/components/loading-screen';
import { BalanceProps } from 'src/types';

interface OmnoModalProps {
  // balances: BalanceProps[];
  isCard: boolean;
  onClose: () => void;
}

const countries = Country.getAllCountries();
const COUNTRY_OPTIONS = countries.map((country) => ({
  label: country.name,
  value: country.isoCode,
}));

const OmnoModal = forwardRef(
  ({ isCard, onClose }: OmnoModalProps, ref: React.Ref<HTMLDivElement>) => {
    const { t } = useLocales();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bonus = queryParams.get('bonus');
    const amt = queryParams.get('amt');

    const { user, currencyId } = useSelector((store) => store.auth);

    const [loading, setLoading] = useState<boolean>(false);
    const [iframeUrl, setIframeUrl] = useState<string>('');
    const [currencies, setCurrencies] = useState<any>([]);

    const { get_fiat_currencies, create_fiat_transaction } = useApi();

    const validationSchema = Yup.object().shape({
      firstName: Yup.string().required(t('firstname_required')),
      lastName: Yup.string().required(t('lastname_required')),
      city: Yup.string().required(t('city_required')),
      address1: Yup.string().required(t('address1_is_required')),
      state: Yup.string().required(t('state_required')),
      country: Yup.string().required(t('country_required')),
      postalCode: Yup.string().required(t('postal_code_required')),
      phone: Yup.string().required(t('phone_required')),
      email: Yup.string().required(t('email_required')),
      // amount: Yup.number().min(1, t("amount_min_required", { label: 1 })).required(t("amount_required")),
      currency: Yup.string().required(t('currency_required')),
      // currency_temp: Yup.mixed<any>().nullable().required(t('currency_required')),
      country_temp: Yup.mixed<any>().nullable().required(t('country_required')),
    });

    const defaultValues = useMemo(
      () => ({
        firstName: user.surname || '',
        lastName: user.middlename || '',
        city: user.city || '',
        address1: user.address || '',
        state: user.state || '',
        country: user.country_reg || '',
        postalCode: user.postal_code || '',
        phone: user.phone || '',
        email: user.email || '',
        // amount: 0,
        currency: currencyId || '',
        // currency_temp: {
        //   label: balances[0]?.currency.name,
        //   symbol: balances[0]?.currency.symbol,
        //   value: balances[0]?.currency._id,
        //   icon: balances[0]?.currency.icon,
        // },
        country_temp: null,
      }),
      [user, currencyId]
    );

    const methods = useForm({
      resolver: yupResolver(validationSchema),
      values: defaultValues,
    });

    const {
      setValue,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
      try {
        const query: any = data;
        // if (amt && Number(amt) < query.amount) {
        //   toast.error(t("max_deposit_amount_bonus", { num: amt }));
        //   return;
        // }
        delete query.country_temp;
        // delete query.currency_temp;
        if (bonus) query.bonusId = bonus;
        query.isCard = isCard;

        const res = await create_fiat_transaction(query);
        if (!res?.data) return;
        setIframeUrl(res?.data);
        // onClose();
      } catch (error) {
        console.error(error);
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
      if (!user?.country_reg || !COUNTRY_OPTIONS.length) return;
      const defaultSelected = COUNTRY_OPTIONS.find((e) => e.label === user?.country_reg);
      if (!defaultSelected) return;
      setValue('country_temp', defaultSelected);
      setValue('country', defaultSelected.value);
    }, [user?.country_reg, setValue]);

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

    const currencyValue = currencyOptions.find((option: any) => option.value === currencyId);

    const fiatForm = (
      <Box>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="firstName" label={t('first_name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="lastName" label={t('last_name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="address1" label={t('address1')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="city" label={t('city')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="state" label={t('state')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocomplete
                name="country_temp"
                label={t('country')}
                options={COUNTRY_OPTIONS}
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(e, option: any) => {
                  setValue('country', option?.value);
                  setValue('country_temp', option);
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    <Iconify
                      key={option.value}
                      icon={`circle-flags:${option.value.toLowerCase()}`}
                      width={28}
                      sx={{ mr: 1 }}
                    />
                    {option.label}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="postalCode" label={t('postal_code')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="phone" label={t('phone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField fullWidth name="email" label={t('email')} />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
          <RHFTextField
            type="number"
            fullWidth
            name="amount"
            label={t("amount")}
          />
        </Grid> */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={currencyValue}
                options={currencyOptions}
                renderInput={(params) => (
                  <TextField label={t('currency')} placeholder={t('currency')} {...params} />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(e, option: any) => {
                  setValue('currency', option?.value);
                  // setValue('currency_temp', option);
                }}
                disabled
                renderOption={(props, option: any) => (
                  <li {...props} key={option.value}>
                    <Image src={option.icon} width={30} sx={{ mr: 1 }} />
                    {`${option.label}(${option.symbol})`}
                  </li>
                )}
              />
            </Grid>
          </Grid>
          <LoadingButton
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            loading={isSubmitting}
          >
            {t('deposit')}
          </LoadingButton>
        </FormProvider>
      </Box>
    );

    return (
      <div ref={ref} tabIndex={-1}>
        <Card
          sx={{
            position: 'absolute',
            width: { xs: 0.95, lg: 535 },
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '98vh',
            overflow: 'auto',
          }}
        >
          <CardHeader
            title="Fiat Payment"
            action={
              <IconButton onClick={onClose}>
                <Iconify icon="mdi:close" />
              </IconButton>
            }
            sx={{ py: 2 }}
          />
          <CardContent sx={{ position: 'relative', minHeight: 500, display: 'grid' }}>
            {loading || iframeUrl ? (
              <SplashScreen sx={{ position: 'absolute', bgcolor: '#062629' }} />
            ) : (
              fiatForm
            )}
            {iframeUrl && (
              <Box
                component="iframe"
                src={iframeUrl}
                sx={{
                  width: 1,
                  height: 1,
                  border: 0,
                  zIndex: 1000,
                  position: 'relative',
                  borderRadius: 0.5,
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

export default OmnoModal;
