import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Paper, TableContainer, IconButton, TextField, TableSortLabel, Pagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParcels, approveInsurance, deleteParcel, deleteAllParcels } from '../features/parcels/parcelsSlice';
import { showNotification } from '../features/notifications/notificationsSlice';
import { exportParcels } from '../features/parcels/parcelsExtra';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

export default function ParcelsPage(){
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s=>s.parcels);
  const user = useSelector(s=>s.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [q, setQ] = React.useState('');
  const [approvalFilter, setApprovalFilter] = React.useState('all'); // 'all', 'pending', 'unassigned'
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [specificDate, setSpecificDate] = React.useState(''); // for selecting a specific day
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState('desc');
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  React.useEffect(()=>{
    const params = new URLSearchParams(location.search);
    const dept = params.get('dept');
    const qParam = params.get('q');
    const insurance = params.get('insurance');
    const assigned = params.get('assigned');
    const approval = params.get('approval') || 'all';
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const specific = params.get('specific') || '';
    
    setApprovalFilter(approval);
    setFromDate(from);
    setToDate(to);
    setSpecificDate(specific);
    setQ(qParam || '');
    
    const payload = {};
    if(dept) payload.departmentId = dept;
    if(qParam) payload.q = qParam;
    if(insurance) payload.insurance = insurance;
    if(assigned !== null) payload.assigned = assigned;
    if(from) payload.from = from;
    if(to) payload.to = to;
    if(specific) payload.specific = specific;
    dispatch(fetchParcels(payload));
  },[dispatch, location.search]);
  // parse filters from URL for client-side filtering fallback
  const urlFilters = React.useMemo(()=>{
    const params = new URLSearchParams(location.search);
    return {
      dept: params.get('dept'),
      insurance: params.get('insurance'),
      assigned: params.get('assigned'),
      q: params.get('q'),
      approval: params.get('approval') || 'all',
      from: params.get('from'),
      to: params.get('to'),
      specific: params.get('specific'),
    };
  },[location.search]);
  // reset page when filters change
  React.useEffect(()=>{ setPage(1); },[urlFilters]);
  async function refresh(){
    const params = new URLSearchParams(location.search);
    const dept = params.get('dept');
    const qParam = params.get('q');
    const insurance = params.get('insurance');
    const assigned = params.get('assigned');
    const from = params.get('from');
    const to = params.get('to');
    const specific = params.get('specific');
    const payload = {};
    if(dept) payload.departmentId = dept;
    if(qParam) payload.q = qParam;
    if(insurance) payload.insurance = insurance;
    if(assigned !== null) payload.assigned = assigned;
    if(from) payload.from = from;
    if(to) payload.to = to;
    if(specific) payload.specific = specific;
    dispatch(fetchParcels(payload));
  }
  
  function handleSearch(){
    const params = new URLSearchParams(location.search);
    if(q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    navigate(`/parcels?${params.toString()}`);
  }
  
  function handleClearSearch(){
    setQ('');
    const params = new URLSearchParams(location.search);
    params.delete('q');
    navigate(`/parcels?${params.toString()}`);
  }
  
  function handleApprovalFilterChange(value){
    setApprovalFilter(value);
    const params = new URLSearchParams(location.search);
    if(value === 'all'){
      params.delete('approval');
    } else {
      params.set('approval', value);
    }
    navigate(`/parcels?${params.toString()}`);
  }
  
  function handleDateFilterChange(type, value){
    const params = new URLSearchParams(location.search);
    if(type === 'from'){
      setFromDate(value);
      if(value) params.set('from', value);
      else params.delete('from');
    } else if(type === 'to'){
      setToDate(value);
      if(value) params.set('to', value);
      else params.delete('to');
    } else if(type === 'specific'){
      setSpecificDate(value);
      if(value) {
        params.set('specific', value);
        params.delete('from');
        params.delete('to');
        setFromDate('');
        setToDate('');
      } else {
        params.delete('specific');
      }
    }
    navigate(`/parcels?${params.toString()}`);
  }
  
  function handleClearDates(){
    setFromDate('');
    setToDate('');
    setSpecificDate('');
    const params = new URLSearchParams(location.search);
    params.delete('from');
    params.delete('to');
    params.delete('specific');
    navigate(`/parcels?${params.toString()}`);
  }
  
  async function doApprove(id){ await dispatch(approveInsurance(id)); }
  async function doDelete(id){
    if(!window.confirm('Delete this parcel? This action cannot be undone.')) return;
    const res = await dispatch(deleteParcel(id));
    if(res.error){ dispatch(showNotification({ message: res.payload?.message || 'Delete failed', severity: 'error' })); return; }
    await dispatch(fetchParcels());
  }
  async function doDeleteAll(){
    if(!window.confirm('Delete ALL parcels? This will remove all parcels permanently. Continue?')) return;
    const res = await dispatch(deleteAllParcels());
    if(res.error){ dispatch(showNotification({ message: res.payload?.message || 'Delete all failed', severity: 'error' })); return; }
    await dispatch(fetchParcels());
  }
  function handleSort(field){
    if(sortBy === field){
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }
  // apply client-side filters (fallback) then sort
  const filteredList = React.useMemo(()=>{
    const arr = Array.isArray(list) ? [...list] : [];
    const { dept, insurance, assigned, q: qParam, approval, from, to, specific } = urlFilters;
    return arr.filter(p=>{
      if(dept){
        const d = p.assignedDepartment;
        const id = typeof d === 'string' ? d : d?._id;
        const name = typeof d === 'string' ? d : d?.name;
        if(!(String(id) === String(dept) || String(name) === String(dept))) return false;
      }
      if(insurance){
        if((p.insuranceApproval?.status || '') !== insurance) return false;
      }
      if(assigned !== null && assigned !== undefined){
        if(assigned === 'false'){
          if(p.assignedDepartment) return false;
        } else if(assigned === 'true'){
          if(!p.assignedDepartment) return false;
        }
      }
      if(qParam){
        const ql = qParam.toLowerCase();
        if(!( (p.trackingId||'').toLowerCase().includes(ql) || (p.destination||'').toLowerCase().includes(ql) )) return false;
      }
      if(approval === 'pending'){
        if((p.insuranceApproval?.status || '') !== 'pending') return false;
      } else if(approval === 'unassigned'){
        if(p.assignedDepartment) return false;
      }
      if(from){
        const fromTime = new Date(from).getTime();
        const pTime = new Date(p.createdAt || p.updatedAt || 0).getTime();
        if(pTime < fromTime) return false;
      }
      if(to){
        const toTime = new Date(to).getTime();
        const pTime = new Date(p.createdAt || p.updatedAt || 0).getTime();
        if(pTime > toTime) return false;
      }
      if(specific){
        const specificDate = new Date(specific);
        const specificStart = new Date(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate()).getTime();
        const specificEnd = specificStart + 24 * 60 * 60 * 1000 - 1;
        const pTime = new Date(p.createdAt || p.updatedAt || 0).getTime();
        if(pTime < specificStart || pTime > specificEnd) return false;
      }
      return true;
    });
  },[list, urlFilters]);

  const sortedList = React.useMemo(()=>{
    const arr = Array.isArray(filteredList) ? [...filteredList] : [];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a,b)=>{
      try{
        if(sortBy === 'trackingId' || sortBy === 'destination' || sortBy === 'assignedDepartment'){
          const aa = (sortBy==='assignedDepartment' ? (a.assignedDepartment?.name || '') : (a[sortBy] || ''))?.toString() || '';
          const bb = (sortBy==='assignedDepartment' ? (b.assignedDepartment?.name || '') : (b[sortBy] || ''))?.toString() || '';
          return aa.localeCompare(bb) * dir;
        }
        if(sortBy === 'weightKg' || sortBy === 'valueEur'){
          const aa = Number(a[sortBy] ?? 0);
          const bb = Number(b[sortBy] ?? 0);
          return (aa - bb) * dir;
        }
        if(sortBy === 'createdAt'){
          const aa = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const bb = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return (aa - bb) * dir;
        }
        return 0;
      }catch(e){ return 0; }
    });
    return arr;
  },[filteredList, sortBy, sortDir]);
  const total = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pagedList = React.useMemo(()=>{
    const start = (page - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  },[sortedList, page]);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Parcels</Typography>
      
      {/* Filters & Search Row 1 */}
      <Box sx={{display:'flex',gap:2,mb:2,alignItems:'center',flexWrap:'wrap'}}>
        <TextField 
          placeholder="Search by tracking ID" 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
          onKeyDown={e=>{ if(e.key==='Enter') handleSearch(); }}
          sx={{flex:1,minWidth:200}}
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
        {q && <IconButton size="small" onClick={handleClearSearch} title="Clear search"><ClearIcon/></IconButton>}
        
        <FormControl sx={{minWidth:180}}>
          <InputLabel>Approval Status</InputLabel>
          <Select value={approvalFilter} onChange={e=>handleApprovalFilterChange(e.target.value)} label="Approval Status">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Approval Required</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Filters & Search Row 2 */}
      <Box sx={{display:'flex',gap:2,mb:2,alignItems:'center',flexWrap:'wrap'}}>
        <TextField 
          label="From Date" 
          type="date" 
          value={fromDate} 
          onChange={e=>handleDateFilterChange('from', e.target.value)}
          InputLabelProps={{shrink: true}}
          sx={{width:180}}
          disabled={!!specificDate}
        />
        <TextField 
          label="To Date" 
          type="date" 
          value={toDate} 
          onChange={e=>handleDateFilterChange('to', e.target.value)}
          InputLabelProps={{shrink: true}}
          sx={{width:180}}
          disabled={!!specificDate}
        />
        <TextField 
          label="Specific Date" 
          type="date" 
          value={specificDate} 
          onChange={e=>handleDateFilterChange('specific', e.target.value)}
          InputLabelProps={{shrink: true}}
          sx={{width:180}}
        />
        {(fromDate || toDate || specificDate) && <IconButton onClick={handleClearDates} title="Clear dates"><ClearIcon/></IconButton>}
        <IconButton onClick={refresh} title="Refresh"><RefreshIcon/></IconButton>
        {user?.role==='admin' && (
          <Button color="error" startIcon={<DeleteIcon/>} onClick={doDeleteAll}>Delete All</Button>
        )}
      </Box>
      
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortBy==='trackingId' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='trackingId'} direction={sortBy==='trackingId' ? sortDir : 'asc'} onClick={()=>handleSort('trackingId')}>Tracking</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy==='weightKg' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='weightKg'} direction={sortBy==='weightKg' ? sortDir : 'asc'} onClick={()=>handleSort('weightKg')}>Weight</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy==='valueEur' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='valueEur'} direction={sortBy==='valueEur' ? sortDir : 'asc'} onClick={()=>handleSort('valueEur')}>Value</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy==='destination' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='destination'} direction={sortBy==='destination' ? sortDir : 'asc'} onClick={()=>handleSort('destination')}>Destination</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy==='createdAt' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='createdAt'} direction={sortBy==='createdAt' ? sortDir : 'asc'} onClick={()=>handleSort('createdAt')}>Received At</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortBy==='assignedDepartment' ? sortDir : false}>
                  <TableSortLabel active={sortBy==='assignedDepartment'} direction={sortBy==='assignedDepartment' ? sortDir : 'asc'} onClick={()=>handleSort('assignedDepartment')}>Dept</TableSortLabel>
                </TableCell>
                <TableCell>Approval</TableCell>
                {user?.role==='admin' && <TableCell>Delete</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedList.map(p=> (
                <TableRow 
                  key={p._id} 
                  hover
                  sx={{
                    backgroundColor: (p.insuranceApproval?.status === 'pending') ? 'rgba(244, 67, 54, 0.08)' : 'inherit',
                    '&:hover': {
                      backgroundColor: (p.insuranceApproval?.status === 'pending') ? 'rgba(244, 67, 54, 0.16)' : undefined,
                    }
                  }}
                >
                  <TableCell><Link to={`/parcels/${p._id}`}>{p.trackingId}</Link></TableCell>
                  <TableCell>{p.weightKg}</TableCell>
                  <TableCell>{p.valueEur}</TableCell>
                  <TableCell>{p.destination || '-'}</TableCell>
                  <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleString() : (p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-')}</TableCell>
                  <TableCell>{p.assignedDepartment?.name || p.assignedDepartment || '-'}</TableCell>
                  <TableCell>
                    {p.insuranceApproval?.status==='pending' && user?.role==='insurance' ? <Button onClick={()=>doApprove(p._id)}>Approve</Button> : (p.insuranceApproval?.status === 'pending' ? 'Yet to be approved' : (p.insuranceApproval?.status || '-'))}
                  </TableCell>
                  {user?.role==='admin' && (
                    <TableCell>
                      <IconButton color="error" size="small" onClick={()=>doDelete(p._id)}><DeleteIcon/></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{display:'flex',alignItems:'center',justifyContent:'space-between',mt:2}}>
        <Typography variant="body2">Showing {Math.min((page-1)*pageSize+1, total)}-{Math.min(page*pageSize, total)} of {total}</Typography>
        <Pagination count={totalPages} page={page} onChange={(e,val)=>setPage(val)} color="primary" />
      </Box>
    </Box>
  );
}
