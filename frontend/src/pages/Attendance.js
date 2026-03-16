import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarPlus, Calendar, Check, X, Filter } from 'lucide-react';
import {
  attendanceService,
  employeeService,
  extractApiErrorMessage,
} from '../services/api';
import { Loading, EmptyState, ErrorMessage, Modal } from '../components';

function Attendance() {
  const [searchParams] = useSearchParams();
  const urlEmployee = searchParams.get('employee');

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // filters
  const [filterEmp, setFilterEmp] = useState(urlEmployee || '');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ employee_id: urlEmployee || '', date: today, status: 'Present' });
  const [formErrors, setFormErrors] = useState({});

  const loadEmployees = useCallback(async () => {
    try {
      const response = await employeeService.fetchAllEmployees();
      setEmployees(response.employees || []);
    } catch (e) { console.error(e); }
  }, []);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const queryParams = {};
      if (filterEmp) queryParams.employee_id = filterEmp;
      if (filterStart) queryParams.start_date = filterStart;
      if (filterEnd) queryParams.end_date = filterEnd;

      const response = await attendanceService.fetchAttendanceRecords(
        queryParams
      );
      setRecords(response.attendance || []);
    } catch (e) {
      setErr(extractApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filterEmp, filterStart, filterEnd]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);
  useEffect(() => { loadAttendance(); }, [loadAttendance]);
  useEffect(() => { if (urlEmployee) setFilterEmp(urlEmployee); }, [urlEmployee]);

  const validateForm = () => {
    const errors = {};

    if (!form.employee_id) errors.employee_id = 'Select employee';
    if (!form.date) errors.date = 'Required';
    if (!form.status) errors.status = 'Required';

    setFormErrors(errors);
    return !Object.keys(errors).length;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await attendanceService.createAttendanceRecord(form);
      setModalOpen(false);
      setForm({ employee_id: filterEmp || '', date: today, status: 'Present' });
      loadAttendance();
    } catch (e) {
      setFormErrors({ submit: handleApiError(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => { setFilterEmp(''); setFilterStart(''); setFilterEnd(''); };

  const openModal = () => {
    setForm({ employee_id: filterEmp || '', date: today, status: 'Present' });
    setFormErrors({});
    setModalOpen(true);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const getEmpName = (id) => employees.find(e => e.employee_id === id)?.full_name || id;

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length
  };

  if (loading && records.length === 0) return <Loading text="Loading attendance..." />;

  const hasFilters = filterEmp || filterStart || filterEnd;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance Management</h1>
        <p className="page-subtitle">Track employee attendance</p>
      </div>

      {err && <ErrorMessage message={err} onRetry={loadAttendance} />}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Calendar size={24} /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Check size={24} /></div>
          <div className="stat-value">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><X size={24} /></div>
          <div className="stat-value">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Calendar size={20} /> Attendance Records</h2>
          <button className="btn btn-primary" onClick={openModal} disabled={!employees.length}>
            <CalendarPlus size={18} /> Mark Attendance
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Employee</label>
            <select className="form-select" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
              <option value="">All</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>From</label>
            <input type="date" className="form-input" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input type="date" className="form-input" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
          </div>
          {hasFilters && (
            <button className="btn btn-secondary" onClick={clearFilters} style={{alignSelf:'flex-end'}}>
              <Filter size={16} /> Clear
            </button>
          )}
        </div>

        {!employees.length ? (
          <EmptyState icon={Calendar} title="No employees" message="Add employees first." />
        ) : !records.length ? (
          <EmptyState icon={Calendar} title="No records" 
            message={hasFilters ? "No records match filters." : "Start marking attendance."}
            action={<button className="btn btn-primary" onClick={openModal}><CalendarPlus size={18} /> Mark Attendance</button>} />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Date</th><th>Employee ID</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td><strong>{r.employee_id}</strong></td>
                    <td>{r.employee_name || getEmpName(r.employee_id)}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                        {r.status === 'Present' ? <><Check size={12} /> Present</> : <><X size={12} /> Absent</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Mark Attendance"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          {formErrors.submit && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{formErrors.submit}</div>}
          
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select name="employee_id" className={`form-select ${formErrors.employee_id?'error':''}`} value={form.employee_id} onChange={handleChange}>
              <option value="">Select...</option>
              {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
            </select>
            {formErrors.employee_id && <p className="form-error">{formErrors.employee_id}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" name="date" className={`form-input ${formErrors.date?'error':''}`} value={form.date} onChange={handleChange} />
              {formErrors.date && <p className="form-error">{formErrors.date}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select name="status" className={`form-select ${formErrors.status?'error':''}`} value={form.status} onChange={handleChange}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              {formErrors.status && <p className="form-error">{formErrors.status}</p>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Attendance;
