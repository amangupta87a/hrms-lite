import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeeService, extractApiErrorMessage } from '../services/api';
import {
  Loading,
  EmptyState,
  ErrorMessage,
  Modal,
  ConfirmDialog,
} from '../components';

const DEPARTMENTS = [
  'Engineering', 'Human Resources', 'Marketing', 'Sales', 
  'Finance', 'Operations', 'Product', 'Design', 'Customer Support', 'Legal'
];

const initialFormState = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
};

function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeService.fetchAllEmployees();
      setEmployees(response.employees || []);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const validateForm = () => {
    const validationErrors = {};

    if (!form.employee_id.trim()) validationErrors.employee_id = 'Required';

    if (!form.full_name.trim()) validationErrors.full_name = 'Required';
    else if (form.full_name.length < 2)
      validationErrors.full_name = 'Too short';

    if (!form.email.trim()) validationErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      validationErrors.email = 'Invalid email';

    if (!form.department) validationErrors.department = 'Required';

    setFormErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      await employeeService.createEmployee(form);
      setModalOpen(false);
      setForm(initialFormState);
      loadEmployees();
    } catch (err) {
      setFormErrors({ submit: extractApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await employeeService.deleteEmployeeById(deleteTarget.employee_id);
      setDeleteTarget(null);
      loadEmployees();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const openModal = () => {
    setForm(initialFormState);
    setFormErrors({});
    setModalOpen(true);
  };

  if (loading) return <Loading text="Loading employees..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <p className="page-subtitle">Manage your organization's employee records</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadEmployees} />}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users size={20} /> All Employees ({employees.length})
          </h2>
          <button className="btn btn-primary" onClick={openModal}>
            <UserPlus size={18} /> Add Employee
          </button>
        </div>

        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees yet"
            message="Get started by adding your first employee."
            action={<button className="btn btn-primary" onClick={openModal}><UserPlus size={18} /> Add Employee</button>}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td><strong>{emp.employee_id}</strong></td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td><span className="badge badge-department">{emp.department}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/attendance?employee=${emp.employee_id}`)} title="View Attendance">
                          <Eye size={16} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(emp)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Employee"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Employee'}
          </button>
        </>}
      >
        <form onSubmit={handleSubmit}>
          {formErrors.submit && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{formErrors.submit}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee ID *</label>
              <input type="text" name="employee_id" className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
                placeholder="e.g. EMP001" value={form.employee_id} onChange={handleChange} />
              {formErrors.employee_id && <p className="form-error">{formErrors.employee_id}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select name="department" className={`form-select ${formErrors.department ? 'error' : ''}`}
                value={form.department} onChange={handleChange}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {formErrors.department && <p className="form-error">{formErrors.department}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" name="full_name" className={`form-input ${formErrors.full_name ? 'error' : ''}`}
              placeholder="Enter full name" value={form.full_name} onChange={handleChange} />
            {formErrors.full_name && <p className="form-error">{formErrors.full_name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" name="email" className={`form-input ${formErrors.email ? 'error' : ''}`}
              placeholder="Enter email" value={form.email} onChange={handleChange} />
            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={<>Delete <strong>{deleteTarget?.full_name}</strong>? This removes all their attendance records too.</>}
        confirmText="Delete"
        isDangerous
        isLoading={deleting}
      />
    </div>
  );
}

export default Employees;
