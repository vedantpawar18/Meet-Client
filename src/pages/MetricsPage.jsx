import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import api from '../api/axios';

export default function MetricsPage(){
  const [metrics, setMetrics] = React.useState(null);
  React.useEffect(()=>{ api.get('/admin/metrics').then(r=>setMetrics(r.data)).catch(()=>{}); },[]);
  if(!metrics) return <div>Loading metrics...</div>;
  return (
    <Box>
      <Typography variant="h4">Metrics</Typography>
      <Paper sx={{p:2,mt:2}}>
        <pre>{JSON.stringify(metrics, null, 2)}</pre>
      </Paper>
    </Box>
  );
}
