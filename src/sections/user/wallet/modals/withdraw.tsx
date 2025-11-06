import toast from 'react-hot-toast';
import { forwardRef, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { alpha } from '@mui/material/styles';
import { m } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardProps,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useLocales } from 'src/locales';
import useApi from 'src/hooks/use-api';

import { useSelector } from 'src/store';
import Iconify from 'src/components/iconify';
import { AnimateButton, MotionContainer, varBounce } from 'src/components/animate';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { UploadIllustration } from 'src/assets/illustrations';
import { ICryptoCurrency, IWithdraw } from 'src/types';

interface Props extends CardProps {
  currencies: ICryptoCurrency[];
  getTransactions: () => Promise<void>;
  onClose: () => void;
}

const WithdrawModal = forwardRef(({ currencies, getTransactions, onClose }: Props, ref: React.Ref<HTMLDivElement>) => {
  const { t } = useLocales();

  const paymentOption = [
    { icon: 'simple-icons:fiat', label: t('fiat'), value: 'fiat' },
    { icon: 'logos:bitcoin', label: t('crypto'), value: 'crypto' },
    { icon: 'mdi:credit-card', label: t('card'), value: 'card' },
  ];

  const [paymentType, setPaymentType] = useState<string>('');

  const close = async () => {
    onClose();
    await getTransactions();
  };

  const renderEmpty = (
    <Stack
      sx={{
        py: 5,
        px: 1,
        outline: 'none',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
        transition: (theme) => theme.transitions.create(['opacity', 'padding']),
      }}
    >
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t('select_method')}
          </Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <UploadIllustration sx={{ height: 200, my: { xs: 2, sm: 3 } }} />
        </m.div>
      </MotionContainer>
    </Stack>
  );

  return (
    <div ref={ref} tabIndex={-1}>
      <Card
        sx={{
          position: 'absolute',
          width: { xs: 1, sm: 450 },
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CardHeader
          title={`${t('withdrawal')} ${t(paymentType)}`}
          action={
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          }
          sx={{ py: 2 }}
        />
        <CardContent sx={{ mb: 2, pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Alert
                variant="outlined"
                severity="error"
                sx={{
                  borderStyle: 'dashed',
                  borderColor: (theme) => theme.palette.error.main,
                  color: (theme) => theme.palette.error.main,
                  mb: 2,
                }}
              >
                <Iconify icon="mdi:alert" sx={{ mr: 1 }} />
                {t('use_recent_payment_method')}
              </Alert>
              <Autocomplete
                options={paymentOption}
                onChange={(e, row) => {
                  setPaymentType(row?.value || '');
                }}
                renderInput={(params) => <TextField {...params} label={t('payment_methods')} />}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    <Iconify icon={option.icon} mr={1} />
                    {option.label}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              {!paymentType && renderEmpty}
              {paymentType === 'crypto' && <CryptoComponent currencies={currencies} onClose={close} />}
              {paymentType === 'fiat' && <FiatComponent onClose={close} />}
              {paymentType === 'card' && <CardComponent onClose={close} />}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
});

interface ICryptoProps {
  currencies: ICryptoCurrency[];
  onClose: () => Promise<void>;
}

const CryptoComponent = ({ currencies, onClose }: ICryptoProps) => {
  const { t } = useLocales();
  const { withdrawal } = useApi();
  const { balance } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [address, setAddress] = useState<string>('');

  const [selectedCurrency, setSelectedCurrency] = useState<ICryptoCurrency | null>(null);

  const coins = currencies.reduce((ary: ICryptoCurrency[], coin: ICryptoCurrency) => {
    if (coin.withdrawable) return [...ary, { ...coin, label: coin.name }];
    return ary;
  }, []);

  const onSubmit = async () => {
    if (!selectedCurrency) return;
    if (balance <= 0) {
      toast.error('You need to deposit first.');
      return;
    }
    if (amount > balance) {
      toast.error('Your balance is not enough!');
      return;
    }
    if (amount < 20) {
      toast.error(t('min_required', { label: t('amount'), num: 20 }));
      return;
    }
    if (!address) return;
    const checked = amount.toString().split('.')[1] === undefined || amount.toString().split('.')[1].length <= 2;
    if (!checked) {
      toast.error(t('max_decimal_places', { stukabel: t('amount'), num: 2 }));
      return;
    }
    setLoading(true);
    const param: IWithdraw = {
      currency: selectedCurrency.symbol,
      amount,
      address,
      type: 'crypto',
    };
    const res = await withdrawal(param);
    setLoading(false);
    if (!res?.data) return;
    toast.success(t('success'));
    await onClose();
  };

  return (
    <Stack gap={2}>
      <Autocomplete
        options={coins}
        onChange={(e, row) => {
          setSelectedCurrency(row);
        }}
        renderInput={(params) => <TextField {...params} label={t('coins')} />}
        renderOption={(props, option) => {
          const { icon } = currencies.filter((e) => e.symbol === option.symbol)[0];

          if (!icon) {
            return null;
          }

          return (
            <li {...props} key={option.symbol}>
              <Box component="img" src={option.icon} alt="currency" width={20} height={20} mr={1} />
              {`${option.name} (${option.symbol})`}
            </li>
          );
        }}
      />
      <TextField
        fullWidth
        label={t('address')}
        variant="outlined"
        onChange={(e) => setAddress(e.target.value)}
      />
      <TextField
        fullWidth
        label={t('amount')}
        type="number"
        variant="outlined"
        onChange={(e) => setAmount(Number(e.target.value))}
        inputProps={{ min: 0 }}
      />
      <Alert
        variant="outlined"
        severity="warning"
        sx={{
          borderStyle: 'dashed',
          borderColor: (theme) => theme.palette.warning.main,
        }}
      >
        {t('check_address')}
      </Alert>
      <AnimateButton>
        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          loading={loading}
          onClick={onSubmit}
        >
          {t('submit')}
        </LoadingButton>
      </AnimateButton>
    </Stack>
  );
};

interface IFiatProps {
  onClose: () => Promise<void>;
}

const FiatComponent = ({ onClose }: IFiatProps) => {
  const { t } = useLocales();
  const { withdrawal } = useApi();
  const { balance } = useSelector((store) => store.auth);

  const validationSchema = Yup.object().shape({
    bank_name: Yup.string().required(t('label_required', { label: t('bank_name') })),
    IBAN: Yup.string().required(t('label_required', { label: t('IBAN') })),
    account_number: Yup.string().required(t('label_required', { label: t('account_number') })),
    swift: Yup.string().required(t('label_required', { label: t('swift') })),
    bank_address: Yup.string().required(t('label_required', { label: t('bank_address') })),
    amount: Yup.number()
      .min(20, t('min_required', { label: t('amount'), num: 20 }))
      .required(t('label_required', { label: t('amount') }))
      .test(
        'max-decimal-places',
        t('max_decimal_places', { label: t('amount'), num: 2 }),
        (value) => {
          if (value) {
            return value.toString().split('.')[1] === undefined || value.toString().split('.')[1].length <= 2;
          }
          return true;
        }
      ),
  });

  const defaultValues = useMemo(
    () => ({
      bank_name: '',
      IBAN: '',
      account_number: '',
      swift: '',
      bank_address: '',
      amount: 0,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (balance <= 0) {
        toast.error('You need to deposit first.');
        return;
      }
      if (data.amount > balance) {
        toast.error('Your balance is not enough!');
        return;
      }
      const param: IWithdraw = {
        ...data,
        type: 'fiat',
      };
      const res = await withdrawal(param);
      if (!res?.data) return;
      toast.success(t('success'));
      await onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RHFTextField fullWidth name="bank_name" label={t('bank_name')} />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth name="IBAN" label={t('IBAN')} />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth name="account_number" label={t('account_number')} />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth name="swift" label={t('swift')} />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth name="bank_address" label={t('bank_address')} />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth type="number" name="amount" label={t('amount')} />
        </Grid>
      </Grid>
      <AnimateButton>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          loading={isSubmitting}
        >
          {t('submit')}
        </LoadingButton>
      </AnimateButton>
    </FormProvider>
  );
};

interface ICardProps {
  onClose: () => Promise<void>;
}

const CardComponent = ({ onClose }: ICardProps) => {
  const { t } = useLocales();
  const { withdrawal } = useApi();
  const { balance } = useSelector((store) => store.auth);

  const [cardType, setCardType] = useState<string>('');

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'American Express';
    if (cleaned.startsWith('6')) return 'Discover';
    return '';
  };

  const getCardIcon = (type: string) => {
    const cardIcons: { [key: string]: string } = {
      Visa: 'logos:visa',
      Mastercard: 'logos:mastercard',
      'American Express': 'logos:american-express',
      Discover: 'logos:discover',
    };
    return cardIcons[type] || '';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const validationSchema = Yup.object().shape({
    card_number: Yup.string()
      .required(t('label_required', { label: t('card_number') }))
      .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, t('invalid_card_number'))
      .test('length', t('card_number_length'), (value) => value.replace(/\s/g, '').length === 16),
    amount: Yup.number()
      .min(20, t('min_required', { label: t('amount'), num: 20 }))
      .required(t('label_required', { label: t('amount') }))
      .test(
        'max-decimal-places',
        t('max_decimal_places', { label: t('amount'), num: 2 }),
        (value) => {
          if (value) {
            return value.toString().split('.')[1] === undefined || value.toString().split('.')[1].length <= 2;
          }
          return true;
        }
      ),
  });

  const defaultValues = useMemo(
    () => ({
      card_number: '',
      amount: 0,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (balance <= 0) {
        toast.error('You need to deposit first.');
        return;
      }
      if (data.amount > balance) {
        toast.error('Your balance is not enough!');
        return;
      }
      const param: IWithdraw = {
        card_number: data.card_number.replace(/\s/g, ''),
        amount: data.amount,
        type: 'card',
      };
      const res = await withdrawal(param);
      if (!res?.data) return;
      toast.success(t('success'));
      await onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RHFTextField
            fullWidth
            name="card_number"
            label={t('card_number')}
            onChange={(e) => {
              const formatted = formatCardNumber(e.target.value);
              setValue('card_number', formatted);
              setCardType(detectCardType(formatted));
            }}
            InputProps={{
              endAdornment: cardType && (
                <Iconify icon={getCardIcon(cardType)} width={24} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField fullWidth type="number" name="amount" label={t('amount')} />
        </Grid>
      </Grid>
      <AnimateButton>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          loading={isSubmitting}
        >
          {t('submit')}
        </LoadingButton>
      </AnimateButton>
    </FormProvider>
  );
};

export default WithdrawModal;