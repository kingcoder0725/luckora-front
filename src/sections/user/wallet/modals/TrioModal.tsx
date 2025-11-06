import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { Box, Button, Card, CardContent, CardHeader, IconButton, TextField, Typography, InputAdornment } from '@mui/material';
import Iconify from 'src/components/iconify';
import useApi from 'src/hooks/use-api';
import { useSnackbar } from 'notistack';

interface TrioModalProps {
  onClose: () => void;
}

const TrioModal = forwardRef(({ onClose }: TrioModalProps, ref: React.Ref<HTMLDivElement>) => {
  const { enqueueSnackbar } = useSnackbar();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);

  const [taxNumber, setTaxNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('+55');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const { checkTrioPaymentStatus, createTrioSession } = useApi();

  const initializeTrioCheckout = useCallback(async () => {
    try {
      const user = {
        tax_number: taxNumber,
        phone_number: phoneNumber,
        email,
        name,
      };

      const response = await createTrioSession(amount, user);

      console.log('createTrioSession response:', response);

      const newSessionId = response.data?.id;

      if (newSessionId) {
        setSessionId(newSessionId);
        // @ts-ignore
        if (window.Trio) {
          // @ts-ignore
          window.Trio.create({
            environment: 'sandbox',
            session: newSessionId,
            onSuccess: async (data: any) => {
              // try {
              //   // if player pay successfully , this function is calling?
              //   // const statusResponse = await checkTrioPaymentStatus(data);

              //   if (statusResponse && statusResponse.data) {
              //     if (statusResponse.data.status === 'success') {
              //       setPaymentStatus('Success');
              //       setStatusMessage('Reload the page.');
              //       enqueueSnackbar('Reload the page.', { variant: 'success' });
              //     } else if (statusResponse.data.status === 'canceled') {
              //       setPaymentStatus('Cancelled');
              //       setStatusMessage('Reload the page.');
              //       enqueueSnackbar('Reload the page.', { variant: 'warning' });
              //     } else {
              //       setStatusMessage('Reload the page.');
              //       enqueueSnackbar('Reload the page.', { variant: 'error' });
              //     }
              //   } else {
              //     setStatusMessage('Reload the page.');
              //     enqueueSnackbar('Reload the page.', { variant: 'error' });

              //   }

              //   setExternalId(data.external_id);
              // } catch (error) {
              //   setStatusMessage('Reload the page.');
              //   enqueueSnackbar('Reload the page.', { variant: 'error' });

              // }
            },
            onExit: async (data: any) => {


              try {
                const statusResponse = await checkTrioPaymentStatus(data);

                if (statusResponse && statusResponse.data) {
                  if (statusResponse.data.status === 'success') {
                    setPaymentStatus('Success');
                    setStatusMessage('Reload the page.');
                    enqueueSnackbar('Reload the page.', { variant: 'success' });
                  } else if (statusResponse.data.status === 'canceled') {
                    setPaymentStatus('Cancelled');
                    setStatusMessage('Reload the page.');
                    enqueueSnackbar('Reload the page.', { variant: 'warning' });
                  } else {
                    setStatusMessage('Reload the page.');
                    enqueueSnackbar('Reload the page.', { variant: 'error' });
                  }
                } else {
                  setStatusMessage('Reload the page.');
                  enqueueSnackbar('Reload the page.', { variant: 'error' });

                }

                setExternalId(data.external_id);

                onClose();
              } catch (error) {
                setStatusMessage('Reload the page.');
                enqueueSnackbar('Reload the page.', { variant: 'error' });

              }
            },
            onEvent: (event_type: string, data: any) => {

            },
            onLoad: () => {

            }
          });

          // @ts-ignore
          window.Trio.open();
        }
      } else {

        setStatusMessage('Reload the page.');
        enqueueSnackbar('Reload the page.', { variant: 'error' });
      }
    } catch (error) {

      setStatusMessage('Reload the page.');
      enqueueSnackbar('Reload the page.', { variant: 'error' });
    }
  }, [checkTrioPaymentStatus, createTrioSession, onClose, taxNumber, phoneNumber, email, name, amount, enqueueSnackbar]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.trio.com.br/checkout-js-sdk.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      if (window.Trio) {
        setStatusMessage('Ready for payment');
      } else {
        setStatusMessage('Failed to load Trio SDK. Please try again or reload the page.');
        enqueueSnackbar('Failed to load Trio SDK. Please try again or reload the page.', { variant: 'error' });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [enqueueSnackbar]);

  // Валидация имени на буквы
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
    }
  };

  // Валидация телефона, предотвращение удаления +55
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('+55') && /^[+0-9]*$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  return (
    <div ref={ref} tabIndex={-1}>
      <Card
        sx={{
          position: 'absolute',
          width: { xs: 280, lg: 350 },
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#264026',
        }}
      >
        <CardHeader
          title="Trio Payment"
          action={
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          }
          sx={{ py: 2 }}
        />
        <CardContent>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Tax Number"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              type="email" // Проверка на email
            />
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={handleNameChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              margin="normal"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">BRL</InputAdornment>, // Добавляем "BRL"
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={initializeTrioCheckout}
            >
              Deposit
            </Button>
          </Box>

          {paymentStatus && (
            <Typography variant="h6" sx={{ mt: 2 }}>
              Status: {paymentStatus}
            </Typography>
          )}
          {statusMessage && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {statusMessage}
            </Typography>
          )}
          {externalId && (
            <Typography variant="body1">
              External ID: {externalId}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default TrioModal;
