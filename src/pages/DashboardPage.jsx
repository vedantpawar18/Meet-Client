import React, { useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Avatar, useTheme
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchParcels } from '../features/parcels/parcelsSlice';
import { fetchDepartments } from '../features/departments/departmentsSlice';
import { useNavigate } from 'react-router-dom';
import InboxIcon from '@mui/icons-material/Inbox';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShieldIcon from '@mui/icons-material/Shield';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid, LabelList
} from 'recharts';

const COLORS = ['#4caf50', '#1976d2', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#cddc39'];

function MetricCard({ title, value, subtitle, icon, color, onClick }) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, boxShadow: 3, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const parcels = useSelector(s => s.parcels?.list ?? []);
  const loading = useSelector(s => s.parcels?.loading);
  const departments = useSelector(s => s.departments?.list ?? []);
  const deptLoading = useSelector(s => s.departments?.loading);

  useEffect(() => { dispatch(fetchParcels()); }, [dispatch]);
  useEffect(() => { if (!departments || departments.length === 0) dispatch(fetchDepartments()); }, [dispatch]);

  // Basic aggregates
  const totalParcels = parcels.length;
  const pendingInsurance = parcels.filter(p => p.insuranceApproval?.status === 'pending').length;
  const unassigned = parcels.filter(p => !p.assignedDepartment).length;

  // Dept counts map (id -> count) and name mapping
  const { deptCountsMap, deptList } = useMemo(() => {
    const map = {};
    const list = (departments || []).map(d => ({ id: d._id, name: d.name }));
    // init
    for (const d of list) map[d.id] = 0;
    for (const p of parcels) {
      let id = null;
      if (!p.assignedDepartment) {
        id = null;
      } else if (typeof p.assignedDepartment === 'string') {
        id = p.assignedDepartment;
      } else if (p.assignedDepartment._id) {
        id = p.assignedDepartment._id;
      } else {
        id = null;
      }
      if (id && map[id] !== undefined) map[id] += 1;
      else if (id) {
        // department might not be in list (fallback) - add with name placeholder
        map[id] = (map[id] || 0) + 1;
        list.push({ id, name: typeof p.assignedDepartment === 'string' ? p.assignedDepartment : (p.assignedDepartment.name || id) });
      }
    }
    return { deptCountsMap: map, deptList: list };
  }, [departments, parcels]);

  // 7 day series
  const last7DaysSeries = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const counts = days.map(() => 0);
    for (const p of parcels) {
      const dt = p.createdAt ? new Date(p.createdAt) : (p.updatedAt ? new Date(p.updatedAt) : null);
      if (!dt) continue;
      for (let i = 0; i < days.length; i++) {
        const start = days[i];
        const end = new Date(start); end.setHours(23, 59, 59, 999);
        if (dt >= start && dt <= end) { counts[i]++; break; }
      }
    }
    // map to chart format
    return days.map((d, i) => ({ date: `${d.getDate()}/${d.getMonth() + 1}`, count: counts[i] }));
  }, [parcels]);

  // pie data
  const pieData = useMemo(() => {
    const arr = deptList.map((d, idx) => ({ name: d.name, value: deptCountsMap[d.id] || 0, color: COLORS[idx % COLORS.length] }));
    // add unassigned slice
    if (unassigned > 0) arr.unshift({ name: 'Unassigned', value: unassigned, color: '#9e9e9e' });
    return arr.filter(a => a.value > 0);
  }, [deptList, deptCountsMap, unassigned]);

  // bar data (sorted descending)
  const barData = useMemo(() => {
    return deptList.map(d => ({ name: d.name, value: deptCountsMap[d.id] || 0 }))
      .sort((a, b) => b.value - a.value);
  }, [deptList, deptCountsMap]);

  function handleRefresh() {
    dispatch(fetchParcels());
    dispatch(fetchDepartments());
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/parcels')}>Open Parcels</Button>
        </Box>
      </Box>

      {(loading || deptLoading) && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}><CircularProgress size={20} /> <Typography>Loading data...</Typography></Box>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Total Parcels"
            value={totalParcels}
            subtitle="All parcels in the system"
            icon={<InboxIcon fontSize="large" />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/parcels')}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard
            title="Pending Insurance"
            value={pendingInsurance}
            subtitle="High-value parcels awaiting approval"
            icon={<ShieldIcon fontSize="large" />}
            color="#ff9800"
            onClick={() => navigate('/parcels?insurance=pending')}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <MetricCard
            title="Unassigned Parcels"
            value={unassigned}
            subtitle="Parcels waiting assignment"
            icon={<LocalShippingIcon fontSize="large" />}
            color="#9e9e9e"
            onClick={() => navigate('/parcels?assigned=false')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Arrivals — Last 7 days</Typography>
              <Box sx={{ height: 220, mt: 2 }}>
                {last7DaysSeries.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No data</Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7DaysSeries}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Distribution by Department</Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center', flexDirection: 'column' }}>
                {/* Chart area - constrain size so pie + legend never overflow */}
                <Box sx={{ width: '100%', maxWidth: 420, height: 220 }}>
                  {pieData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No data</Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* innerRadius/outerRadius reduced to keep the pie smaller */}
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={36}
                          outerRadius={64}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                        >
                          {pieData.map((entry, idx) => <Cell key={`c-${idx}`} fill={entry.color} />)}
                        </Pie>

                        {/* Move legend below using a custom wrapper (we'll render a simple legend ourselves) */}
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {/* Custom horizontal legend to avoid layout overflow */}
                <Box sx={{ width: '100%', maxWidth: 420, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                  {pieData.map((d, i) => (
                    <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'transparent', p: '4px 8px', borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <Box sx={{ width: 12, height: 12, background: d.color, borderRadius: 1 }} />
                      <Typography variant="body2">{d.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, ml: 1 }}>{d.value}</Typography>
                    </Box>
                  ))}
                </Box>

              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Parcels per Department</Typography>
              <Box sx={{ height: 220, mt: 1 }}>
                {barData.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No data</Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={barData} margin={{ left: 30, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={160} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4caf50">
                        <LabelList dataKey="value" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
