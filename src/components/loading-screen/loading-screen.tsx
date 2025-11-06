// @mui
import Box, { BoxProps } from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

// ----------------------------------------------------------------------

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 231, 26, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 20px rgba(255, 231, 26, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 231, 26, 0);
  }
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const waveAnimation = keyframes`
  0%, 40%, 100% {
    transform: scaleY(0.4);
    background-color: #FFE71A;
  }
  20% {
    transform: scaleY(1);
    background-color: #FFF04D;
  }
`;

export default function LoadingScreen({ sx, ...other }: BoxProps) {
  return (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #2B2F3D 0%, #1A1D29 100%)',
        ...sx,
      }}
      {...other}
    >
      {/* Пульсирующий главный индикатор */}
      <Box
        sx={{
          position: 'relative',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #FFE71A, #FFF04D)',
          animation: `${pulseAnimation} 2s infinite`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            borderRadius: '50%',
            border: '3px solid #FFE71A',
            animation: `${spinAnimation} 3s linear infinite`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -20,
            left: -20,
            right: -20,
            bottom: -20,
            borderRadius: '50%',
            border: '2px dashed #FFE71A',
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            animation: `${spinAnimation} 4s linear infinite reverse`,
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#1A1D29',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FFE71A',
          }}
        >
          ⚡
        </Box>
      </Box>

      {/* Волновая анимация снизу */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          height: 40,
          gap: 0.5,
        }}
      >
        {[...Array(8)].map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 4,
              height: 30,
              borderRadius: 2,
              animation: `${waveAnimation} 1.2s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </Box>

      {/* Текст загрузки */}
      <Box
        sx={{
          mt: 2,
          color: '#FFE71A',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        LOADING...
      </Box>
    </Box>
  );
}
