'use client';

import { useState, useEffect, FormEvent } from 'react';
import { auth, db } from '@/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { AvatarGenerator } from 'random-avatar-generator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const router = useRouter();

  const generateRandomAvatar = (): string => {
    const generator = new AvatarGenerator();
    return generator.generateRandomAvatar();
  };

  const handleRefreshAvatar = () => {
    setAvatarUrl(generateRandomAvatar());
  };

  useEffect(() => {
    setAvatarUrl(generateRandomAvatar());
  }, []);

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim() || !emailRegex.test(email)) newErrors.email = 'Invalid email address';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setLoading(true);
    try {
      if (validateForm()) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          name,
          email,
          avatarUrl,
          status: 'online',
        });
        toast.success('User registered successfully');
        router.push('/');
        setErrors({});
      }
    } catch (error: any) {
      console.error('Error registering user:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists');
      } else {
        toast.error(error.message);
      }
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

        {/* Avatar display and refresh */}
      {/* Avatar display and refresh */}
        <div className="flex items-center space-y-2 justify-between border border-gray-200 p-2">
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar" className="rounded-full h-20 w-20" />
          )}
          <button type="button" className="btn btn-outline" onClick={handleRefreshAvatar}>
            New Avatar
          </button>
        </div>


        {/* Name input */}
        <div>
          <label className="label">
            <span className="text-base label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            className="w-full input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
        </div>

        {/* Email input */}
        <div>
          <label className="label">
            <span className="text-base label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            className="w-full input input-bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
        </div>

        {/* Password input */}
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

        {/* Confirm Password input */}
        <div>
          <label className="label">
            <span className="text-base label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full input input-bordered"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword}</span>}
        </div>

        {/* Submit button */}
        <div>
          <button type="submit" className="btn btn-block bg-[#0b3a65ff] text-white">
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign Up'}
          </button>
        </div>

        <span>
          Already have an account?{' '}
          <Link href="/pages/login" className="text-blue-600 hover:text-blue-800 hover:underline">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Register;











// 'use client';

// import { use, useState } from 'react';
// import { auth } from '@/firebase/config';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { useRouter } from 'next/navigation';


// export default function AuthForm() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null); 
//     try{
//         if (isLogin) {
//             await signInWithEmailAndPassword(auth, email, password);
//             router.push('/chat'); // Redirect to home after login
//           } else {
//             await createUserWithEmailAndPassword(auth, email, password);
//             router.push('/');
//           }
//     } catch (err: any) {
//         if (err.code === 'auth/invalid-credential') {
//           setError('INVALID_LOGIN_CREDENTIALS');
//         } else if (err.code === 'auth/user-not-found') {
//           setError('No user found with this email.');
//         } else if (err.code === 'auth/wrong-password') {
//           setError('Wrong password.');
//         } else {
//           setError(err.message); // fallback to Firebase's default message
//         }
//       }

//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-sm mx-auto mt-10">
//       <h1 className="text-xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h1>
//       {error && (
//         <p className="text-red-600 text-sm">{error}</p>
//       )}
//       <input
//         type="email"
//         placeholder="Email"
//         className="w-full p-2 border rounded"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         className="w-full p-2 border rounded"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button className="w-full bg-blue-600 text-white p-2 rounded">
//         {isLogin ? 'Login' : 'Sign Up'}
//       </button>
//       <p className="text-sm text-center text-gray-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
//         {isLogin ? 'No account? Sign up' : 'Already have an account? Log in'}
//       </p>
//     </form>
//   );
// }
