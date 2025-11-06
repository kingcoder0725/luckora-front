import toast from 'react-hot-toast';
import { useLocation } from 'react-router';
import { forwardRef, useEffect, useState } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardProps,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useLocales } from 'src/locales';
import useApi from 'src/hooks/use-api';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { useSelector } from 'src/store';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { AnimateButton } from 'src/components/animate';
import { UploadIllustration } from 'src/assets/illustrations';
import { ICryptoCurrency, ICryptoToken, IGetAdd, ISubmitCrypto } from 'src/types';

const DEPOSIT_PENDING_TIME = 120;

interface Props extends CardProps {
  currencies: ICryptoCurrency[];
  onClose: () => void;
}

const DepositModal = forwardRef(
  ({ currencies, onClose }: Props, ref: React.Ref<HTMLDivElement>) => {
    const { t } = useLocales();
    const { copy } = useCopyToClipboard();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const bonus = queryParams.get('bonus');

    const {
      depositNow,
      generate_address,
      get_address,
      submitCryptoDeposit,
      calcUsdtToCrypto,
      getActivePayment,
    } = useApi();
    const { currency } = useSelector((store) => store.auth);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [qrcode, setQrcode] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);

    const [selectedCurrency, setSelectedCurrency] = useState<ICryptoCurrency | null>(null);
    const [token, setToken] = useState<ICryptoToken | null>(null);
    const [createdDate, setCreatedDate] = useState<string | null>(null);

    // const handleDeposit = async () => {
    //     // @ts-ignore
    //     if (!selectedCurrency || amount <= selectedCurrency?.minDeposit) return;
    //     const res = await depositNow({ amount, currencyId: selectedCurrency._id });
    //     if (!res?.data) return;
    //     setAddress(res.data.address);
    //     adressOpen.onTrue();
    //     getTransactions();
    // }

    const getAddress = async () => {
      if (!selectedCurrency) return;
      setLoading(true);
      const param: IGetAdd = {
        symbol: selectedCurrency.symbol,
      };
      if (bonus) param.bonusId = bonus;
      const res = await get_address(param);
      setLoading(false);
      if (!res?.data) {
        setAddress('');
        setQrcode('');
        return;
      }
      setAddress(res.data.address);
      setQrcode(res.data.qr_code);
    };

    const handleGenerate = async () => {
      if (!selectedCurrency) {
        toast.error('Please select a currency');
        setError(true);
        return;
      }
      setError(false);
      setLoading(true);
      const param: IGetAdd = {
        symbol: selectedCurrency.symbol,
      };
      if (bonus) param.bonusId = bonus;
      const res = await generate_address(param);
      setLoading(false);
      if (!res?.data) return;
      setAddress(res.data.address);
      setQrcode(res.data.qr_code);
    };

    const submitDeposit = async () => {
      if (!selectedCurrency) {
        toast.error('Please select a currency');
        setError(true);
        return;
      }
      if (!token) {
        await calcCoinAmount();
      }
      setError(false);
      setLoading(true);
      const param: ISubmitCrypto = {
        symbol: selectedCurrency.symbol,
        amount,
      };
      if (bonus) param.bonusId = bonus;
      const res = await submitCryptoDeposit(param);
      setLoading(false);
      if (!res?.data) return;
      const { payment, coin } = res.data;
      setAddress(coin.address);
      setQrcode(coin.qr_code);

      setCreatedDate(payment.createdAt);
    };

    const calcCoinAmount = async () => {
      if (!selectedCurrency) {
        toast.error('Please select a currency');
        setError(true);
        return;
      }
      if (amount < 5) {
        toast.error('Min amount: 5');
        setError(true);
        return;
      }
      setError(false);
      setLoading(true);
      const param: ISubmitCrypto = {
        symbol: selectedCurrency.symbol,
        amount,
      };
      const res = await calcUsdtToCrypto(param);
      setLoading(false);
      if (!res?.data) return;
      setToken(res.data);
    };

    const getActive = async () => {
      if (!selectedCurrency) {
        return;
      }
      setLoading(true);
      const res = await getActivePayment(selectedCurrency.symbol);
      setLoading(false);
      if (!res?.data) return;
      const { payment, coin } = res.data;
      setAddress(coin.address);
      setQrcode(coin.qr_code);

      setCreatedDate(payment.createdAt);
      setToken({ crypto_amount: payment.amount, crypto_symbol: selectedCurrency?.symbol });
    };

    useEffect(() => {
      setAddress('');
      setQrcode('');
      setToken(null);
      getActive();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrency]);

    const coins = currencies.map((coin) => ({ ...coin, label: coin.name }));

    const renderGenerateAddress = (
      <Box
        sx={{
          p: 5,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          // bgcolor:'#264026',
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
          '&:hover': {
            filter: 'brightness(150%)',
          },
          ...(error && {
            color: 'error.main',
            borderColor: 'error.main',
            //  bgcolor:'#264026'
          }),
        }}
        onClick={handleGenerate}
      >
        <Stack spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap">
          <UploadIllustration sx={{ width: 1, maxWidth: 200 }} />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Generate new address </Typography>
          </Stack>
        </Stack>
      </Box>
    );

    const renderSubmit = (
      <>
        <TextField
          type="number"
          fullWidth
          label={`${t('Amount')} (${currency.symbol}) `}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={calcCoinAmount} edge="end">
                  <Box component="img" alt="currency" src={selectedCurrency?.icon} width={20} height={20} />
                  {/* <Iconify icon="solar:eye-bold" /> */}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {token && (
          <Alert
            variant="outlined"
            severity="info"
            sx={{
              mt: 1,
              borderStyle: 'dashed',
              borderColor: (theme) => theme.palette.info.main,
            }}
          >
            {`${token.crypto_amount}`}
            <Box component="img" alt="currency" src={selectedCurrency?.icon} width={20} height={20} ml={1} />
          </Alert>
        )}
        <Alert
          variant="outlined"
          severity="warning"
          sx={{
            mt: 1,
            borderStyle: 'dashed',
            borderColor: (theme) => theme.palette.warning.main,
          }}
        >
          Please enter the deposit amount.
          <br />
          You must deposit the exact amount within 10 minutes.
        </Alert>
        <AnimateButton>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="large"
            sx={{ mt: 1 }}
            onClick={submitDeposit}
          >
            {t('submit')}
          </Button>
        </AnimateButton>
      </>
    );

    const renderAddress = (
      <Stack
        sx={{
          py: 5,
          outline: 'none',
          borderRadius: 1,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          // bgcolor: '#264026',

          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
        }}
      >
        <Stack spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap">
          {token && createdDate && (
            <Alert
              variant="outlined"
              severity="info"
              sx={{
                width: 1,
                position: 'relative',
                borderStyle: 'dashed',
                borderColor: (theme) => theme.palette.info.main,
              }}
            >
              {`${token.crypto_amount}`}
              <Box component="img" alt="currency" src={selectedCurrency?.icon} width={20} height={20} ml={1} />

              <TimeComponent date={createdDate} />
            </Alert>
          )}
          <Image alt="qrcode" src={qrcode} width={150} height={150} />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                copy(address);
              }}
            >
              {address}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    );

    return (
      <div ref={ref} tabIndex={-1}>
        <Card
          sx={{
            position: 'absolute',
            width: { xs: 1, sm: 400, lg: 450 },
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CardHeader
            title={`${t('deposit')} Crypto`}
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
                        {`${option.name} (${option.symbol})`}
                        <Box component="img" alt="currency" src={option.icon} width={20} height={20} ml={1} />
                      </li>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    ...(loading && {
                      filter: 'blur(3px)',
                    }),
                  }}
                >
                  {(!selectedCurrency && renderGenerateAddress) ||
                    (address && qrcode ? renderAddress : renderSubmit)}
                  {/* {(address && qrcode) ? renderAddress : renderGenerateAddress} */}
                </Box>
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '55%',
                      left: '46%',
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    );
  }
);

export default DepositModal;

const TimeComponent = ({ date }: { date: string }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  const getTimeRemaining = (createdAt: string) => {
    const limitInSeconds = DEPOSIT_PENDING_TIME * 60; // 10 minutes * 60 seconds
    const createdAtTime = new Date(createdAt).getTime(); // Convert createdAt to milliseconds
    const now = new Date().getTime();
    const timeElapsed = Math.floor((now - createdAtTime) / 1000); // Time elapsed in seconds
    const timeLeft = Math.max(0, limitInSeconds - timeElapsed); // Ensure timeLeft is not negative

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    setTimeStr(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      getTimeRemaining(date);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [date]);

  return (
    <Typography
      sx={{
        right: 5,
        top: 15,
        color: 'error.main',
        position: 'absolute',
      }}
    >
      {timeStr}
    </Typography>
  );
};
