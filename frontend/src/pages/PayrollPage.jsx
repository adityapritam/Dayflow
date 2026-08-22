import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { DollarSign, Download, Edit3, ShieldAlert, CheckCircle, FileText } from 'lucide-react';

export const PayrollPage = () => {
  const { activeRoleView } = useAuth();
  const isAdmin = activeRoleView === 'ADMIN';

  const [salaryStructure, setSalaryStructure] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEmployeeSalary, setEditEmployeeSalary] = useState(null);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);

  // Form states for salary edit
  const [baseSalaryInput, setBaseSalaryInput] = useState('');
  const [allowancesInput, setAllowancesInput] = useState('');
  const [deductionsInput, setDeductionsInput] = useState('');

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const data = await api.getAllPayrolls();
        setPayrolls(data.payrolls);
      } else {
        const data = await api.getMyPayroll();
        setSalaryStructure(data.salaryStructure);
        setPayrolls(data.payrolls);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [isAdmin]);

  const handleOpenSalaryEdit = (payroll) => {
    setEditEmployeeSalary(payroll.employee);
    setBaseSalaryInput(payroll.employee.baseSalary);
    setAllowancesInput(payroll.employee.allowances);
    setDeductionsInput(payroll.employee.deductions);
    setSalaryModalOpen(true);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    try {
      await api.updateSalaryStructure(editEmployeeSalary.id, {
        baseSalary: baseSalaryInput,
        allowances: allowancesInput,
        deductions: deductionsInput,
      });
      setSalaryModalOpen(false);
      fetchPayrollData();
    } catch (err) {
      alert(err.message || 'Failed to update salary structure.');
    }
  };

  const handleToggleStatus = async (payrollId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
      await api.updatePayrollStatus(payrollId, { status: nextStatus });
      fetchPayrollData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status.');
    }
  };

  const handleDownloadPayslip = (p) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download payslips.');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip_Month_${p.month}_${p.year}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #171816; background-color: #FFFFFF; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2D4A3E; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 700; color: #2D4A3E; }
            .title { text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .section-title { font-weight: 700; text-transform: uppercase; font-size: 12px; color: #888A83; letter-spacing: 0.05em; border-bottom: 1px solid #E6E4DD; padding-bottom: 5px; margin-bottom: 10px; }
            .payroll-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .payroll-table th, .payroll-table td { padding: 12px; border-bottom: 1px solid #E6E4DD; text-align: left; }
            .payroll-table th { font-weight: 700; text-transform: uppercase; font-size: 11px; color: #565852; background-color: #F5F4EE; }
            .total-row { font-size: 18px; font-weight: 700; color: #2D4A3E; background-color: #EBF2EE; }
            .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #888A83; border-top: 1px solid #E6E4DD; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Dayflow HRMS</div>
            <div class="title">
              <h2 style="margin: 0; font-size: 20px;">MONTHLY PAYSLIP</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #888A83;">Period: Month ${p.month}, ${p.year}</p>
            </div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Employee Details</div>
              <strong>${p.employee?.firstName || 'Staff'} ${p.employee?.lastName || 'Member'}</strong><br/>
              Job Title: ${p.employee?.jobTitle || 'Associate'}<br/>
              Department: ${p.employee?.department || 'Operations'}<br/>
              Employee ID: ${p.employee?.user?.employeeId || 'N/A'}
            </div>
            <div style="text-align: right;">
              <div class="section-title">Payment Info</div>
              Payment Date: ${p.paymentDate || 'Pending'}<br/>
              Status: <span style="font-weight: 700; color: ${p.status === 'PAID' ? '#059669' : '#D97706'}">${p.status}</span><br/>
              Reference ID: ${p.id.substring(0, 8).toUpperCase()}
            </div>
          </div>

          <table class="payroll-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly Base Pay</td>
                <td style="text-align: right;">$${Math.round(p.baseSalary).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Allowances</td>
                <td style="text-align: right; color: #059669;">+$${Math.round(p.allowances).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Deductions</td>
                <td style="text-align: right; color: #DC2626;">-$${Math.round(p.deductions).toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Net Disbursed Pay</td>
                <td style="text-align: right;">$${Math.round(p.netSalary).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This is a system generated document. For verification or inquiries, contact HR department.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Salary Breakdown Summary Card for Employee */}
      {!isAdmin && salaryStructure && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83', letterSpacing: '0.05em' }}>
            Official Salary Structure (Read-Only)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div style={{ backgroundColor: '#EBF2EE', border: '1px solid #C2D6CA', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#2D4A3E', fontWeight: '700', textTransform: 'uppercase' }}>Annual Net Salary</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2D4A3E', marginTop: '0.25rem' }}>
                ${salaryStructure.netSalary.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#F7F6F2', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#565852', fontWeight: '600' }}>Annual Base</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
                ${salaryStructure.baseSalary.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#F7F6F2', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#565852', fontWeight: '600' }}>Allowances</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669', marginTop: '0.25rem' }}>
                +${salaryStructure.allowances.toLocaleString()}
              </div>
            </div>

            <div style={{ backgroundColor: '#F7F6F2', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#565852', fontWeight: '600' }}>Deductions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#DC2626', marginTop: '0.25rem' }}>
                -${salaryStructure.deductions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E4DD',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
            {isAdmin ? 'Company Payroll Management' : 'Monthly Payslip Records'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#565852', marginTop: '0.15rem' }}>
            {isAdmin ? 'Manage employee base salaries, allowances, and payment states.' : 'Historical monthly salary paystubs and disbursement statuses.'}
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Pay Period</th>
              <th>Base Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Disbursement</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  Loading payroll records...
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  No payroll records found.
                </td>
              </tr>
            ) : (
              payrolls.map((p) => (
                <tr key={p.id}>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={p.employee?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt="Avatar"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#171816' }}>
                            {p.employee?.firstName} {p.employee?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888A83' }}>
                            {p.employee?.user?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  <td>
                    <div style={{ fontWeight: '600', color: '#171816' }}>
                      Month {p.month}, {p.year}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#565852' }}>
                      ${Math.round(p.baseSalary).toLocaleString()}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: '500' }}>
                      +${Math.round(p.allowances).toLocaleString()}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#DC2626', fontWeight: '500' }}>
                      -${Math.round(p.deductions).toLocaleString()}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#2D4A3E' }}>
                      ${Math.round(p.netSalary).toLocaleString()}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#565852' }}>
                      {p.paymentDate || 'Pending'}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={p.status} />
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {isAdmin ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Mark {p.status === 'PAID' ? 'Pending' : 'Paid'}
                        </button>
                        <button
                          onClick={() => handleOpenSalaryEdit(p)}
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Edit3 size={12} /> Edit Structure
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadPayslip(p)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                      >
                        <Download size={14} /> Payslip PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Salary Structure Modal for Admin */}
      {salaryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E6E4DD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
                Update Salary Structure
              </h3>
              <button onClick={() => setSalaryModalOpen(false)} style={{ color: '#888A83' }}>✕</button>
            </div>

            <form onSubmit={handleSaveSalary} style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#171816', marginBottom: '1rem' }}>
                Employee: {editEmployeeSalary?.firstName} {editEmployeeSalary?.lastName}
              </div>

              <div className="form-group">
                <label className="form-label">Annual Base Salary ($)</label>
                <input
                  type="number"
                  value={baseSalaryInput}
                  onChange={(e) => setBaseSalaryInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Allowances ($)</label>
                <input
                  type="number"
                  value={allowancesInput}
                  onChange={(e) => setAllowancesInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Deductions ($)</label>
                <input
                  type="number"
                  value={deductionsInput}
                  onChange={(e) => setDeductionsInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setSalaryModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
