import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Check, X, TrendingUp, UserCheck } from 'lucide-react';
import {
  employeeService,
  attendanceService,
  extractApiErrorMessage,
} from '../services/api';
import { Loading, ErrorMessage } from '../components';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [empStats, setEmpStats] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employeeResponse, attendanceResponse] = await Promise.all([
        employeeService.fetchAllEmployees(),
        attendanceService.fetchAttendanceRecords(),
      ]);

      const employeeList = employeeResponse.employees || [];
      const attendanceList = attendanceResponse.attendance || [];

      setEmployees(employeeList);
      setAttendance(attendanceList);

      const employeeAttendanceStats = employeeList.map((employee) => {
        const recordsForEmployee = attendanceList.filter(
          (record) => record.employee_id === employee.employee_id
        );

        const presentDaysCount = recordsForEmployee.filter(
          (record) => record.status === 'Present'
        ).length;

        const absentDaysCount = recordsForEmployee.filter(
          (record) => record.status === 'Absent'
        ).length;

        const totalDaysCount = recordsForEmployee.length;

        const attendanceRate =
          totalDaysCount > 0
            ? Math.round((presentDaysCount / totalDaysCount) * 100)
            : 0;

        return {
          employee_id: employee.employee_id,
          full_name: employee.full_name,
          department: employee.department,
          presentDays: presentDaysCount,
          absentDays: absentDaysCount,
          totalDays: totalDaysCount,
          rate: attendanceRate,
        };
      });

      setEmpStats(
        employeeAttendanceStats.sort(
          (first, second) => second.presentDays - first.presentDays
        )
      );
    } catch (e) {
      setError(extractApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const totalPresent = attendance.filter(a => a.status === 'Present').length;
  const totalAbsent = attendance.filter(a => a.status === 'Absent').length;
  const avgRate = empStats.length > 0 
    ? Math.round(empStats.reduce((sum, e) => sum + e.rate, 0) / empStats.length)
    : 0;

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of HR metrics</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

      {/* summary stats */}
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => navigate('/employees')}>
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate('/attendance')}>
          <div className="stat-icon purple"><Calendar size={24} /></div>
          <div className="stat-value">{attendance.length}</div>
          <div className="stat-label">Attendance Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Check size={24} /></div>
          <div className="stat-value">{totalPresent}</div>
          <div className="stat-label">Total Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><X size={24} /></div>
          <div className="stat-value">{totalAbsent}</div>
          <div className="stat-label">Total Absent</div>
        </div>
      </div>

      {/* avg attendance rate */}
      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div className="card-header" style={{borderBottom: 'none', marginBottom: 0, paddingBottom: 0}}>
          <h2 className="card-title"><TrendingUp size={20} /> Average Attendance Rate</h2>
        </div>
        <div style={{padding: '1rem 0'}}>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${avgRate}%`}}></div>
          </div>
          <p style={{textAlign: 'center', marginTop: '0.5rem', color: '#64748b'}}>{avgRate}%</p>
        </div>
      </div>

      {/* present days per employee */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><UserCheck size={20} /> Present Days by Employee</h2>
        </div>

        {empStats.length === 0 ? (
          <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>No employees yet</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {empStats.map(s => (
                  <tr key={s.employee_id}>
                    <td>
                      <strong>{s.full_name}</strong>
                      <br /><small style={{color: '#64748b'}}>{s.employee_id}</small>
                    </td>
                    <td>{s.department}</td>
                    <td><span className="badge badge-present">{s.presentDays}</span></td>
                    <td><span className="badge badge-absent">{s.absentDays}</span></td>
                    <td>{s.totalDays}</td>
                    <td>
                      <div className="mini-progress">
                        <div className="mini-progress-fill" style={{width: `${s.rate}%`}}></div>
                      </div>
                      <small>{s.rate}%</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
