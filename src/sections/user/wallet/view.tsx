import { useEffect, useState, useCallback, Fragment } from 'react';
import { useLocation } from 'react-router';
import toast from 'react-hot-toast';
// @mui
import {
  Grid,
  Card,
  Button,
  CardContent,
  Stack,
  Modal,
  Box,
  Typography,
  Alert,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Container from '@mui/material/Container';
// hooks
import { useSelector } from 'src/store';
import useApi from 'src/hooks/use-api';
import { useLocales } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { AnimateButton } from 'src/components/animate';
import { BalanceProps, TransactionsProps, ICryptoCurrency } from 'src/types';
import DepositModal from './modals/deposit';
import Transactions from './transactions';
import Balances from './balances';
import SelectModal from './modals/select';
import OmnoModal from './modals/OmnoModal';
import WithdrawModal from './modals/withdraw';
import DepositOptions from './deposit-options';

export default function WalletView() {
  const { t } = useLocales();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bonus = queryParams.get('bonus');

  const settings = useSettingsContext();
  const { get_currencies, get_balances, get_fiat_currencies, verify_password, get_transactions } =
    useApi();
  const { balance, activeBonus } = useSelector((store) => store.auth);

  const selectOpen = useBoolean();
  const withdrawOpen = useBoolean();
  const confirm = useBoolean(false);
  const cancelBonus = useBoolean(false);
  const [password, setPassword] = useState<string>('');

  // const exchangeOpen = useBoolean();
  // const providerOpen = useBoolean();
  // const fiatDepositOpen = useBoolean();
  // const trioOpen = useBoolean(); // Define trioOpen state
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionsProps[]>([]);
  const [cryptoCurrencies, setCryptoCurrencies] = useState<ICryptoCurrency[]>([]);
  const [balances, setBalances] = useState<BalanceProps[]>([]);
  // const [fiatCurrencies, setFiatCurrencies] = useState<CurrencyPropsFiat[]>([]);

  const getBalances = useCallback(async () => {
    setLoading(true);
    const res = await get_balances();
    setLoading(false);
    if (!res?.data) return;
    setBalances(res?.data);
  }, [get_balances]);

  const getCurrencies = useCallback(async () => {
    setLoading(true);
    const res = await get_currencies();
    setLoading(false);
    if (!res?.data) return;
    setCryptoCurrencies(res?.data);
  }, [get_currencies]);

  const getTransactions = useCallback(async () => {
    setLoading(true);
    const res = await get_transactions();
    setLoading(false);
    if (!res?.data) return;
    const data = res.data.map((row: TransactionsProps) => ({
      ...row,
      symbol: row.currencyId?.symbol || 'N/A',
    }));

    setTransactions(data);
  }, [get_transactions]);

  // const getFiatCurrencies = useCallback(async () => {
  //   const res = await get_fiat_currencies();
  //   if (!res?.data) return;
  //   setFiatCurrencies(res?.data);
  // }, [get_fiat_currencies]);

  useEffect(() => {
    // getFiatCurrencies();
    getBalances();
    getCurrencies();
    getTransactions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (bonus) selectOpen.onTrue();
    // eslint-disable-next-line
  }, [bonus]);

  const openWithdraw = () => {
    if (activeBonus) {
      confirm.onTrue();
      return;
    }
    withdrawOpen.onTrue();
  };

  const verifyPassword = async () => {
    if (!password) return;
    setLoading(true);
    const res = await verify_password(password);
    setLoading(false);
    if (!res?.data) return;
    toast.success('success');
    withdrawOpen.onTrue();
    if (confirm.value) confirm.onFalse();
  };

  return (
    <Container maxWidth={false} sx={{ px: 0 }}>
      <CustomBreadcrumbs
        heading={t('wallet')}
        links={[{ name: t('user') }, { name: t('wallet') }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />


      <Card sx={{ bgcolor: '#2B2F3D' }}>
        <CardContent sx={{ p: { xs: 1 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Balances balances={balances} getBalances={getBalances} onDeposit={selectOpen.onTrue} onWithdraw={openWithdraw} />
            </Grid>

            <Grid item xs={12}>
              <Transactions transactions={transactions} loading={loading} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* <Modal open={exchangeOpen.value} onClose={exchangeOpen.onFalse}>
        <ExchangeModal
          currencies={currencies}
          balances={balances}
          getBalances={getBalances}
          getTransactions={getTransactions}
          onClose={exchangeOpen.onFalse}
        />
      </Modal> */}
      <Modal
        open={selectOpen.value}
        onClose={selectOpen.onFalse}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
          },
        }}
        sx={{
          '& .MuiModal-root': {
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DepositOptions
          isWallet
          balances={balances}
          cryptoCurrencies={cryptoCurrencies}
          onClose={selectOpen.onFalse}
        />
      </Modal>

      {/* <Modal open={providerOpen.value} onClose={providerOpen.onFalse}>
        <ProviderSelectionModal
          onFiat={fiatDepositOpen.onTrue}
          onTrio={trioOpen.onTrue} // Pass onTrio handler
          onClose={providerOpen.onFalse}
        />
      </Modal>
     
      <Modal open={fiatDepositOpen.value} onClose={fiatDepositOpen.onFalse}>
        <FiatSelectionModal
          currencies={fiatCurrencies} // Убедитесь, что передаётся полный список валют
          onClose={fiatDepositOpen.onFalse}
        />
      </Modal>

      <Modal open={trioOpen.value} onClose={trioOpen.onFalse}>
        <TrioModal
          onClose={trioOpen.onFalse}
        />
      </Modal> */}
      <Modal open={withdrawOpen.value} onClose={withdrawOpen.onFalse}>
        <WithdrawModal
          currencies={cryptoCurrencies}
          getTransactions={getTransactions}
          onClose={withdrawOpen.onFalse}
        />
      </Modal>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={
          <Typography variant="h4" sx={{ textTransform: 'uppercase' }}>
            {t('active')}
          </Typography>
        }
        content={
          <>
            <Typography>
              {t('cancel_bonus_wd_desc')
                .split('<br/>')
                .map((text, ind) => (
                  <Fragment key={ind}>
                    {text}
                    <br />
                  </Fragment>
                ))}
            </Typography>
            {cancelBonus.value && (
              <>
                <Alert
                  variant="outlined"
                  severity="warning"
                  sx={{
                    my: 2,
                    borderStyle: 'dashed',
                    borderColor: (theme) => theme.palette.warning.main,
                  }}
                >
                  {t('cancel_bonus_wd_warning')
                    .split('<br/>')
                    .map((text, ind) => (
                      <Fragment key={ind}>
                        {text}
                        <br />
                      </Fragment>
                    ))}
                </Alert>
                <TextField
                  type="password"
                  variant="outlined"
                  label={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </>
            )}
          </>
        }
        action={
          !cancelBonus.value ? (
            <Button variant="contained" color="error" onClick={cancelBonus.onTrue}>
              {t('agree')}
            </Button>
          ) : (
            <LoadingButton
              variant="contained"
              color="success"
              loading={loading}
              disabled={!password}
              onClick={verifyPassword}
            >
              {t('verify')}
            </LoadingButton>
          )
        }
      />
    </Container>
  );
}
