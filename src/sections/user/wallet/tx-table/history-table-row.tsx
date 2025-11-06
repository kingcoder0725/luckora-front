import moment from 'moment';
// @mui
import { Chip, IconButton, Stack, Tooltip, tooltipClasses, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
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
  headLabel: any[];
};

type StatusType = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export const getPaymentStatus = (params: TransactionsProps): StatusType => {
  if (params.ipn_type === 'withdrawal') {
    if (params.status === 1) return 'secondary';
    if (params.status === 2) return 'success';
    if (params.status === -1) return 'error';
  }
  if (params.ipn_type === 'deposit') {
    if (params.status === 1 || params.status === -3) return 'secondary';
    if (params.status === 100 || params.status === 3) return 'success';
    if (params.status === -1 || params.status === -4 || params.status === -5) return 'error';
  }
  return 'info';
};

// Map status_text when we need to show yellow for pending
const mapChipColor = (row: TransactionsProps): StatusType => {
  const base = getPaymentStatus(row);
  if (row.status_text?.toLowerCase() === 'pending') return 'warning';
  return base;
};

export default function HistoryTableRow({ row, headLabel }: Props) {
  const { copy } = useCopyToClipboard();

  moment.locale('en');

  const handleCopy = async (address: string) => {
    await copy(address);
  };

  const { _id, paymentId, currencyId, ipn_type, amount, updatedAt, status_text, address, status } =
    row;

  // Добавляем проверку наличия currencyId и его свойств
  const iconUrl = currencyId?.icon || '/path/to/default-icon.png'; // Замените путь на ваш значок по умолчанию
  const symbol = currencyId?.symbol || 'N/A'; // Используем "N/A", если символ отсутствует

  const label = fCurrency(ipn_type === 'deposit' ? amount : amount * -1, false);
  const actually_paid = row.actually_paid
    ? fCurrency(ipn_type === 'deposit' ? row.actually_paid : row.actually_paid * -1, false)
    : '0.00';
  // Use neutral/brand colors instead of green for amounts
  const color = ipn_type === 'deposit' ? 'warning' : 'error';

  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography
          sx={{
            width: headLabel[0]?.width || 'auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {paymentId || _id}
        </Typography>
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src={iconUrl} alt="C" sx={{ width: 22, height: 22 }} />
          {symbol}
        </Stack>
      </TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>{ipn_type}</TableCell>
      <TableCell>
        <Typography color={`${color}.main`}>{label}</Typography>
      </TableCell>
      <TableCell>
        <Typography color={`${amount <= row.actually_paid ? 'success' : 'error'}.main`}>
          {actually_paid}
        </Typography>
      </TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>
        <Chip
          variant="filled"
          label={status_text}
          sx={{ 
            height: 26,
            fontWeight: 'bold',
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
      </TableCell>
      <TableCell>{moment(updatedAt).format('MMM D, YYYY HH:MM')}</TableCell>
      <TableCell sx={{ pr: 3 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {!currencyId?.isFiat ? (
            <>
              <Tooltip
                title={address}
                arrow
                slotProps={{
                  popper: {
                    sx: {
                      [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                        {
                          marginTop: '0px',
                        },
                      [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                        {
                          marginBottom: '0px',
                        },
                      [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]:
                        {
                          marginLeft: '0px',
                        },
                      [`&.${tooltipClasses.popper}[data-popper-placement*="left"] .${tooltipClasses.tooltip}`]:
                        {
                          marginRight: '0px',
                        },
                    },
                  },
                }}
              >
                <Typography fontSize={14}>
                  {address?.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address}
                </Typography>
              </Tooltip>
              <AnimateButton>
                <IconButton size="small" onClick={() => handleCopy(address)}>
                  <Iconify icon="bitcoin-icons:copy-outline" sx={{ fontSize: '2rem' }} />
                </IconButton>
              </AnimateButton>
            </>
          ) : (
            'Fiat account'
          )}
          {/* 
          {ipn_type === 'withdrawal' && status === -2 && (
            <AnimateButton>
              <Button
                variant="contained"
                size="small"
                color="error"
              >
                {isloading === _id ? (
                  <CircularProgress size={16} color="success" />
                ) : (
                  <Iconify icon="mdi:close" sx={{ fontSize: '1rem' }} />
                )}
              </Button>
            </AnimateButton>
          )} */}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
