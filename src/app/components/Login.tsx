"use client";

import { useState, FormEvent } from 'react';
import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormErrors {
  email?: string;
  password?: string;
}

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: FormErrors = {};
    
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setLoading(true);

    try {
      if (validateForm()) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
          toast.success('Login successful!');
          router.push('/');
        }

        setErrors({});
      }
    } catch (error: any) {
      console.error('Error logging in user:', error.message);
      toast.error(error.message);
      setErrors({});
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl shadow-lg p-10">
        <h1 className="font-secondary text-xl text-center font-semibold text-[#0b3a65ff]">
          CHITTER <span className="font-bold text-[#eeab63ff]">CHATTER</span>
        </h1>

        {/* Email */}
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="text"
            placeholder="Email"
            className="w-full input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        {/* Password */}
        <div>
          <label className="label">
            <span className="text-base label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className="text-red-500">{errors.password}</span>}
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="btn btn-block bg-[#0b3a65ff] text-white">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign In'}
          </button>
          <input
            type="submit"
            className="hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }}
          />
        </div>

        {/* Link to Register */}
        <span>
          Don't have an account?{' '}
          <Link href="/pages/register" className="text-blue-600 hover:text-blue-800 hover:underline">
            Register
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Login;
