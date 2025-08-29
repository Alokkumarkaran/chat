import React, { useState } from 'react';
import API, { saveTokenLocal } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await API.post('/api/auth/login', { username, password });
      saveTokenLocal(res.data.token);
      nav('/');
    } catch (error) {
      setErr(error?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="logo" className="w-10 h-10" />
          <h1 className="text-2xl font-semibold">SkillChat</h1>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full p-3 border rounded-lg" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input type="password" className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-red-500">{err}</div>}
          <button className="w-full py-3 bg-primary text-white rounded-lg">Login</button>
        </form>
        <div className="mt-4 text-sm text-center">
          Don't have an account? <Link to="/register" className="text-primary">Register</Link>
        </div>
      </div>
    </div>
  );
}
