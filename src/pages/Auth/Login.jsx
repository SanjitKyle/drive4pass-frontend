import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';

// const TEST_USERS = {
//   admin: {
//     email: 'admin@drivingschool.com',
//     password: 'admin123',
//   },
//   instructor: {
//     email: 'instructor@drivingschool.com',
//     password: 'instructor123',
//   },
//   learner: {
//     email: 'learner@drivingschool.com',
//     password: 'learner123',
//   },
// };

export default function Login() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const isMounted = useRef(true);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMounted.current) {
      setLoading(true);
      setError('');
    }

    try {
      const data = await AuthService.login({ email, password, role });
      // console.log('Login successful:', data);
      // return;
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userId', data.user.email);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') navigate('/');
      if (data.user.role === 'instructor') navigate('/diary');
      if (data.user.role === 'learner') navigate('/calendar');

    } catch (err) {
      if (isMounted.current) setError(err.message || 'Login failed');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   const user = TEST_USERS[role];

  //   setTimeout(() => {
  //     if (email === user.email && password === user.password) {
  //       const authKey = 'TEST_AUTH_KEY_123456';

  //       localStorage.setItem('authKey', authKey);
  //       localStorage.setItem('role', role);
  //       localStorage.setItem('userEmail', email);

  //       // 🔀 Redirect based on role
  //       if (role === 'admin') navigate('/');
  //       if (role === 'instructor') navigate('/diary');
  //       if (role === 'learner') navigate('/calendar');
  //     } else {
  //       setError('Invalid email or password');
  //     }

  //     setLoading(false);
  //   }, 800);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0b0f19] px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tl from-blue-500/20 to-teal-400/20 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#EDEEF2] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="drive4passlogo.jpeg" alt="Drive4Pass Logo" className="h-20 w-auto object-contain " />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Drive4Pass Dashboard Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Profile Role
            </label>
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer appearance-none font-medium hover:border-slate-300"
              >
                <option value="admin">Admin Portal</option>
                <option value="instructor">Instructor Portal</option>
                <option value="learner">Learner Portal</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              placeholder="name@drivingschool.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium hover:border-slate-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium hover:border-slate-300"
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
