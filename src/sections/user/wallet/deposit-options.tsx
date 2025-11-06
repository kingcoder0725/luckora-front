import { useEffect, useState, useCallback, forwardRef } from 'react';
// @mui
import { Box, Modal } from '@mui/material';
// hooks
import useApi from 'src/hooks/use-api';
import { useLocales } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { BalanceProps, ICryptoCurrency } from 'src/types';
import DepositModal from './modals/deposit';
import SelectModal from './modals/select';
import OmnoModal from './modals/OmnoModal';

interface Props {
  onClose: () => void;
  isWallet: boolean;
  balances?: BalanceProps[];
  cryptoCurrencies?: ICryptoCurrency[];
}

const DepositOptions = forwardRef((props: Props, ref) => {
  const { onClose, isWallet, balances, cryptoCurrencies } = props;

  const { get_currencies, get_balances } = useApi();

  const cryptoOpen = useBoolean();
  const omnoOpen = useBoolean();

  const [loading, setLoading] = useState<boolean>(false);
  const [isCard, setIsCard] = useState<boolean>(false);
  const [_cryptoCurrencies, setCryptoCurrencies] = useState<ICryptoCurrency[]>(
    cryptoCurrencies || []
  );
  // const [_balances, setBalances] = useState<BalanceProps[]>(balances || []);

  const getCurrencies = async () => {
    setLoading(true);
    const res = await get_currencies();
    setLoading(false);
    if (!res?.data) return;
    setCryptoCurrencies(res?.data);
  };

  // const getBalances = async () => {
  //   setLoading(true);
  //   const res = await get_balances();
  //   setLoading(false);
  //   if (!res?.data) return;
  //   setBalances(res?.data);
  // };

  const onFiat = (type: string) => {
    omnoOpen.onTrue();
    if (type === 'card') setIsCard(true);
  };

  useEffect(() => {
    // if (isWallet) return;
    // getBalances();
    getCurrencies();
    // eslint-disable-next-line
  }, []);
  console.log('🚀 ~ useEffect ~ isWallet:', isWallet);

  return (
    <Box ref={ref}>
      <SelectModal
        sx={{ bgcolor: '#2B2F3D' }}
        onCrypto={cryptoOpen.onTrue}
        // onFiat={providerOpen.onTrue}
        onFiat={onFiat}
        onClose={onClose}
      />
      <Modal
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
        open={cryptoOpen.value}
        onClose={cryptoOpen.onFalse}
      >
        <DepositModal currencies={_cryptoCurrencies} onClose={cryptoOpen.onFalse} />
      </Modal>

      <Modal
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
        open={omnoOpen.value}
        onClose={omnoOpen.onFalse}
      >
        <OmnoModal isCard={isCard} onClose={omnoOpen.onFalse} />
      </Modal>
    </Box>
  );
});

export default DepositOptions;
