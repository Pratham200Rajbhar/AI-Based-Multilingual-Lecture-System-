import { useState, useRef } from 'react';
import { bulkAPI, exportAPI } from '../../services/api';
import { HiArrowUpTray, HiArrowDownTray, HiUserGroup, HiTrash, HiDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function BulkOperations() {
  const [tab, setTab] = useState('import');
  const [csvFile, setCsvFile] = useState(null);
  const [parsedUsers, setParsedUsers] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef();

  // Bulk delete
  const [deleteIds, setDeleteIds] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleParseCsv = async () => {
    if (!csvFile) return toast.error('Select a CSV file');
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await bulkAPI.parseCsv(formData);
      setParsedUsers(res.data.users || []);
      toast.success(`Parsed ${res.data.users?.length || 0} users`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse CSV');
    }
  };

  const handleBulkCreate = async () => {
    if (parsedUsers.length === 0) return toast.error('No users to import');
    setImporting(true);
    try {
      const res = await bulkAPI.createUsers({ users: parsedUsers });
      setResults(res.data);
      toast.success(`Created ${res.data.created || parsedUsers.length} users`);
      setParsedUsers([]);
      setCsvFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk create failed');
    } finally { setImporting(false); }
  };

  const handleBulkDelete = async () => {
    const ids = deleteIds.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return toast.error('Enter user IDs');
    if (!confirm(`Delete ${ids.length} users?`)) return;
    setDeleting(true);
    try {
      const res = await bulkAPI.deleteUsers({ userIds: ids });
      toast.success(`Deleted ${res.data.deleted || ids.length} users`);
      setDeleteIds('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setDeleting(false); }
  };

  const handleExport = async (type) => {
    try {
      let res;
      if (type === 'students') res = await exportAPI.students();
      else if (type === 'audit') res = await exportAPI.auditLogs();
      
      const data = res.data;
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Bulk Operations</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('import')} className={tab === 'import' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          <HiArrowUpTray className="h-4 w-4 inline mr-1" /> Import Users
        </button>
        <button onClick={() => setTab('delete')} className={tab === 'delete' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          <HiTrash className="h-4 w-4 inline mr-1" /> Bulk Delete
        </button>
        <button onClick={() => setTab('export')} className={tab === 'export' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          <HiArrowDownTray className="h-4 w-4 inline mr-1" /> Export Data
        </button>
      </div>

      {tab === 'import' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-medium mb-4">Import Users from CSV</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">CSV format: <code className="bg-gray-200 px-1 rounded">name,email,password,role</code></p>
              <p className="text-xs text-gray-500">Roles: student, professor, dept_admin, inst_admin</p>
              <p className="text-xs text-gray-500">Max 500 users per batch</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={e => setCsvFile(e.target.files?.[0])}
                className="input-field flex-1"
              />
              <button onClick={handleParseCsv} className="btn-secondary" disabled={!csvFile}>
                Parse CSV
              </button>
            </div>
          </div>

          {parsedUsers.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">Preview ({parsedUsers.length} users)</h3>
                <button onClick={handleBulkCreate} disabled={importing} className="btn-primary text-sm">
                  {importing ? 'Importing...' : `Import ${parsedUsers.length} Users`}
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="table-clean">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th></tr>
                  </thead>
                  <tbody>
                    {parsedUsers.slice(0, 50).map((u, i) => (
                      <tr key={i}>
                        <td>{u.name}</td>
                        <td className="text-sm text-gray-500">{u.email}</td>
                        <td><span className="badge bg-gray-100 text-gray-700 text-xs">{u.role}</span></td>
                      </tr>
                    ))}
                    {parsedUsers.length > 50 && (
                      <tr><td colSpan={3} className="text-center text-sm text-gray-400">... and {parsedUsers.length - 50} more</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && (
            <div className="card p-4 bg-green-50 border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Import Results</h3>
              <p className="text-sm text-green-700">Created: {results.created || 0} users</p>
              {results.errors?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">Errors: {results.errors.length}</p>
                  <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                    {results.errors.slice(0, 5).map((e, i) => <li key={i}>{e.email}: {e.error}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'delete' && (
        <div className="card p-6">
          <h2 className="font-medium mb-4">Bulk Delete Users</h2>
          <p className="text-sm text-gray-500 mb-4">Enter user IDs separated by commas</p>
          <textarea
            value={deleteIds}
            onChange={e => setDeleteIds(e.target.value)}
            className="input-field mb-4"
            rows={4}
            placeholder="user_id_1, user_id_2, user_id_3..."
          />
          <button onClick={handleBulkDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700">
            {deleting ? 'Deleting...' : 'Delete Users'}
          </button>
        </div>
      )}

      {tab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6 text-center">
            <HiUserGroup className="h-10 w-10 mx-auto text-blue-500 mb-3" />
            <h3 className="font-medium mb-2">Export Students</h3>
            <p className="text-sm text-gray-500 mb-4">Download all student data</p>
            <button onClick={() => handleExport('students')} className="btn-primary text-sm">
              <HiArrowDownTray className="h-4 w-4 inline mr-1" /> Download
            </button>
          </div>
          <div className="card p-6 text-center">
            <HiDocumentText className="h-10 w-10 mx-auto text-purple-500 mb-3" />
            <h3 className="font-medium mb-2">Export Audit Logs</h3>
            <p className="text-sm text-gray-500 mb-4">Download system audit logs</p>
            <button onClick={() => handleExport('audit')} className="btn-primary text-sm">
              <HiArrowDownTray className="h-4 w-4 inline mr-1" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
