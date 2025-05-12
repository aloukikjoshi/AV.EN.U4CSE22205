import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Tooltip as MuiTooltip,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';

const CorrelationHeatmap = ({ correlationsData, tickers, onTickerHover }) => {
  const theme = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!correlationsData || !tickers || tickers.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No correlation data available</Typography>
      </Paper>
    );
  }

  // Color coding by correlation strength
  const getCorrelationColor = (value) => {
    if (value >= 0.7) return theme.palette.success.main;
    if (value >= 0.3) return theme.palette.success.light;
    if (value >= -0.3) return theme.palette.grey[300];
    if (value >= -0.7) return theme.palette.warning.light;
    return theme.palette.error.main;
  };

  const getTextColor = (bgColor) => {
    if (bgColor === theme.palette.grey[300] || bgColor === theme.palette.success.light || bgColor === theme.palette.warning.light) {
      return theme.palette.text.primary;
    }
    return theme.palette.common.white;
  };

  const handleCellHover = (i, j) => {
    setHoveredCell({ i, j });
    onTickerHover(tickers[i], tickers[j]);
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
    onTickerHover(null, null);
  };

  // Cell size based on number of tickers which is 2 otherwise error from backend
  const cellSize = 70;
  const fontSize = tickers.length > 6 ? '0.7rem' : '0.9rem';

  return (
    <Box sx={{ mt: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '700px'
        }}
      >
        {/* Heatmap header (top ticker row) */}
        <Box sx={{ display: 'flex', mb: 1, ml: cellSize }}>
          {tickers.map((ticker, i) => (
            <Box
              key={`header-${ticker}`}
              sx={{
                width: cellSize,
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                transform: 'rotate(-45deg)',
                transformOrigin: 'bottom left',
                position: 'relative',
                left: i * cellSize / 2,
                pl: 2,
              }}
            >
              <Typography variant="body2">{ticker}</Typography>
            </Box>
          ))}
        </Box>

        {/* Heatmap body */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {tickers.map((rowTicker, i) => (
            <Box key={`row-${rowTicker}`} sx={{ display: 'flex' }}>
              {/* Row label (left ticker column) */}
              <Box
                sx={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 2,
                  fontWeight: 'bold',
                }}
              >
                <Typography variant="body2">{rowTicker}</Typography>
              </Box>

              {/* Correlation cells */}
              {tickers.map((colTicker, j) => {
                // Correlation value from data using backend API
                const corrValue = correlationsData[i][j] || 0;
                const bgColor = getCorrelationColor(corrValue);
                const textColor = getTextColor(bgColor);
                const isHighlighted = hoveredCell && (hoveredCell.i === i || hoveredCell.j === j);

                return (
                  <MuiTooltip
                    key={`cell-${i}-${j}`}
                    title={
                      <Box>
                        <Typography variant="body2">
                          {rowTicker} & {colTicker}
                        </Typography>
                        <Typography variant="body2">
                          Correlation: {corrValue.toFixed(2)}
                        </Typography>
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: bgColor,
                        color: textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: fontSize,
                        cursor: 'pointer',
                        border: isHighlighted ? `2px solid ${theme.palette.primary.main}` : '1px solid white',
                        transition: 'all 0.2s',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.05)',
                        },
                      }}
                      onMouseEnter={() => handleCellHover(i, j)}
                      onMouseLeave={handleCellLeave}
                    >
                      {corrValue.toFixed(2)}
                    </Box>
                  </MuiTooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Color legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Correlation Legend</Typography>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  height: 20, 
                  width: 40, 
                  backgroundColor: theme.palette.error.main,
                  mr: 1
                }}></Box>
                <Typography variant="caption">Strong Negative<br/>(-1.0 to -0.7)</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  height: 20, 
                  width: 40, 
                  backgroundColor: theme.palette.warning.light,
                  mr: 1
                }}></Box>
                <Typography variant="caption">Moderate Negative<br/>(-0.7 to -0.3)</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  height: 20, 
                  width: 40, 
                  backgroundColor: theme.palette.grey[300],
                  mr: 1
                }}></Box>
                <Typography variant="caption">Weak Correlation<br/>(-0.3 to 0.3)</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  height: 20, 
                  width: 40, 
                  backgroundColor: theme.palette.success.light,
                  mr: 1
                }}></Box>
                <Typography variant="caption">Moderate Positive<br/>(0.3 to 0.7)</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  height: 20, 
                  width: 40, 
                  backgroundColor: theme.palette.success.main,
                  mr: 1
                }}></Box>
                <Typography variant="caption">Strong Positive<br/>(0.7 to 1.0)</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CorrelationHeatmap;
