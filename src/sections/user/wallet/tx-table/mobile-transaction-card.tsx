import moment from 'moment';
// @mui
import { 
  Box, 
  Stack, 
  Typography, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip,
  Divider
} from '@mui/material';
// types
import { TransactionsProps } from 'src/types';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
// components
import { fCurrency } from 'src/utils/format-number';
import { AnimateButton } from 'src/components/animate';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: TransactionsProps;
};

export default function MobileTransactionCard({ row }: Props) {
  const { copy } = useCopyToClipboard();

  moment.locale('en');

  const handleCopy = async (address: string) => {
    await copy(address);
  };

  const { _id, paymentId, currencyId, ipn_type, amount, updatedAt, status_text, address } = row;

  // Добавляем проверку наличия currencyId и его свойств
  const iconUrl = currencyId?.icon || '/path/to/default-icon.png';
  const symbol = currencyId?.symbol || 'N/A';

  const label = fCurrency(ipn_type === 'deposit' ? amount : amount * -1, false);
  const actually_paid = row.actually_paid
    ? fCurrency(ipn_type === 'deposit' ? row.actually_paid : row.actually_paid * -1, false)
    : '0.00';
  
  const color = ipn_type === 'deposit' ? 'warning' : 'error';

  return (
    <Box
      sx={{
        bgcolor: '#1A1D29',
        borderRadius: 2,
        p: 2,
        mb: 2,
        border: '1px solid rgba(255, 231, 26, 0.1)',
      }}
    >
      {/* ID */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          ID
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            fontSize: '12px',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {paymentId || _id}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Symbol */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Symbol
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src={iconUrl} alt="C" sx={{ width: 20, height: 20 }} />
          <Typography variant="body2">{symbol}</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Type */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Type
        </Typography>
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {ipn_type}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Amount */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Amount
        </Typography>
        <Typography variant="body2" color={`${color}.main`}>
          {label}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Actually Paid */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Actually Paid
        </Typography>
        <Typography 
          variant="body2" 
          color={`${amount <= row.actually_paid ? 'success' : 'error'}.main`}
        >
          {actually_paid}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Status */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Status
        </Typography>
        <Chip
          variant="filled"
          label={status_text}
          size="small"
          sx={{ 
            height: 24,
            fontWeight: 'bold',
            fontSize: '11px',
            ...(status_text?.toLowerCase() === 'pending' && {
              backgroundColor: '#FFE71A',
              color: '#000000',
            }),
            ...(status_text?.toLowerCase() === 'expired' && {
              backgroundColor: '#FF4444',
              color: '#FFFFFF',
            }),
            ...(status_text?.toLowerCase() === 'success' && {
              backgroundColor: '#4CAF50',
              color: '#FFFFFF',
            }),
            ...(status_text?.toLowerCase() === 'confirmed' && {
              backgroundColor: '#4CAF50',
              color: '#FFFFFF',
            }),
            ...(status_text?.toLowerCase() === 'canceled' && {
              backgroundColor: '#FF4444',
              color: '#FFFFFF',
            }),
          }}
        />
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Time */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Time
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '12px' }}>
          {moment(updatedAt).format('MMM D, YYYY HH:mm')}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255, 231, 26, 0.1)', my: 1 }} />

      {/* Address */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Address
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {!currencyId?.isFiat ? (
            <>
              <Tooltip title={address} arrow>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {address?.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address}
                </Typography>
              </Tooltip>
              <AnimateButton>
                <IconButton size="small" onClick={() => handleCopy(address)}>
                  <Iconify icon="bitcoin-icons:copy-outline" sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </AnimateButton>
            </>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              Fiat account
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}