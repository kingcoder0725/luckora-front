import { forwardRef, useEffect, useState } from 'react';
import {
    Button,
    CardMedia,
    Divider,
    CardContent,
    CardActions,
    Grid,
    IconButton,
    Stack,
    Typography,
    CardProps,
    Checkbox,
    CircularProgress,
    Box,
    Card,
    CardHeader
} from '@mui/material';

import useApi from 'src/hooks/use-api';
import Iconify from 'src/components/iconify';
import { AnimateButton } from 'src/components/animate';
import { BalanceProps, CurrencyProps } from 'src/types';

interface Props extends CardProps {
    onClose: () => void;
    balances: BalanceProps[];
    getBalances: Function;
}

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const CurrencyListModal = forwardRef(({ balances, getBalances, onClose }: Props, ref: React.Ref<HTMLDivElement>) => {
    const { get_currencies, add_currencies } = useApi();
    const [loading, setLoading] = useState<number>(0);
    const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);

    const getCurrencies = async () => {
        setLoading(-1);
        const res = await get_currencies();
        setLoading(0);
        if (!res?.data) return;
        setCurrencies(res?.data);
    };

    const AddRemoveCurrency = async (currency: string, index: number) => {
        if (loading) return;
        setLoading(index + 1);
        const res = await add_currencies(currency);
        setTimeout(() => {
            setLoading(0);
        }, 1000);
        if (!res?.data) return;
        getBalances();
    };

    useEffect(() => {
        getCurrencies();
        // eslint-disable-next-line
    }, []);

    return (
        <div ref={ref} tabIndex={-1}>
            <Card
                sx={{
                    position: 'absolute',
                    width: { xs: 280, lg: 450 },
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    // bgcolor: '#264026',
                }}
            >
                <CardHeader
                    title="Currencies"
                    action={
                        <IconButton onClick={onClose} >
                            <Iconify icon="mdi:close" />
                        </IconButton>
                    }
                    sx={{ py: 2 }}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        {loading < 0 ? (
                            <Stack justifyContent="center" alignItems="center" width={1}>
                                <CircularProgress size={24} />
                            </Stack>
                        ) : currencies.map((item: CurrencyProps, key: number) => {
                            const checked = balances.some((e: BalanceProps) => e.currency?._id === item._id);
                            const isLoading = loading === key + 1;
                            const disabled = (balances.length === 1 && checked) || loading !== 0;
                            return (
                                <Grid item xs={12} key={key}>
                                    <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                                        <Grid item>
                                            <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                                                <CardMedia
                                                    component="img" alt="payment"
                                                    image={item.icon} title="payment" sx={{ width: 30 }} />
                                                <Stack>
                                                    <Typography className="h6">
                                                        {item.name}&nbsp;({item.symbol})
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>
                                        <Grid item>
                                            <Box sx={{ position: 'relative', width: '24px', height: '24px' }}>
                                                {isLoading && <CircularProgress size={24} />}
                                                <Checkbox
                                                    {...label}
                                                    sx={{
                                                        position: 'absolute',
                                                        transform: 'translate(-50%, -50%)',
                                                        top: '50%',
                                                        left: '50%',
                                                        p: 0
                                                    }}
                                                    checked={checked}
                                                    disabled={disabled}
                                                    onClick={() => AddRemoveCurrency(item._id, key)}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            );
                        })
                        }
                    </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                    <Grid spacing={2} container justifyContent="flex-end">
                        <Grid item>
                            <AnimateButton>
                                <Button variant="text" color="error" size="small" onClick={onClose} >
                                    Close
                                </Button>
                            </AnimateButton>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card>
        </div>
    );
});

export default CurrencyListModal;
