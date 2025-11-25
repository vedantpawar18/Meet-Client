import React, { useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRules, createRule, updateRule, deleteRule } from '../features/rules/rulesSlice';
import { fetchDepartments } from '../features/departments/departmentsSlice';
import { showNotification } from '../features/notifications/notificationsSlice';

export default function RulesPage(){
  const dispatch = useDispatch();
  const { list } = useSelector(s=>s.rules);
  const departments = useSelector(s=>s.departments?.list || []);
  const [maxByDept, setMaxByDept] = React.useState({});

  useEffect(()=>{
    dispatch(fetchRules());
    if(!departments || departments.length===0) dispatch(fetchDepartments());
  },[dispatch]);

  // whenever departments or rules change, populate the maxByDept map
  useEffect(()=>{
    const map = {};
    // Prefer rules that have config.buckets (aggregate rule)
    const aggregate = (list || []).find(r=>Array.isArray(r.config?.buckets));
    if(aggregate){
      console.debug('RulesPage: found aggregate rule', aggregate._id, aggregate.name);
      for(const b of aggregate.config.buckets || []){
        const id = b.departmentId || b.department || b.deptId;
        if(!id) continue;
        // try to resolve the bucket id/name to an actual department _id so we can map consistently
        const found = (departments || []).find(d=> String(d._id) === String(id) || d.name === id);
        if(found){
          map[found._id] = (b.maxKg === null || b.maxKg === undefined) ? '' : b.maxKg;
        } else {
          // keep as-is (fallback) — will be normalized later when departments list is available
          map[id] = (b.maxKg === null || b.maxKg === undefined) ? '' : b.maxKg;
        }
      }
    }
    // fallback: individual rules that may have department or maxKg fields
    for(const r of list || []){
      // r.department might be an object or an id; some legacy rules are named "Weight rule - <Dept>"
      const dept = r.department;
      let key = null;
      if(dept){
        if(typeof dept === 'string'){
          const found = (departments || []).find(d=> d._id === dept || d.name === dept);
          key = found ? found._id : dept;
        } else if(dept._id){
          key = dept._id;
        } else if(dept.name){
          const found = (departments || []).find(d=> d.name === dept.name);
          key = found ? found._id : dept.name;
        }
      } else if(r.name && r.name.startsWith('Weight rule - ')){
        const deptName = r.name.replace('Weight rule - ','');
        const found = (departments || []).find(d=> d.name === deptName);
        key = found ? found._id : deptName;
      }
      if(key && (r.maxKg !== undefined)) map[key] = r.maxKg ?? '';
    }
    // ensure every department has an entry ('' if none)
    for(const d of departments || []){
      // normalize any entries that used department name or unresolved id to the real _id
      if(map[d.name] !== undefined && map[d._id] === undefined){
        map[d._id] = map[d.name];
        delete map[d.name];
      }
      // if there is an entry keyed by the literal id string, normalize it
      if(map[String(d._id)] !== undefined && map[d._id] === undefined){
        map[d._id] = map[String(d._id)];
        delete map[String(d._id)];
      }
      if(map[d._id] === undefined){
        map[d._id] = '';
      }
    }
    console.debug('RulesPage: computed maxByDept map', map);
    setMaxByDept(map);
  },[departments, list]);

  async function saveForDepartment(dept){
    try{
      const key = dept._id || dept.name;
      const val = maxByDept[key];
      const num = val === '' || val == null ? null : Number(val);
      // find aggregate rule (with buckets)
      const aggregate = (list || []).find(r=>Array.isArray(r.config?.buckets));
      if(aggregate){
        const buckets = Array.from(aggregate.config.buckets || []);
        const idx = buckets.findIndex(b=> (b.departmentId === dept._id || b.departmentId === dept.name || b.department === dept._id));
        if(idx !== -1){
          // replace
          buckets[idx] = { ...buckets[idx], maxKg: num };
        } else {
          buckets.push({ departmentId: dept._id, maxKg: num });
        }
        const payload = { name: aggregate.name || 'weight-based-routing', type: aggregate.type || 'weight', priority: aggregate.priority ?? 10, config: { buckets } };
        const res = await dispatch(updateRule({ id: aggregate._id, payload }));
        if(res.error) dispatch(showNotification({ message: res.payload?.message || 'Update failed', severity: 'error' })); else { dispatch(showNotification({ message: 'Saved', severity: 'success' })); dispatch(fetchRules()); }
      } else {
        // create aggregate rule containing this single bucket
        const payload = { name: 'weight-based-routing', type: 'weight', priority: 10, config: { buckets: [{ departmentId: dept._id, maxKg: num }] } };
        const res = await dispatch(createRule(payload));
        if(res.error) dispatch(showNotification({ message: res.payload?.message || 'Create failed', severity: 'error' })); else { dispatch(showNotification({ message: 'Saved', severity: 'success' })); dispatch(fetchRules()); }
      }
    }catch(e){ dispatch(showNotification({ message: 'Save failed', severity: 'error' })); }
  }

  async function saveAll(){
    // Build buckets from current inputs
    const buckets = [];
    for(const d of departments || []){
      const key = d._id || d.name;
      const val = maxByDept[key];
      const num = val === '' || val == null ? null : Number(val);
      buckets.push({ departmentId: d._id, maxKg: num });
    }
    // find aggregate
    const aggregate = (list || []).find(r=>Array.isArray(r.config?.buckets));
    if(aggregate){
      const payload = { name: aggregate.name || 'weight-based-routing', type: aggregate.type || 'weight', priority: aggregate.priority ?? 10, config: { buckets } };
      const res = await dispatch(updateRule({ id: aggregate._id, payload }));
      if(res.error) dispatch(showNotification({ message: res.payload?.message || 'Update failed', severity: 'error' })); else dispatch(showNotification({ message: 'Saved', severity: 'success' }));
    } else {
      const payload = { name: 'weight-based-routing', type: 'weight', priority: 10, config: { buckets } };
      const res = await dispatch(createRule(payload));
      if(res.error) dispatch(showNotification({ message: res.payload?.message || 'Create failed', severity: 'error' })); else dispatch(showNotification({ message: 'Saved', severity: 'success' }));
    }
    dispatch(fetchRules());
  }
  const user = useSelector(s=>s.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Rules</Typography>
      {user?.role==='admin' && (
        <Paper sx={{p:2,mb:2}}>
          <Typography variant="h6">Department rules (set Max KG per department)</Typography>
          <Box sx={{display:'flex',justifyContent:'flex-end',mt:1}}>
            <Button variant="contained" onClick={saveAll}>Save</Button>
          </Box>
        </Paper>
      )}

      {(departments || []).map(d=>{
        const key = d._id || d.name;
        return (
          <Paper key={key} sx={{p:2,mb:1}}>
            <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>{d.name}</strong>
              {user?.role==='admin' && (
                <Box>
                  <Button color="error" onClick={async ()=>{ // delete rule/bucket if exists
                    if(!window.confirm('Delete rule for this department?')) return;
                    // prefer removing bucket from aggregate
                    const aggregate = (list || []).find(r=>Array.isArray(r.config?.buckets));
                    if(aggregate){
                      const buckets = (aggregate.config.buckets || []).filter(b=> String(b.departmentId) !== String(d._id) && b.departmentId !== d.name);
                      const payload = { name: aggregate.name || 'weight-based-routing', type: aggregate.type || 'weight', priority: aggregate.priority ?? 10, config: { buckets } };
                      const res = await dispatch(updateRule({ id: aggregate._id, payload }));
                      if(res.error){ dispatch(showNotification({ message: res.payload?.message||'Failed', severity: 'error' })); return; }
                      dispatch(fetchRules());
                      return;
                    }
                    // fallback: delete individual rule that references this dept
                    const existing = (list || []).find(r=>{
                      const dd = r.department; return dd && (dd._id===d._id || dd===d._id || dd.name===d.name || dd===d.name);
                    });
                    if(!existing){ dispatch(showNotification({ message: 'No rule to delete', severity: 'warning' })); return; }
                    const res = await dispatch(deleteRule(existing._id)); if(res.error) dispatch(showNotification({ message: res.payload?.message||'Failed', severity: 'error' })); else dispatch(fetchRules());
                  }}>Delete</Button>
                </Box>
              )}
            </Box>
            <Box sx={{mt:1,display:'flex',gap:2,alignItems:'center'}}>
              <TextField label="Max KG" value={maxByDept[key] ?? ''} onChange={e=>{ setMaxByDept(prev=>({ ...prev, [key]: e.target.value })); }} sx={{width:160}} />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
